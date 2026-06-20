import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
  </div>
);

export default Layout;
