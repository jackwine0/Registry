import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserSecret, FaGlobeAmericas, FaDatabase, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getMultipleHeroes } from '../api/Api';
import HeroCard from '../components/HeroCard';
import './ClassificationPage.css';

const ClassificationPage = () => {
  const [heroes, setHeroes] = useState([]);
  const [filteredHeroes, setFilteredHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get filter from URL parameters
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter') || 'all';
    const page = parseInt(params.get('page')) || 1;
    
    setActiveFilter(filter);
    setCurrentPage(page);
    
    // Load heroes data
    const loadHeroes = async () => {
      try {
        const data = await getMultipleHeroes(1, 500); // Load enough heroes for pagination
        setHeroes(data);
        applyFilter(filter, data);
      } catch (error) {
        console.error("Error loading heroes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadHeroes();
  }, [location.search]);

  const applyFilter = (filterType, heroesData = heroes) => {
    let filtered = [];
    
    switch(filterType) {
      case 'assets':
        filtered = heroesData.filter(hero => 
          hero.biography.alignment?.toLowerCase() === 'good'
        );
        break;
      case 'threats':
        filtered = heroesData.filter(hero => 
          hero.biography.alignment?.toLowerCase() === 'bad'
        );
        break;
      case 'all':
      default:
        filtered = [...heroesData];
        break;
    }
    
    setFilteredHeroes(filtered);
    // Reset to first page when filter changes
    if (filterType !== activeFilter) {
      navigate(`/classification?filter=${filterType}&page=1`);
    }
  };

  const handleFilterClick = (filterType) => {
    navigate(`/classification?filter=${filterType}&page=1`);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      navigate(`/classification?filter=${activeFilter}&page=${newPage}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHeroes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHeroes.length / itemsPerPage);

  if (loading) {
    return (
      <div className="decryption-screen">
        <div className="decrypt-anim">
          <FaDatabase className="decode-icon" />
          <p>DECRYPTING AGENT DATABASE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="classification-container">
      <div className="classification-header">
        <h1>AGENT CLASSIFICATION SYSTEM</h1>
        <p>Filter and review active field operatives</p>
      </div>

      <div className="classification-filters">
        <div 
          className={`class-item ${activeFilter === 'assets' ? 'active' : ''}`}
          onClick={() => handleFilterClick('assets')}
        >
          <FaUserSecret className="class-icon" />
          <span>COVERT ASSETS</span>
        </div>
        <div 
          className={`class-item ${activeFilter === 'threats' ? 'active' : ''}`}
          onClick={() => handleFilterClick('threats')}
        >
          <FaGlobeAmericas className="class-icon" />
          <span>GLOBAL THREATS</span>
        </div>
        <div 
          className={`class-item ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterClick('all')}
        >
          <span>ALL ACTIVE</span>
        </div>
      </div>

      <div className="classification-results">
        <div className="results-count">
          {filteredHeroes.length} {activeFilter === 'assets' ? 'COVERT ASSETS' : 
           activeFilter === 'threats' ? 'GLOBAL THREATS' : 'ACTIVE AGENTS'} IDENTIFIED
          {totalPages > 1 && ` • PAGE ${currentPage} OF ${totalPages}`}
        </div>
        
        {currentItems.length > 0 ? (
          <>
            <div className="heroes-grid">
              {currentItems.map(hero => (
                <HeroCard 
                  key={hero.id} 
                  hero={hero} 
                  onClick={() => navigate(`/details/${hero.id}`)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    className={`pagination-page ${currentPage === number ? 'active' : ''}`}
                    onClick={() => handlePageChange(number)}
                  >
                    {number}
                  </button>
                ))}
                
                <button 
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-results">
            <p>NO {activeFilter === 'assets' ? 'COVERT ASSETS' : 
               activeFilter === 'threats' ? 'GLOBAL THREATS' : 'ACTIVE AGENTS'} FOUND IN DATABASE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassificationPage;