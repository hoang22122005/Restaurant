import React from 'react';
import SiteSwitcher from './SiteSwitcher';

const Header: React.FC = () => (
  <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
      Restaurant Manager
    </h1>
    <SiteSwitcher />
  </header>
);

export default Header;
