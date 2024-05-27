// SearchBar.jsx
import React from 'react';
import './SearchBar.css';
import searchIcon from '../img/searchIcon.png'
const SearchBar = () => {
  return (
    <div className="search-bar">
      <input type="text" placeholder="검색" />
      <button>
      <img src={searchIcon} alt="Search Icon" className="searchIcon" />
      </button>
    </div>
  );
};

export default SearchBar;
