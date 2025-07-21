import React from 'react';
import { FaLock, FaShieldAlt, FaUserSecret } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="security-footer">
      <div className="footer-content">
        <div className="security-warning">
          <FaLock className="footer-icon" />
          <span>CLASSIFIED INFORMATION - EYES ONLY</span>
          <FaShieldAlt className="footer-icon" />
        </div>
        
        <div className="footer-disclaimer">
          <p>
            <FaUserSecret className="icon-small" />
            This system contains privileged information protected under international intelligence sharing agreements.
            Unauthorized access or disclosure is prohibited by law (18 U.S. Code § 798).
          </p>
        </div>
        
        <div className="footer-meta">
          <span>System Version: 7.2.1</span>
          <span>Last Updated: {new Date().toLocaleDateString()}</span>
          <span>Clearance Level: <strong>TOP SECRET//SCI</strong></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;