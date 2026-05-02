import { Link } from "react-router-dom";
import { Sparkles, Share2, X, Play } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">

        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <div className="footer__logo-icon"><Sparkles size={15} /></div>
            <span>PlanMyShaadi</span>
          </Link>
          <p className="footer__tagline">
            India's smartest event planning platform. Powered by AI, trusted
            by 50,000+ couples across 80+ cities.
          </p>
          <div className="footer__socials">
            <a href="#" className="footer__social"><Share2 size={15} /></a>
            <a href="#" className="footer__social"><X size={15} /></a>
            <a href="#" className="footer__social"><Play size={15} /></a>
          </div>
        </div>

        {/* Links */}
        <div className="footer__links-group">
          <div className="footer__col">
            <div className="footer__col-title">Platform</div>
            <Link to="/vendors"       className="footer__link">Browse Vendors</Link>
            <Link to="/plan"          className="footer__link">AI Planner</Link>
            <Link to="/how-it-works"  className="footer__link">How It Works</Link>
            <Link to="/register"      className="footer__link">Sign Up Free</Link>
          </div>

          <div className="footer__col">
            <div className="footer__col-title">Events</div>
            <Link to="/vendors?event=Shaadi"      className="footer__link">Shaadi / Wedding</Link>
            <Link to="/vendors?event=Mehndi"      className="footer__link">Mehndi</Link>
            <Link to="/vendors?event=Birthday"    className="footer__link">Birthday</Link>
            <Link to="/vendors?event=Baby Shower" className="footer__link">Baby Shower</Link>
            <Link to="/vendors?event=Haldi"       className="footer__link">Haldi</Link>
          </div>

          <div className="footer__col">
            <div className="footer__col-title">Top Cities</div>
            <Link to="/vendors?city=Mumbai"    className="footer__link">Mumbai</Link>
            <Link to="/vendors?city=Delhi"     className="footer__link">Delhi</Link>
            <Link to="/vendors?city=Jaipur"    className="footer__link">Jaipur</Link>
            <Link to="/vendors?city=Bangalore" className="footer__link">Bangalore</Link>
            <Link to="/vendors?city=Udaipur"   className="footer__link">Udaipur</Link>
          </div>

          <div className="footer__col">
            <div className="footer__col-title">For Vendors</div>
            <Link to="/register?role=VENDOR" className="footer__link">List Your Business</Link>
            <Link to="/login"                className="footer__link">Vendor Login</Link>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>© 2025 PlanMyShaadi. All rights reserved.</span>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="#" className="footer__link" style={{ fontSize: 12 }}>Privacy Policy</a>
            <a href="#" className="footer__link" style={{ fontSize: 12 }}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}