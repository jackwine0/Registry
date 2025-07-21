
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroCard from '../components/HeroCard';
import { searchHeroes } from '../api/Api';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchTerm) {
      setLoading(true);
      setError(null);
      
      searchHeroes(searchTerm)
        .then(data => {
          setResults(data.results || []);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [searchTerm]);

  // ... rest of your component ...
  if (!searchTerm) return null;

  if (loading) return (
    <div className="search-loading">
      <div className="loading-spinner"></div>
      <p>DECRYPTING SEARCH RESULTS...</p>
    </div>
  );

  if (error) return (
    <div className="search-error">
      <p>ACCESS DENIED: {error}</p>
    </div>
  );

  return (
    <div className="search-results">
      <div className="results-header">
        <h2>SEARCH RESULTS FOR: "{searchTerm.toUpperCase()}"</h2>
        <p>{results.length} ASSETS FOUND</p>
      </div>

      <div className="results-grid">
        {results.length > 0 ? (
          results.map(hero => (
            <HeroCard key={hero.id} hero={hero} />
          ))
        ) : (
          <div className="no-results">
            <p>NO MATCHING ASSETS FOUND IN DATABASE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;