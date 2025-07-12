import React, { useState, useEffect } from 'react';
import Header from './Header';
import RatingModal from './RatingModal';
import PasswordModal from './PasswordModal';
import { api } from '../services/api';
import { Star } from 'lucide-react';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addressFilter, setAddressFilter] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    filterStores();
  }, [stores, searchTerm, addressFilter]);

  const fetchStores = async () => {
    try {
      const response = await api.get('/stores');
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStores = () => {
    let filtered = stores;

    if (searchTerm) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (addressFilter) {
      filtered = filtered.filter(store =>
        store.address.toLowerCase().includes(addressFilter.toLowerCase())
      );
    }

    setFilteredStores(filtered);
  };

  const handleRateStore = (store) => {
    setSelectedStore(store);
    setShowRatingModal(true);
  };

  const handleRatingSubmitted = () => {
    setShowRatingModal(false);
    setSelectedStore(null);
    fetchStores();
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading stores...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header />

      <div className="dashboard-content">
        <div className="table-container">
          <div className="table-header">
            <h2>Available Stores</h2>
            <div className="table-actions">
              <div className="search-filters">
                <input
                  type="text"
                  placeholder="Search by store name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Search by address"
                  value={addressFilter}
                  onChange={(e) => setAddressFilter(e.target.value)}
                />
              </div>
              <button className="btn btn-secondary" onClick={() => setShowPasswordModal(true)}>
                Change Password
              </button>
            </div>
          </div>

          <div className="stores-grid">
            {filteredStores.map((store) => (
              <div key={store.id} className="store-card">
                <h3>{store.name}</h3>
                <p>{store.address}</p>

                <div className="store-rating">
                  <div>
                    <div className="rating-container">
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Overall Rating:</span>
                      <div className="rating-stars">
                        {renderStars(store.rating)}
                      </div>
                      <span className="rating-value">({store.rating})</span>
                    </div>

                    {store.userRating && (
                      <div className="rating-container mt-1">
                        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Your Rating:</span>
                        <div className="rating-stars">
                          {renderStars(store.userRating)}
                        </div>
                        <span className="rating-value">({store.userRating})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="store-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleRateStore(store)}
                  >
                    {store.userRating ? 'Update Rating' : 'Rate Store'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredStores.length === 0 && (
            <div className="text-center" style={{ padding: '2rem' }}>
              <p>No stores found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {showRatingModal && selectedStore && (
        <RatingModal
          store={selectedStore}
          onClose={() => setShowRatingModal(false)}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}

      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};

export default UserDashboard;
