import React, { useState, useEffect } from 'react';
import Header from './Header';
import PasswordModal from './PasswordModal';
import { api } from '../services/api';
import { Star } from 'lucide-react';

const StoreOwnerDashboard = () => {
  const [storeData, setStoreData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      const response = await api.get('/dashboard/store-ratings');
      setStoreData(response.data);
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={18}
          className={i <= rating ? 'star filled' : 'star empty'}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading store data...</p>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="dashboard">
        <Header />
        <div className="dashboard-content">
          <div className="error-message">
            No store data found. Please contact the administrator.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header />

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Average Rating</h3>
            <div className="rating-container">
              <div className="rating-stars">
                {renderStars(storeData.averageRating)}
              </div>
              <span className="rating-value" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                ({storeData.averageRating})
              </span>
            </div>
          </div>
          <div className="stat-card">
            <h3>Total Ratings</h3>
            <p>{storeData.ratings.length}</p>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h2>Customer Ratings</h2>
            <div className="table-actions">
              <button className="btn btn-secondary" onClick={() => setShowPasswordModal(true)}>
                Change Password
              </button>
            </div>
          </div>

          {storeData.ratings.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Customer Email</th>
                  <th>Rating</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {storeData.ratings.map((rating) => (
                  <tr key={rating.id}>
                    <td>{rating.user.name}</td>
                    <td>{rating.user.email}</td>
                    <td>
                      <div className="rating-container">
                        <div className="rating-stars">
                          {renderStars(rating.rating)}
                        </div>
                        <span className="rating-value">({rating.rating})</span>
                      </div>
                    </td>
                    <td>{formatDate(rating.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center" style={{ padding: '2rem' }}>
              <p>No ratings yet. Encourage your customers to rate your store!</p>
            </div>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};

export default StoreOwnerDashboard;
