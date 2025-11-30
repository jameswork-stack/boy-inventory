import React from 'react';
import { Link } from 'react-router-dom';
import logo from '/images/logo.png';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div style={{ display: "flex", alignItems: "center"}}>
        <img src={logo} alt="logo" style={{ width: "100px", height: "60px"}}/>
        <h1>Boy Paint Center Toledo</h1>
      </div>
      
    </nav>
  );
};

export default Navbar;
