"""
PlanMyShaadi — AI Service
All Claude API logic lives here.
Generates Budget / Standard / Premium event plans
and injects real vendor data from the database.
"""

import json
import httpx
from django.conf import settings
from django.core.cache import cache


SYSTEM_PROMPT = """
You are an expert Indian wedding and event planning assistant for PlanMyShaadi.
You help users plan events like Shaadi (Wedding), Mehndi, Haldi, Birthday,
Baby Shower, Griha Pravesh, Anniversary, and Graduation.

When the user gives you event type, city, guest count and budget,
you MUST respond with ONLY a valid JSON object in this exact format.
No extra text, no markdown, no explanation. Only JSON.

{
  "summary": "2 line summary of the event plan",
  "plans": {
    "budget": {
      "label": "Budget Plan",
      "total": 500000,
      "description": "Simple and elegant plan within tight budget",
      "breakdown": [
        {"category": "Venue",            "amount": 100000, "tip": "Book a community hall or garden"},
        {"category": "Catering",         "amount": 150000, "tip": "800 per plate x 200 guests"},
        {"category": "Photography",      "amount": 30000,  "tip": "Local candid photographer"},
        {"category": "Decoration",       "amount": 50000,  "tip": "Simple floral decor"},
        {"category": "Makeup & Mehndi",  "amount": 20000,  "tip": "Package deal from local artist"},
        {"category": "DJ & Music",       "amount": 25000,  "tip": "DJ for 4 hours"},
        {"category": "Miscellaneous",    "amount": 125000, "tip": "Invites, transport, gifts"}
      ],
      "checklist": [
        {"task": "Book venue",            "timeline": "6 months before"},
        {"task": "Hire photographer",     "timeline": "5 months before"},
        {"task": "Finalize catering",     "timeline": "4 months before"},
        {"task": "Book decorator",        "timeline": "3 months before"},
        {"task": "Send invitations",      "timeline": "2 months before"},
        {"task": "Book mehndi artist",    "timeline": "6 weeks before"},
        {"task": "Final dress fitting",   "timeline": "1 month before"},
        {"task": "Confirm all vendors",   "timeline": "1 week before"}
      ]
    },
    "standard": {
      "label": "Standard Plan",
      "total": 1000000,
      "description": "Comfortable plan with good quality vendors",
      "breakdown": [
        {"category": "Venue",            "amount": 200000, "tip": "Banquet hall with AC"},
        {"category": "Catering",         "amount": 250000, "tip": "1000 per plate x 250 guests"},
        {"category": "Photography",      "amount": 60000,  "tip": "Professional with drone shots"},
        {"category": "Decoration",       "amount": 120000, "tip": "Full floral and lighting setup"},
        {"category": "Makeup & Mehndi",  "amount": 40000,  "tip": "Experienced bridal artist"},
        {"category": "DJ & Music",       "amount": 50000,  "tip": "DJ with sound system"},
        {"category": "Miscellaneous",    "amount": 280000, "tip": "Invites, transport, favors"}
      ],
      "checklist": [
        {"task": "Book venue",            "timeline": "8 months before"},
        {"task": "Hire photographer",     "timeline": "6 months before"},
        {"task": "Finalize catering",     "timeline": "5 months before"},
        {"task": "Book decorator",        "timeline": "4 months before"},
        {"task": "Book makeup artist",    "timeline": "3 months before"},
        {"task": "Send invitations",      "timeline": "2 months before"},
        {"task": "Book mehndi artist",    "timeline": "6 weeks before"},
        {"task": "Final dress fitting",   "timeline": "1 month before"},
        {"task": "Confirm all vendors",   "timeline": "1 week before"}
      ]
    },
    "premium": {
      "label": "Premium Plan",
      "total": 2000000,
      "description": "Luxury plan with top-tier vendors and full experience",
      "breakdown": [
        {"category": "Venue",            "amount": 500000, "tip": "Heritage palace or 5-star hotel"},
        {"category": "Catering",         "amount": 500000, "tip": "1500 per plate x 300 guests"},
        {"category": "Photography",      "amount": 150000, "tip": "Award-winning studio with cinematic film"},
        {"category": "Decoration",       "amount": 300000, "tip": "Luxury floral, lighting, and props"},
        {"category": "Makeup & Mehndi",  "amount": 80000,  "tip": "Celebrity makeup artist"},
        {"category": "DJ & Music",       "amount": 100000, "tip": "Live band + DJ"},
        {"category": "Miscellaneous",    "amount": 370000, "tip": "Premium invites, vintage cars, gifts"}
      ],
      "checklist": [
        {"task": "Book venue",            "timeline": "12 months before"},
        {"task": "Hire photographer",     "timeline": "10 months before"},
        {"task": "Finalize catering",     "timeline": "8 months before"},
        {"task": "Book decorator",        "timeline": "6 months before"},
        {"task": "Book makeup artist",    "timeline": "4 months before"},
        {"task": "Send invitations",      "timeline": "3 months before"},
        {"task": "Book mehndi artist",    "timeline": "2 months before"},
        {"task": "Final dress fitting",   "timeline": "6 weeks before"},
        {"task": "Confirm all vendors",   "timeline": "2 weeks before"}
      ]
    }
  },
  "vendor_categories_needed": [
    "PHOTOGRAPHER", "DECORATOR", "CATERER",
    "VENUE", "DJ_MUSIC", "MAKEUP", "MEHNDI"
  ]
}

Scale the amounts according to the actual budget and guest count given.
Always return all 3 plans. Only respond with JSON.
"""


def get_vendor_suggestions(city: str, categories: list) -> list:
    """
    Fetch real verified vendors from DB based on city and categories.
    Result is cached in Redis for 10 minutes.
    """
    cache_key = f"ai_vendors_{city.lower()}_{'-'.join(sorted(categories))}"
    cached    = cache.get(cache_key)
    if cached is not None:
        return cached

    from vendors.models import VendorProfile

    vendors = list(
        VendorProfile.objects
        .filter(
            city__icontains=city,
            category__in=categories,
            is_active=True,
            is_verified=True,
        )
        .order_by("-rating")[:15]
        .values(
            "id",
            "business_name",
            "category",
            "city",
            "starting_price",
            "rating",
            "total_reviews",
            "experience_years",
        )
    )

    cache.set(cache_key, vendors, 600)
    return vendors


def call_claude(messages: list) -> str:
    """
    Send messages to Anthropic Claude API.
    Returns the assistant text response.
    Raises httpx.HTTPError on failure.
    """
    headers = {
        "x-api-key":         settings.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
    }

    payload = {
        "model":      settings.CLAUDE_MODEL,
        "max_tokens": settings.CLAUDE_MAX_TOKENS,
        "system":     SYSTEM_PROMPT,
        "messages":   messages,
    }

    with httpx.Client(timeout=60.0) as client:
        response = client.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        return data["content"][0]["text"]


def generate_event_plan(
    event_type: str,
    city: str,
    budget: int,
    guest_count: int,
    history: list,
) -> dict:
    """
    Core function: calls Claude and returns 3 plans + real vendor suggestions.

    Args:
        event_type:  e.g. "Shaadi", "Birthday"
        city:        e.g. "Jaipur"
        budget:      total budget in INR as integer
        guest_count: number of guests
        history:     list of previous messages [{"role": "user"/"assistant", "content": "..."}]

    Returns:
        {
            "summary":  "...",
            "plans":    { "budget": {...}, "standard": {...}, "premium": {...} },
            "vendors":  [...],   # real vendors from DB
            "raw_text": "..."    # raw Claude response
        }
    """
    user_message = (
        f"Plan a {event_type} in {city} "
        f"for {guest_count} guests "
        f"with a total budget of Rs.{budget:,}. "
        f"Give me Budget, Standard, and Premium plans."
    )

    messages = history + [{"role": "user", "content": user_message}]

    raw_text = call_claude(messages)

    # Strip markdown fences if Claude wraps in ```json ... ```
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        lines   = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1])

    plan_data = json.loads(cleaned)

    # Pull real vendors from DB
    categories = plan_data.get("vendor_categories_needed", [])
    vendors    = get_vendor_suggestions(city, categories)

    return {
        "summary":  plan_data.get("summary", ""),
        "plans":    plan_data.get("plans", {}),
        "vendors":  vendors,
        "raw_text": raw_text,
    }


def build_history_from_db(session) -> list:
    """
    Reconstruct full message history from DB for a session.
    Passed to Claude so it remembers the conversation.
    """
    return [
        {"role": msg.role, "content": msg.content}
        for msg in session.messages.all()
    ]