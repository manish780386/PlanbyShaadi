from django.db import models


class Event(models.Model):
    """
    Master list of event types supported by PlanMyShaadi.
    e.g. Shaadi, Mehndi, Haldi, Birthday, Baby Shower, etc.
    """
    name        = models.CharField(max_length=100, unique=True)
    slug        = models.SlugField(max_length=100, unique=True)
    icon        = models.CharField(max_length=10, blank=True, help_text="Emoji icon")
    description = models.TextField(blank=True)
    is_active   = models.BooleanField(default=True)
    order       = models.PositiveSmallIntegerField(default=0, help_text="Display order")
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "events"
        ordering = ["order", "name"]

    def __str__(self):
        return self.name