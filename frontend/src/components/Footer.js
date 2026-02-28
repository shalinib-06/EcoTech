import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <div className="logo-icon">
                <Leaf size={24} />
              </div>
              <span className="logo-text">EcoTech</span>
            </Link>
            <p className="footer-description">
              Empowering sustainable technology choices through AI-powered device evaluation. 
              Join us in reducing e-waste and building a circular economy for electronics.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Github">
                <Github size={18} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href="#" className="social-link" aria-label="Email">
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Product</h4>
            <ul className="footer-links">
              <li><Link to="/evaluate">Device Evaluation</Link></li>
              <li><Link to="/progress">Track Progress</Link></li>
              <li><Link to="/pickup">Schedule Pickup</Link></li>
              <li><a href="#">Pricing</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Resources</h4>
            <ul className="footer-links">
              <li><a href="#">E-Waste Guide</a></li>
              <li><a href="#">Recycling Tips</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Company</h4>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Partners</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} EcoTech. Made with <Heart size={14} style={{ display: 'inline', color: '#e74c3c', verticalAlign: 'middle' }} /> for the planet.
          </p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
