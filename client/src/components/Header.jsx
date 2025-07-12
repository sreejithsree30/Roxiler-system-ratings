import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return 'System Administrator';
      case 'store_owner':
        return 'Store Owner';
      case 'normal':
        return 'Normal User';
      default:
        return role;
    }
  };

  return (
    <header className="header">
      <div>
        <h1>Store Rating System</h1>
      </div>
      <div className="user-info">
        <span>Welcome, {user?.name}</span>
        <span className={`role-badge ${user?.role}`}>
          {getRoleDisplay(user?.role || '')}
        </span>
        <button className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
