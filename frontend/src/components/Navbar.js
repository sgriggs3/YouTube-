// This is a new file

import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/" className="navbar-link">Home</Link>
        </li>
        <li className="navbar-item">
          <Link to="/about" className="navbar-link">About</Link>
        </li>
        <li className="navbar-item">
          <Link to="/contact" className="navbar-link">Contact</Link>
        </li>
        <li className="navbar-item">
          <Link to="/real-time-analysis" className="navbar-link">Real-Time Analysis</Link>
        </li>
        <li className="navbar-item">
          <Link to="/user-feedback" className="navbar-link">User Feedback</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;