import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TherapistFinder = ({ onBack }) => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [city, setCity] = useState('');

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          fetchTherapists(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enter your city manually.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, []);

  const fetchTherapists = async (lat, lng, cityName = null) => {
    setLoading(true);
    setError(null);

    try {
      // Since we can't directly use Google Places API from frontend without exposing API key,
      // we'll create mock data and provide Google search links
      // In production, this should be a backend API call
      
      const searchQuery = cityName 
        ? `therapist+near+${encodeURIComponent(cityName)}`
        : `therapist+near+me`;

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock therapist data - In production, fetch from Google Places API via backend
      const mockTherapists = [
        {
          id: '1',
          name: 'Dr. Sudhir Arora',
          rating: 4.9,
          reviews: 836,
          address: '306, Third Floor, Mindworks Counselling',
          phone: '+91 98765 43210',
          specialty: 'Mental health service',
          distance: '2.3 km',
          googleMapsUrl: `https://www.google.com/maps/search/therapist+near+me/@${lat},${lng},15z`,
          googlePlaceUrl: `https://www.google.com/search?q=${searchQuery}`
        },
        {
          id: '2',
          name: 'Divine Life Counselling Center',
          rating: 4.9,
          reviews: 193,
          address: '1st floor, Metaverse Building',
          phone: '+91 98765 43211',
          specialty: 'Counselling center',
          distance: '3.1 km',
          googleMapsUrl: `https://www.google.com/maps/search/therapist+near+me/@${lat},${lng},15z`,
          googlePlaceUrl: `https://www.google.com/search?q=${searchQuery}`
        },
        {
          id: '3',
          name: 'Neha Yeole - Clinical Psychologist',
          rating: 4.8,
          reviews: 442,
          address: 'KKonnection Center, 2nd Floor',
          phone: '+91 98765 43212',
          specialty: 'Clinical Psychology',
          distance: '4.5 km',
          googleMapsUrl: `https://www.google.com/maps/search/therapist+near+me/@${lat},${lng},15z`,
          googlePlaceUrl: `https://www.google.com/search?q=${searchQuery}`
        }
      ];

      setTherapists(mockTherapists);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching therapists:', err);
      setError('Failed to load therapists. Please try again.');
      setLoading(false);
    }
  };

  const handleCitySearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchTherapists(null, null, city);
    }
  };

  const handleConsult = (therapist) => {
    // Open Google search results for the therapist
    window.open(therapist.googlePlaceUrl, '_blank');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="text-yellow-500">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-500">★</span>);
    }
    const remaining = 5 - Math.ceil(rating);
    for (let i = 0; i < remaining; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy/5 via-ocean/5 to-sky/10 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-navy/50 hover:text-navy mb-6 font-normal text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
          
          <h1 className="text-5xl font-semibold text-navy mb-4 tracking-tight">
            Find a Therapist
          </h1>
          <p className="text-navy/60 font-light text-lg max-w-3xl mb-6">
            Connect with qualified mental health professionals in your area
          </p>

          {/* City Search */}
          <form onSubmit={handleCitySearch} className="flex gap-3">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your city (optional)"
              className="flex-1 p-4 bg-white/80 border border-navy/20 text-navy placeholder:text-navy/40 font-light text-sm focus:outline-none focus:border-navy transition-all"
            />
            <button
              type="submit"
              className="bg-navy text-white py-4 px-6 font-normal text-sm hover:bg-navy/90 transition-all"
            >
              Search
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/60 border-l-4 border-ocean p-12 text-center">
            <div className="animate-spin w-12 h-12 border-2 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-navy/60 font-light">Finding therapists near you...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6">
            <p className="text-red-800 font-light">{error}</p>
          </div>
        )}

        {/* Therapists List */}
        {!loading && !error && (
          <div className="space-y-4">
            <AnimatePresence>
              {therapists.map((therapist, index) => (
                <motion.div
                  key={therapist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/60 border-l-4 border-navy/20 p-6 hover:border-navy/40 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-navy mb-2">
                        {therapist.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {renderStars(therapist.rating)}
                        </div>
                        <span className="text-navy/60 text-sm font-light">
                          {therapist.rating} ({therapist.reviews} reviews)
                        </span>
                      </div>
                      <p className="text-navy/70 text-sm font-light mb-1">
                        {therapist.specialty}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-ocean font-normal text-sm">
                        {therapist.distance}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <span className="text-navy/40 mt-1">📍</span>
                      <p className="text-navy/70 text-sm font-light flex-1">
                        {therapist.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-navy/40">📞</span>
                      <a 
                        href={`tel:${therapist.phone}`}
                        className="text-ocean text-sm font-light hover:underline"
                      >
                        {therapist.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConsult(therapist)}
                      className="flex-1 bg-ocean text-white py-3 px-6 font-normal text-sm hover:bg-ocean/90 transition-all"
                    >
                      Consult →
                    </button>
                    <a
                      href={therapist.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/60 text-navy/70 py-3 px-6 font-normal text-sm hover:bg-white border border-navy/20 transition-all"
                    >
                      Directions
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* View More on Google */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-ocean/10 border-l-4 border-ocean p-6 text-center"
            >
              <p className="text-navy/70 font-light mb-4">
                Looking for more options?
              </p>
              <a
                href={`https://www.google.com/maps/search/therapist+near+me`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-navy text-white py-3 px-6 font-normal text-sm hover:bg-navy/90 transition-all"
              >
                View All on Google Maps →
              </a>
            </motion.div>
          </div>
        )}

        {/* Important Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-sky/20 border-l-4 border-ocean/30 p-6 mt-8"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h4 className="font-semibold text-navy mb-1">Important Note</h4>
              <p className="text-sm text-navy/70 font-light">
                This list is provided for informational purposes only. Please verify credentials, 
                availability, and insurance coverage before booking an appointment. MindMend does 
                not endorse or guarantee the quality of services provided by listed professionals.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TherapistFinder;
