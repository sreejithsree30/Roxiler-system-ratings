import React, { useState, useEffect } from 'react';
import Header from './Header';
import UserModal from './UserModal';
import StoreModal from './StoreModal';
import PasswordModal from './PasswordModal';
import { api } from '../services/api';
import { Star } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: ''
  });
  const [storeFilters, setStoreFilters] = useState({
    name: '',
    address: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  useEffect(() => {
    fetchStores();
  }, [storeFilters]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, storesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/users'),
        api.get('/stores')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setStores(storesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.email) params.append('email', filters.email);
      if (filters.address) params.append('address', filters.address);
      if (filters.role) params.append('role', filters.role);

      const response = await api.get(`/users?${params}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams();
      if (storeFilters.name) params.append('name', storeFilters.name);
      if (storeFilters.address) params.append('address', storeFilters.address);

      const response = await api.get(`/stores?${params}`);
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const handleUserCreated = () => {
    setShowUserModal(false);
    fetchData();
  };

  const handleStoreCreated = () => {
    setShowStoreModal(false);
    fetchData();
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={i <= rating ? 'star filled' : 'star empty'}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header />

      <div className="dashboard-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Stores</h3>
            <p>{stats.totalStores}</p>
          </div>
          <div className="stat-card">
            <h3>Total Ratings</h3>
            <p>{stats.totalRatings}</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-container">
          <div className="table-header">
            <h2>Users Management</h2>
            <div className="table-actions">
              <div className="search-filters">
                <input
                  type="text"
                  placeholder="Filter by name"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Filter by email"
                  value={filters.email}
                  onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Filter by address"
                  value={filters.address}
                  onChange={(e) => setFilters({ ...filters, address: e.target.value })}
                />
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                >
                  <option value="">All Roles</option>
                  <option value="normal">Normal User</option>
                  <option value="store_owner">Store Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={() => setShowUserModal(true)}>
                Add User
              </button>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Role</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.address}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {user.rating != null ? (
                      <div className="rating-container">
                        <div className="rating-stars">{renderStars(user.rating)}</div>
                        <span className="rating-value">({user.rating})</span>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stores Table */}
        <div className="table-container">
          <div className="table-header">
            <h2>Stores Management</h2>
            <div className="table-actions">
              <div className="search-filters">
                <input
                  type="text"
                  placeholder="Filter by name"
                  value={storeFilters.name}
                  onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Filter by address"
                  value={storeFilters.address}
                  onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
                />
              </div>
              <button className="btn btn-primary" onClick={() => setShowStoreModal(true)}>
                Add Store
              </button>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.email}</td>
                  <td>{store.address}</td>
                  <td>
                    <div className="rating-container">
                      <div className="rating-stars">{renderStars(store.rating)}</div>
                      <span className="rating-value">({store.rating})</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Password Modal */}
        <div className="text-center mt-4">
          <button className="btn btn-secondary" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </button>
        </div>
      </div>

      {/* Modals */}
      {showUserModal && (
        <UserModal onClose={() => setShowUserModal(false)} onUserCreated={handleUserCreated} />
      )}
      {showStoreModal && (
        <StoreModal onClose={() => setShowStoreModal(false)} onStoreCreated={handleStoreCreated} />
      )}
      {showPasswordModal && <PasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
};

export default AdminDashboard;
