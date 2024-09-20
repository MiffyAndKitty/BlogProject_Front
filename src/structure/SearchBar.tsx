// SearchBar.jsx
import React, { useState } from 'react';
import './SearchBar.css';
import searchIcon from '../img/searchIcon.png';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    console.log(`
      
      
      
      setSearchTerm
      
      
      
      
      `,e.target.value)
    // onSearch(e.target.value);
  };

  const handleClickBtn = () => {
    onSearch(searchTerm);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleClickBtn();
    }
  };

  return (
    <div className="search-bar">
      <input 
        type="text" 
        placeholder="검색" 
        value={searchTerm} 
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
      />
      <button onClick={handleClickBtn}>
        <img src={searchIcon} alt="Search Icon" className="searchIcon" />
      </button>
    </div>
  );
};

export default SearchBar;
