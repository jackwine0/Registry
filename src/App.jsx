import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { lazy, Suspense } from "react";

const HomePage = lazy(() => import("./pages/HomePage"));
const Details = lazy(() => import("./pages/Details"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const ClassificationPage = lazy(() => import("./pages/ClassificationPage"));
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  const navigate = useNavigate();

  const handleSearch = (term) => {
    navigate(`/search-results?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="app">
      <Navbar onSearch={handleSearch} />
      <Suspense fallback={<div className="loading-screen"></div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/details/:id" element={<Details />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/classification" element={<ClassificationPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}

export default App;
