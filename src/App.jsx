import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Details from "./pages/Details";
import SearchResults from "./pages/SearchResults";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ClassificationPage from "./pages/ClassificationPage";

function App() {
  const navigate = useNavigate();

  const handleSearch = (term) => {
    navigate(`/search-results?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="app">
      <Navbar onSearch={handleSearch} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/details/:id" element={<Details />} />{" "}
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/classification" element={<ClassificationPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
