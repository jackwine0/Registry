import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getHeroById } from '../api/Api';
import { 
  FaFingerprint, 
  FaShieldAlt, 
  FaChartBar, 
  FaGlobeAmericas, 
  FaUserSecret, 
  FaBolt,
  FaDatabase
} from 'react-icons/fa';
import './Details.css';

const Details = () => {
  const { id } = useParams();
  const [agentProfile, setAgentProfile] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [accessError, setAccessError] = useState(null);

  useEffect(() => {
    const retrieveAgentFile = async () => {
      try {
        const profile = await getHeroById(id);
        setAgentProfile(profile);
      } catch (err) {
        setAccessError(err.message);
      } finally {
        setIsDecrypting(false);
      }
    };
    
    retrieveAgentFile();
  }, [id]);

const determineThreatIndex = () => {
  if (!agentProfile?.powerstats) return 0;
  
  const {
    intelligence = "0",
    strength = "0",
    speed = "0",
    durability = "0",
    power = "0",
    combat = "0"
  } = agentProfile.powerstats;

  // Convert all stats to numbers and sum them
  const total = 
    (parseInt(intelligence) || 0) +
    (parseInt(strength) || 0) +
    (parseInt(speed) || 0) +
    (parseInt(durability) || 0) +
    (parseInt(power) || 0) +
    (parseInt(combat) || 0);

  // Now with 6 stats (max 100 each), total max is 600
  // We'll keep the 0-5 scale but adjust the divisor to 120 (600/5)
  return Math.min(Math.floor(total / 120), 5);
};
  if (isDecrypting) return (
    <div className="cipher-decoding">
      <div className="decrypt-anim">
        <FaDatabase className="decode-icon" />
        <p>DECODING ENCRYPTED PROFILE...</p>
      </div>
    </div>
  );

  if (accessError) return (
    <div className="clearance-error">
      <p>ACCESS RESTRICTED: {accessError}</p>
    </div>
  );

  if (!agentProfile) return (
    <div className="clearance-error">
      <p>PROFILE RECORD DOES NOT EXIST</p>
    </div>
  );

  return (
    <div className="intel-profile">
      <div className="clearance-strip">
        <span>TOP SECRET//EYES ONLY</span>
        <span>PROFILE #: {agentProfile.id}</span>
      </div>

      <div className="profile-display">
        <div className="id-display">
          <div className="visual-id">
            <img 
              src={agentProfile.image.url} 
              alt={agentProfile.name} 
              className="id-visual"
            />
            <div className="biometric-confirm">
              <FaFingerprint className="bio-icon" />
              <span>BIOMETRIC VERIFIED</span>
            </div>
          </div>

          <div className="identity-panel">
            <h1 className="operational-name">{agentProfile.name}</h1>
            <h2 className="civilian-id">
              <FaUserSecret />
              {agentProfile.biography['full-name'] || 'IDENTITY REDACTED'}
            </h2>
            
            <div className="risk-panel">
              <div className="risk-level">
                <FaShieldAlt />
                <span>RISK INDEX: </span>
                <span className="risk-value">{determineThreatIndex()}/5</span>
              </div>
              <div className="risk-meter">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`risk-unit ${i < determineThreatIndex() ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="data-sections">
          <section className="stats-section">
            <h3><FaChartBar /> CAPACITY ANALYSIS</h3>
            <div className="metrics-display">
              {Object.entries(agentProfile.powerstats).map(([stat, value]) => (
                <div key={stat} className="stat-row">
                  <div className="stat-name">{stat.toUpperCase()}</div>
                  <div className="stat-graph">
                    <div 
                      className="stat-level" 
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                  <div className="stat-number">{value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bio-section">
            <h3><FaGlobeAmericas /> PERSONAL RECORD</h3>
            <div className="bio-fields">
              <div className="bio-field">
                <span className="field-label">ALIASES:</span>
                <span>{agentProfile.biography.aliases.join(', ') || 'NONE RECORDED'}</span>
              </div>
              <div className="bio-field">
                <span className="field-label">ORIGIN POINT:</span>
                <span>{agentProfile.biography['place-of-birth'] || 'UNKNOWN'}</span>
              </div>
              <div className="bio-field">
                <span className="field-label">ALLEGIANCE:</span>
                <span>{agentProfile.biography.alignment || 'UNCONFIRMED'}</span>
              </div>
              <div className="bio-field">
                <span className="field-label">INITIAL CONTACT:</span>
                <span>{agentProfile.biography['first-appearance'] || 'CLASSIFIED'}</span>
              </div>
            </div>
          </section>

          <section className="ops-section">
            <h3><FaBolt /> OPERATIONAL BRIEF</h3>
            <div className="ops-fields">
              {agentProfile.work.occupation && (
                <div className="ops-field">
                  <span className="field-label">COVER IDENTITY:</span>
                  <span>{agentProfile.work.occupation}</span>
                </div>
              )}
              {agentProfile.connections['group-affiliation'] && (
                <div className="ops-field">
                  <span className="field-label">KNOWN NETWORKS:</span>
                  <span>{agentProfile.connections['group-affiliation']}</span>
                </div>
              )}
              {agentProfile.connections.relatives && (
                <div className="ops-field">
                  <span className="field-label">ASSOCIATED ENTITIES:</span>
                  <span>{agentProfile.connections.relatives}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="security-footer">
        <span>CONTAINS SENSITIVE COMPARTMENTED INFORMATION</span>
        <span>UNAUTHORIZED REVIEW CONSTITUTES ESPIONAGE</span>
      </div>
    </div>
  );
};

export default Details;