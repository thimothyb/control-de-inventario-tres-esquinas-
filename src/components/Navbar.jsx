import React from 'react';

const Navbar = ({ title }) => (
  <div className="bg-white dark:bg-gray-800 shadow-sm px-8 py-4 transition-colors duration-200">
    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{title}</h1>
  </div>
);

export default Navbar;
