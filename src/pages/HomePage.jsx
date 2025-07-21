import React, { useEffect, useState, useRef } from "react";
import { getMultipleHeroes } from "../api/Api";
import HeroCard from "../components/HeroCard";
import {
  FaChevronLeft,
  FaChevronRight,
  FaDatabase,
  FaShieldAlt,
} from "react-icons/fa";
import "./Home.css";

const HomePage = () => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);

  const CARD_WIDTH = 300;
  const CARD_MARGIN = 20;
  const CARD_TOTAL_WIDTH = CARD_WIDTH + CARD_MARGIN;

  useEffect(() => {
    const loadHeroes = async () => {
      const data = await getMultipleHeroes(1, 20);
      setHeroes(data);
      setLoading(false);
    };

    loadHeroes();
  }, []);

  const scrollNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: CARD_TOTAL_WIDTH * 3,
        behavior: "smooth",
      });
    }
  };

  const scrollPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: -CARD_TOTAL_WIDTH * 3,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <FaDatabase className="loading-icon" />
          <div className="loading-text">ACCESSING HERO REGISTRY</div>
          <div className="loading-subtext">Decrypting classified files...</div>
          <div className="loading-bar">
            <div className="loading-progress" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="home-page">
      <div className="carousel-header">
        <h1 className="carousel-title">
          <span className="title-icon">⟡</span> ACTIVE ASSET {" "}
          <span className="title-icon">⟡</span>
        </h1>
        <p className="carousel-subtitle">
          Access tactical dossiers containing psych evaluations and combat readiness metrics.
        </p>
      </div>

      <div className="carousel-wrapper">
        <button className="carousel-button prev" onClick={scrollPrev}>
          <FaChevronLeft />
        </button>

        <div className="carousel-container" ref={carouselRef}>
          <div className="carousel-track native-scroll">
            {heroes.map((hero) => (
              <div key={hero.id} className="carousel-card-wrapper">
                <HeroCard hero={hero} />
              </div>
            ))}
          </div>
        </div>

        <button className="carousel-button next" onClick={scrollNext}>
          <FaChevronRight />
        </button>
      </div>

     
    </main>
  );
};

export default HomePage;
