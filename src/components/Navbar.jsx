import React, { useState } from 'react';
import {
  FaDatabase, FaSearch, FaUserSecret, FaGlobeAmericas, FaBars, FaTimes
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const classFilters = [
  { key: 'assets', icon: <FaUserSecret />, label: 'COVERT ASSETS' },
  { key: 'threats', icon: <FaGlobeAmericas />, label: 'GLOBAL THREATS' },
  { key: 'all', icon: null, label: 'ALL ACTIVE' }
];

const Navbar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeClass, setActiveClass] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleClassificationClick = (filterType) => {
    const lower = filterType.toLowerCase();
    setActiveClass(lower);
    navigate(`/classification?filter=${lower}`);
    setIsMenuOpen(false);
  };

  const renderClassFilters = () => (
    classFilters.map(({ key, icon, label }) => (
      <div
        key={key}
        className={`class-item ${activeClass === key ? 'active' : ''}`}
        onClick={() => handleClassificationClick(key)}
      >
        {icon && <span className="class-icon">{icon}</span>}
        <span>{label}</span>
      </div>
    ))
  );

  return (
    <nav className="navbar">
      {/* Header */}
      <div className="agency-header">
        <div className="agency-marker">
          <span className="security-clearance">TOP SECRET</span>
          <span className="agency-code">// SCI//ORCON//NOFORN</span>
        </div>
        <div className="current-date">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }).toUpperCase()}
        </div>
      </div>

      {/* Main */}
      <div className="navbar-main">
        {/* Logo + Title */}
        <div className="navbar-logo-title">
          <FaDatabase className="logo-icon" />
          <div className="title-container">
            <a href="/"><h1 className="navbar-title">THE REGISTRY</h1></a>
            <div className="title-subtext">CENTRAL INTELLIGENCE ARCHIVE</div>
          </div>
        </div>

        {/* Desktop View */}
        <div className="desktop-nav">
          <div className="navbar-classes">{renderClassFilters()}</div>
          <div className="navbar-search-container">
            <input
              type="text"
              placeholder="ENTER CODENAME..."
              className="navbar-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <FaSearch className="search-icon" />
          </div>
        </div>

        {/* Hamburger */}
        <button className="hamburger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Mobile View */}
        <div className={`mobile-nav ${isMenuOpen ? 'responsive' : ''}`}>
          <div className="navbar-classes mobile-classes">{renderClassFilters()}</div>
          <div className="navbar-search-container mobile-search">
            <input
              type="text"
              placeholder="SEARCH ASSETS..."
              className="navbar-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <FaSearch className="search-icon" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="security-info">
        <span>ACCESS RESTRICTED TO AUTHORIZED PERSONNEL ONLY</span>
        <span>UNAUTHORIZED ACCESS PUNISHABLE BY LAW</span>
      </div>
    </nav>
  );
};

export default Navbar;
