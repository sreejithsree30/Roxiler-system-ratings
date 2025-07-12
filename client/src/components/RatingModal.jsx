import React, { useState } from 'react';
import { api } from '../services/api';
import { Star } from 'lucide-react';

const RatingModal = ({ store, onClose, onRatingSubmitted }) => {
  const [selectedRating, setSelectedRating] = useState(store.userRating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedRating === 0) {
      setError('Please select a rating');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.post('/ratings', {
        storeId: store.id,
        rating: selectedRating,
      });
      onRatingSubmitted();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= (hoveredRating || selectedRating);
      stars.push(
        <Star
          key={i}
          size={32}
          className={filled ? 'star filled' : 'star empty'}
          style={{ cursor: 'pointer' }}
          onClick={() => setSelectedRating(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
        />
      );
    }
    return stars;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{store.userRating ? 'Update Rating' : 'Rate Store'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="text-center mb-4">
          <h3>{store.name}</h3>
          <p style={{ color: '#64748b' }}>{store.address}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group text-center">
            <label>Select your rating:</label>
            <div className="rating-stars" style={{ justifyContent: 'center', margin: '1rem 0' }}>
              {renderStars()}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              {selectedRating > 0
                ? `You selected ${selectedRating} star${selectedRating > 1 ? 's' : ''}`
                : 'Click on a star to rate'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || selectedRating === 0}
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
