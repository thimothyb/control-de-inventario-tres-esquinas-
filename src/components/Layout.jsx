import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => (
  <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-8 transition-colors duration-200">
        {children}
      </main>
    </div>
  </div>
);

export default Layout;
