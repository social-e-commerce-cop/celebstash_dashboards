import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AdminLayout: React.FC = () => {
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Header searchQuery={globalSearch} onSearchChange={setGlobalSearch} />
        <main className="page-content">
          <Outlet context={{ globalSearch }} />
        </main>
      </div>
    </div>
  );
};
