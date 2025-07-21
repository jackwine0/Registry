import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserSecret,
  FaFingerprint,
  FaEye,
  FaShieldAlt,
} from "react-icons/fa";
import "./HeroCard.css"; // This would be the CSS file containing the styles above

const HeroCard = ({ hero }) => {
  const navigate = useNavigate();

  if (!hero) return null;

  // Calculate threat level percentage (0-100)
  const calculateThreatPercentage = () => {
    const { intelligence = "0", strength = "0", speed = "0" } = hero.powerstats;
    const total =
      (parseInt(intelligence) || 0) +
      (parseInt(strength) || 0) +
      (parseInt(speed) || 0);
    return Math.min(Math.floor((total / 300) * 100), 100);
  };

  const threatPercentage = calculateThreatPercentage();

  const handleCardClick = () => {
    navigate(`/details/${hero.id}`, { state: { hero } });
  };

  // Determine clearance level based on threat percentage
  const getClearanceLevel = () => {
    if (threatPercentage >= 75) return "OMEGA";
    if (threatPercentage >= 50) return "DELTA";
    return "GAMMA";
  };

  return (
    <div className="agent-dossier-card" onClick={handleCardClick}>
      {/* Top security tape */}
      <div className="classification-tape top">TOP SECRET</div>

      {/* Agent photo with verification */}
      <div className="agent-photo-container">
        <img
          src={hero.image.url}
          alt={hero.name}
          className="agent-photo"
          loading="lazy"
        />
        <div className="verification-stamp">
          <FaEye className="verification-icon" />
          <span>VERIFIED</span>
        </div>
      </div>

      {/* Identity section */}
      <div className="identity-section">
        <h2 className="codename">
          <FaUserSecret className="identity-icon" />
          {hero.name.toUpperCase()}
        </h2>
        <p className="full-identity">
          <FaFingerprint className="identity-icon" />
          {hero.biography["full-name"] || "IDENTITY REDACTED"}
        </p>
      </div>

      {/* Threat assessment section */}
      <div className="threat-assessment">
        <div className="threat-header">
          <span className="threat-title">THREAT ASSESSMENT</span>
          <span className="threat-value">{threatPercentage}%</span>
        </div>
        <div className="threat-meter">
          <div
            className="threat-progress"
            style={{ width: `${threatPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <div className="stat-pill intel">
          <div className="stat-label">INT</div>
          <div className="stat-value">
            {hero.powerstats.intelligence || "--"}
          </div>
        </div>
        <div className="stat-pill strength">
          <div className="stat-label">STR</div>
          <div className="stat-value">
            {hero.powerstats.strength || "--"}
          </div>
        </div>
        <div className="stat-pill speed">
          <div className="stat-label">SPD</div>
          <div className="stat-value">
            {hero.powerstats.speed || "--"}
          </div>
        </div>
      </div>

      {/* Clearance level footer */}
      <div className="clearance-level">
        <FaShieldAlt className="clearance-icon" />
        <span>CLEARANCE: {getClearanceLevel()}</span>
      </div>

      {/* Bottom security tape */}
      <div className="classification-tape bottom">EYES ONLY</div>
    </div>
  );
};

export default HeroCard;