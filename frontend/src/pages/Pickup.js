import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../App';
import {
  MapPin,
  Store,
  Calendar,
  Clock,
  CheckCircle,
  Star,
  Navigation,
  ArrowLeft,
  Truck,
  Package,
  Award,
  ChevronRight,
  Loader2,
  X,
  DollarSign,
  Plus,
  Zap,
  Leaf
} from 'lucide-react';

const API_URL = 'http://localhost:8000';

const Pickup = () => {
  const navigate = useNavigate();
  const { evaluationResult, userId, setUserProgress, userProgress } = useAppContext();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  
  const [formData, setFormData] = useState({
    address: '',
    zipcode: '',
    selectedRetailers: [],
    finalSelectedRetailer: null,
    pickupDate: '',
    pickupTime: '',
    additionalNotes: ''
  });

  const [retailers, setRetailers] = useState([]);

  // Initialize retailers with dynamic prices based on recycle_value
  useEffect(() => {
    if (evaluationResult && evaluationResult.recycle_value) {
      const basePrice = evaluationResult.recycle_value;
      const dynamicRetailers = [
        { id: 1, name: 'EcoRecycle Hub - Central', address: '123 Green Street, Downtown', rating: 4.8, distance: 2.5, price: Math.round(basePrice * 8.5), reviews: 'Fast & reliable service. Great environmental practices.' },
        { id: 2, name: 'TechTrade Center', address: '456 Tech Park Road', rating: 4.6, distance: 3.8, price: Math.round(basePrice * 8.8), reviews: 'Good prices but slower processing.' },
        { id: 3, name: 'GreenEarth Electronics', address: '789 Sustainability Ave', rating: 4.9, distance: 5.2, price: Math.round(basePrice * 9.5), reviews: 'Best practices for e-waste. Highest rated.' },
        { id: 4, name: 'CircularTech Store', address: '321 Recycle Lane', rating: 4.5, distance: 4.1, price: Math.round(basePrice * 8.0), reviews: 'Most affordable option with decent service.' },
        { id: 5, name: 'EcoMart Electronics', address: '654 Environment Blvd', rating: 4.7, distance: 6.3, price: Math.round(basePrice * 9.0), reviews: 'Transparent pricing and excellent communication.' }
      ];
      setRetailers(dynamicRetailers);
    }
  }, [evaluationResult]);

  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '01:00 PM - 03:00 PM',
    '03:00 PM - 05:00 PM',
    '05:00 PM - 07:00 PM'
  ];

  useEffect(() => {
    if (!evaluationResult) {
      navigate('/evaluate');
    }
  }, [evaluationResult, navigate]);

  const fetchRetailers = async (zipcode) => {
    try {
      const response = await fetch(`${API_URL}/retailers?zipcode=${zipcode}`);
      if (response.ok) {
        const data = await response.json();
        // Use mockup prices if API doesn't provide prices or to keep demo consistent
        const basePrice = evaluationResult?.recycle_value || 100;
        const multipliers = [8.5, 8.8, 9.5, 8.0, 9.0];
        const mocked = data.retailers.map((r, idx) => ({
          ...r,
          price: (typeof r.price === 'number' && r.price > 0)
            ? r.price
            : Math.round(basePrice * (multipliers[idx % multipliers.length] + idx * 0.1))
        }));
        setRetailers(mocked);
      }
    } catch (error) {
      console.error('Error fetching retailers:', error);
    }
  };

  const handleAddressChange = (e) => {
    setFormData({ ...formData, address: e.target.value });
  };

  const handleZipcodeChange = (e) => {
    const zipcode = e.target.value;
    setFormData({ ...formData, zipcode });
    if (zipcode.length >= 5) {
      fetchRetailers(zipcode);
    }
  };

  const handleRetailerSelect = (retailer) => {
    const isSelected = formData.selectedRetailers.some(r => r.id === retailer.id);
    if (isSelected) {
      setFormData({
        ...formData,
        selectedRetailers: formData.selectedRetailers.filter(r => r.id !== retailer.id)
      });
    } else {
      setFormData({
        ...formData,
        selectedRetailers: [...formData.selectedRetailers, retailer]
      });
    }
  };

  // helper to handle possible id type differences (string vs number)
  const isRetailerSelected = (retailer) => {
    return formData.selectedRetailers.some(r => r.id == retailer.id);
  };

  const handleRetailerFinalSelect = (retailer) => {
    setFormData({ ...formData, finalSelectedRetailer: retailer });
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, pickupDate: e.target.value });
  };

  const handleTimeSelect = (time) => {
    setFormData({ ...formData, pickupTime: time });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.address.trim() !== '' && formData.zipcode.trim() !== '';
      case 2:
        return formData.selectedRetailers.length > 0;
      case 3:
        return formData.selectedRetailers.length > 0; // Show summary
      case 4:
        return formData.finalSelectedRetailer !== null;
      case 5:
        return formData.pickupDate !== '' && formData.pickupTime !== '';
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 5 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/schedule-pickup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          address: formData.address,
          zipcode: formData.zipcode,
          retailer_id: formData.finalSelectedRetailer.id,
          pickup_date: formData.pickupDate,
          pickup_time: formData.pickupTime,
          device_type: evaluationResult?.device_info?.type || 'device',
          additional_notes: formData.additionalNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConfirmationData(data.details);
        setIsConfirmed(true);
        
        // Update user progress
        setUserProgress({
          ...userProgress,
          eco_points: userProgress.eco_points + 25
        });
      } else {
        throw new Error('Failed to schedule pickup');
      }
    } catch (error) {
      console.error('Error:', error);
      // Mock confirmation for demo
      setConfirmationData({
        pickup_id: Math.random().toString(36).substr(2, 8).toUpperCase(),
        address: formData.address,
        zipcode: formData.zipcode,
        retailer_id: formData.finalSelectedRetailer?.id,
        scheduled_date: formData.pickupDate,
        scheduled_time: formData.pickupTime,
        device_type: evaluationResult?.device_info?.type || 'device',
        status: 'confirmed',
        eco_points_earned: 25
      });
      setIsConfirmed(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  if (isConfirmed && confirmationData) {
    return (
      <div className="pickup-page">
        <div className="pickup-container">
          <motion.div
            className="confirmation-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="confirmation-icon">🎉</div>
            <h2 className="confirmation-title">Pickup Scheduled Successfully!</h2>
            <div className="confirmation-id">
              Confirmation ID: {confirmationData.pickup_id}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              background: 'rgba(0, 212, 170, 0.1)',
              borderRadius: 'var(--radius-md)'
            }}>
              <Award size={20} style={{ color: 'var(--accent-primary)' }} />
              <span>+{confirmationData.eco_points_earned} Eco Points Earned!</span>
            </div>

            <div className="confirmation-details">
              <div className="confirmation-detail">
                <span className="confirmation-detail-label">Address</span>
                <span className="confirmation-detail-value">{confirmationData.address}</span>
              </div>
              <div className="confirmation-detail">
                <span className="confirmation-detail-label">Zip Code</span>
                <span className="confirmation-detail-value">{confirmationData.zipcode}</span>
              </div>
              <div className="confirmation-detail">
                <span className="confirmation-detail-label">Retailer</span>
                <span className="confirmation-detail-value">{formData.finalSelectedRetailer?.name}</span>
              </div>
              <div className="confirmation-detail">
                <span className="confirmation-detail-label">Date</span>
                <span className="confirmation-detail-value">
                  {new Date(confirmationData.scheduled_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="confirmation-detail">
                <span className="confirmation-detail-label">Time Slot</span>
                <span className="confirmation-detail-value">{confirmationData.scheduled_time}</span>
              </div>
              <div className="confirmation-detail">
                <span className="confirmation-detail-label">Device</span>
                <span className="confirmation-detail-value" style={{ textTransform: 'capitalize' }}>
                  {confirmationData.device_type.replace('_', ' ')}
                </span>
              </div>
              <div className="confirmation-detail">
                <span className="confirmation-detail-label">Status</span>
                <span className="confirmation-detail-value" style={{ 
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)'
                }}>
                  <CheckCircle size={16} />
                  Confirmed
                </span>
              </div>
            </div>

            <div style={{ 
              marginTop: 'var(--spacing-xl)',
              display: 'flex',
              gap: 'var(--spacing-md)',
              justifyContent: 'center'
            }}>
              <button className="btn btn-secondary" onClick={() => navigate('/evaluate')}>
                Evaluate Another Device
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/progress')}>
                View My Progress
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="pickup-title">
              <MapPin size={24} style={{ color: 'var(--accent-primary)' }} />
              Enter Your Address
            </h3>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your full address"
                value={formData.address}
                onChange={handleAddressChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Zip Code / PIN Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter zip code"
                value={formData.zipcode}
                onChange={handleZipcodeChange}
                maxLength={6}
              />
            </div>

            <div style={{
              marginTop: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--spacing-md)'
            }}>
              <Navigation size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Enter your complete address to find nearby recycling centers and schedule a convenient pickup time.
              </p>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="pickup-title">
              <Store size={24} style={{ color: 'var(--accent-primary)' }} />
              Select Retailers to Compare
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
              Choose multiple retailers to compare their offers and negotiate before making your final choice.
            </p>

            <div className="retailer-grid">
              {retailers.map((retailer) => (
                <div
                  key={retailer.id}
                  className={`retailer-card ${isRetailerSelected(retailer) ? 'selected' : ''}`}
                  onClick={() => handleRetailerSelect(retailer)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  <div className="retailer-info" onClick={() => handleRetailerSelect(retailer)}>
                    <h4>{retailer.name}</h4>
                    <p className="retailer-address">{retailer.address}</p>
                    <div className="retailer-meta">
                      <span className="retailer-rating">
                        <Star size={14} style={{ color: '#f39c12', fill: '#f39c12' }} />
                        {retailer.rating}
                      </span>
                      <span className="retailer-distance">
                        <Navigation size={14} />
                        {retailer.distance} km
                      </span>
                    </div>
                    <div style={{
                      marginTop: 'var(--spacing-sm)',
                      paddingTop: 'var(--spacing-sm)',
                      borderTop: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Offer Price:</span>
                      <span style={{ fontWeight: 'bold', color: '#27ae60', fontSize: '1rem' }}>
                        ₹{retailer.price ? retailer.price.toLocaleString('en-IN') : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="retailer-check" onClick={() => handleRetailerSelect(retailer)}>
                    {isRetailerSelected(retailer) ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        background: 'var(--accent-primary)',
                        borderRadius: '50%',
                        color: 'white'
                      }}>
                        <CheckCircle size={16} />
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '50%',
                        border: '2px solid var(--border-color)'
                      }}>
                        <Plus size={16} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              background: 'rgba(0, 212, 170, 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(0, 212, 170, 0.3)'
            }}>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 var(--spacing-md) 0', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <Zap size={16} style={{ color: 'var(--accent-primary)' }} />
                {formData.selectedRetailers.length} retailer{formData.selectedRetailers.length !== 1 ? 's' : ''} selected for comparison
              </p>
              {formData.selectedRetailers.length > 0 && (
                <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                  {formData.selectedRetailers.map((retailer) => (
                    <div key={retailer.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--spacing-sm)',
                      background: 'white',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.9rem'
                    }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                        {retailer.name}
                      </span>
                      <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
                            ₹{retailer.price ? retailer.price.toLocaleString('en-IN') : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="pickup-title">
              <DollarSign size={24} style={{ color: 'var(--accent-primary)' }} />
              Compare Offers & Reviews
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
              Compare prices, ratings, and reviews. Choose the retailer that offers the best value and service.
            </p>

            <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
              {formData.selectedRetailers.map((retailer) => (
                <div
                  key={retailer.id}
                  style={{
                    padding: 'var(--spacing-lg)',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--border-color)',
                    display: 'grid',
                    gap: 'var(--spacing-md)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {retailer.name}
                      </h4>
                      <p style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {retailer.address}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 'var(--spacing-md)',
                    paddingBottom: 'var(--spacing-md)',
                    borderBottom: '1px solid var(--border-color)'
                  }}>
                    <div>
                      <p style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Price Offer
                      </p>
                      <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', color: '#27ae60' }}>
                        ₹{retailer.price ? retailer.price.toLocaleString('en-IN') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Rating
                      </p>
                      <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <Star size={18} style={{ color: '#f39c12', fill: '#f39c12' }} />
                        {retailer.rating}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Distance
                      </p>
                      <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                        {retailer.distance} km
                      </p>
                    </div>
                  </div>

                  <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'rgba(39, 174, 96, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid #27ae60'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      💬 &quot;{retailer.reviews}&quot;
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      handleRetailerFinalSelect(retailer);
                      setCurrentStep(4);
                    }}
                    style={{
                      padding: 'var(--spacing-md)',
                      background: 'var(--accent-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      transition: 'var(--transition-base)'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    Choose This Retailer
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="pickup-title">
              <CheckCircle size={24} style={{ color: 'var(--accent-primary)' }} />
              Confirm Your Selection
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
              You have chosen the following retailer. Continue to schedule your pickup.
            </p>

            <div
              style={{
                padding: 'var(--spacing-lg)',
                background: 'rgba(0, 212, 170, 0.1)',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--accent-primary)',
                marginBottom: 'var(--spacing-lg)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                <div>
                  <h4 style={{ margin: '0 0 var(--spacing-xs) 0', color: 'var(--accent-primary)', fontSize: '1.1rem' }}>
                    {formData.finalSelectedRetailer?.name}
                  </h4>
                  <p style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>
                    {formData.finalSelectedRetailer?.address}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(3)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    padding: 'var(--spacing-sm)',
                    fontSize: '0.9rem'
                  }}
                >
                  Change
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 'var(--spacing-md)',
                paddingTop: 'var(--spacing-md)',
                borderTop: '1px solid rgba(0, 212, 170, 0.3)'
              }}>
                <div>
                  <p style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Your Offer Price
                  </p>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#27ae60' }}>
                    ₹{formData.finalSelectedRetailer?.price ? formData.finalSelectedRetailer.price.toLocaleString('en-IN') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Rating
                  </p>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    <Star size={16} style={{ color: '#f39c12', fill: '#f39c12' }} />
                    {formData.finalSelectedRetailer?.rating}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Distance
                  </p>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {formData.finalSelectedRetailer?.distance} km
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              padding: 'var(--spacing-md)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)'
            }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <CheckCircle size={16} style={{ color: 'var(--accent-primary)' }} />
                Ready to schedule pickup? Click Next to set your preferred date and time.
              </p>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="pickup-title">
              <Calendar size={24} style={{ color: 'var(--accent-primary)' }} />
              Select Date & Time
            </h3>

            <div className="datetime-grid">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} style={{ marginRight: 'var(--spacing-xs)' }} />
                  Pickup Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.pickupDate}
                  onChange={handleDateChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} style={{ marginRight: 'var(--spacing-xs)' }} />
                  Preferred Time Slot
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {timeSlots.map((slot) => (
                    <div
                      key={slot}
                      onClick={() => handleTimeSelect(slot)}
                      style={{
                        padding: 'var(--spacing-md)',
                        background: formData.pickupTime === slot ? 'rgba(0, 212, 170, 0.1)' : 'var(--bg-tertiary)',
                        border: `2px solid ${formData.pickupTime === slot ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'var(--transition-base)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{slot}</span>
                      {formData.pickupTime === slot && (
                        <CheckCircle size={18} style={{ color: 'var(--accent-primary)' }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 'var(--spacing-lg)' }}>
              <label className="form-label">Additional Notes (Optional)</label>
              <textarea
                className="form-input"
                placeholder="Any special instructions for pickup..."
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Summary */}
            <div style={{
              marginTop: 'var(--spacing-xl)',
              padding: 'var(--spacing-lg)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)'
            }}>
              <h4 style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <Package size={20} style={{ color: 'var(--accent-primary)' }} />
                Pickup Summary
              </h4>
              <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Address:</span>
                  <span>{formData.address || 'Not entered'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Retailer:</span>
                  <span>{formData.finalSelectedRetailer?.name || 'Not selected'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                  <span>
                    {formData.pickupDate 
                      ? new Date(formData.pickupDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : 'Not selected'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Time:</span>
                  <span>{formData.pickupTime || 'Not selected'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Device:</span>
                  <span style={{ textTransform: 'capitalize' }}>
                    {evaluationResult?.device_info?.type?.replace('_', ' ') || 'Device'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pickup-page">
      <div className="pickup-container">
        <div className="evaluate-header">
          <h1 className="evaluate-title">Schedule Pickup</h1>
          <p className="evaluate-subtitle">
            Schedule a convenient pickup for your device recycling.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          {[1, 2, 3, 4, 5].map((step, index) => (
            <React.Fragment key={step}>
              <div className={`progress-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                <div className="progress-step-circle">
                  {currentStep > step ? <CheckCircle size={18} /> : step}
                </div>
                <span className="progress-step-label">
                  {step === 1 && 'Address'}
                  {step === 2 && 'Select'}
                  {step === 3 && 'Compare'}
                  {step === 4 && 'Confirm'}
                  {step === 5 && 'Schedule'}
                </span>
              </div>
              {index < 4 && <div className={`progress-step-line ${currentStep > step ? 'completed' : ''}`}></div>}
            </React.Fragment>
          ))}
        </div>

        <div className="pickup-card">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="form-navigation">
            <button
              className="btn btn-secondary"
              onClick={currentStep === 1 ? () => navigate('/results') : prevStep}
            >
              <ArrowLeft size={18} />
              {currentStep === 1 ? 'Back to Results' : 'Previous'}
            </button>

            {currentStep < 5 ? (
              <button
                className="btn btn-primary"
                onClick={nextStep}
                disabled={!canProceed()}
                style={{ opacity: !canProceed() ? 0.5 : 1 }}
              >
                Next
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isLoading || !canProceed()}
                style={{ opacity: (!canProceed() || isLoading) ? 0.5 : 1 }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Truck size={18} />
                    Confirm Pickup
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* E-Waste Guide and Recycling Tips Section */}
        <div style={{ marginTop: 'var(--spacing-xxl)', paddingTop: 'var(--spacing-xl)', borderTop: '2px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <Leaf size={28} style={{ color: 'var(--accent-primary)' }} />
            E-Waste Guide & Recycling Tips
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
            {/* Tip 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                padding: 'var(--spacing-lg)',
                background: 'rgba(0, 212, 170, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0, 212, 170, 0.3)'
              }}
            >
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: 'var(--spacing-sm)', color: 'var(--accent-primary)' }}>
                💾 Backup Your Data
              </h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Before recycling, back up all important data and files from your device. Factory reset to remove personal information.
              </p>
            </motion.div>

            {/* Tip 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                padding: 'var(--spacing-lg)',
                background: 'rgba(0, 212, 170, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0, 212, 170, 0.3)'
              }}
            >
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: 'var(--spacing-sm)', color: 'var(--accent-primary)' }}>
                🔋 Charge Your Device
              </h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Charge your device before recycling. Recyclers handle charged batteries more safely and can properly assess device condition.
              </p>
            </motion.div>

            {/* Tip 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                padding: 'var(--spacing-lg)',
                background: 'rgba(0, 212, 170, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0, 212, 170, 0.3)'
              }}
            >
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: 'var(--spacing-sm)', color: 'var(--accent-primary)' }}>
                📦 Keep Original Accessories
              </h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Include chargers, cables, and original packaging if available. This increases your device's value and aids recycling.
              </p>
            </motion.div>

            {/* Tip 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                padding: 'var(--spacing-lg)',
                background: 'rgba(0, 212, 170, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0, 212, 170, 0.3)'
              }}
            >
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: 'var(--spacing-sm)', color: 'var(--accent-primary)' }}>
                ♻️ Understand E-Waste Impact
              </h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                E-waste contains toxic materials. Proper recycling prevents environmental damage and recovers valuable materials like gold, copper, and rare earth elements.
              </p>
            </motion.div>

            {/* Tip 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                padding: 'var(--spacing-lg)',
                background: 'rgba(0, 212, 170, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0, 212, 170, 0.3)'
              }}
            >
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: 'var(--spacing-sm)', color: 'var(--accent-primary)' }}>
                🌍 Environmental Benefits
              </h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Recycling one smartphone saves energy equivalent to a laptop running for 3 days. Recycling reduces mining needs and lowers carbon emissions.
              </p>
            </motion.div>

            {/* Tip 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                padding: 'var(--spacing-lg)',
                background: 'rgba(0, 212, 170, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0, 212, 170, 0.3)'
              }}
            >
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: 'var(--spacing-sm)', color: 'var(--accent-primary)' }}>
                ☑️ Verify Certified Recycler
              </h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Choose certified e-waste recyclers. They follow proper protocols, ensure data security, and recover maximum valuable materials responsibly.
              </p>
            </motion.div>
          </div>

          {/* Materials Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{
              padding: 'var(--spacing-lg)',
              background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.1), rgba(84, 239, 196, 0.1))',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--accent-primary)'
            }}
          >
            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: 'var(--spacing-md)', color: 'var(--accent-primary)' }}>
              ⚙️ Valuable Materials in Your Device
            </h4>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', lineHeight: '1.6', fontSize: '0.95rem' }}>
              Your electronics contain precious materials that can be recovered and reused:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--spacing-md)' }}>
              <div style={{ textAlign: 'center', padding: 'var(--spacing-sm)' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>🥇</div>
                <p style={{ margin: 'var(--spacing-xs) 0 0 0', fontSize: '0.9rem', fontWeight: '500' }}>Gold</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Circuits & Connectors</p>
              </div>
              <div style={{ textAlign: 'center', padding: 'var(--spacing-sm)' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#c0a080' }}>🥈</div>
                <p style={{ margin: 'var(--spacing-xs) 0 0 0', fontSize: '0.9rem', fontWeight: '500' }}>Silver</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Conductive Parts</p>
              </div>
              <div style={{ textAlign: 'center', padding: 'var(--spacing-sm)' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#b87333' }}>🔶</div>
                <p style={{ margin: 'var(--spacing-xs) 0 0 0', fontSize: '0.9rem', fontWeight: '500' }}>Copper</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wiring & Motors</p>
              </div>
              <div style={{ textAlign: 'center', padding: 'var(--spacing-sm)' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#a8a9ad' }}>⬜</div>
                <p style={{ margin: 'var(--spacing-xs) 0 0 0', fontSize: '0.9rem', fontWeight: '500' }}>Aluminum</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Frame & Heat Sinks</p>
              </div>
              <div style={{ textAlign: 'center', padding: 'var(--spacing-sm)' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#00a86b' }}>🔋</div>
                <p style={{ margin: 'var(--spacing-xs) 0 0 0', fontSize: '0.9rem', fontWeight: '500' }}>Lithium</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Battery Material</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Pickup;
