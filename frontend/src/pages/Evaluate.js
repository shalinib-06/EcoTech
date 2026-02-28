import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../App';
import {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Monitor,
  Tv,
  Gamepad2,
  Headphones,
  Camera,
  Printer,
  Upload,
  X,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Info,
  MoreHorizontal
} from 'lucide-react';

const API_URL = 'http://localhost:8000';

const deviceTypes = [
  { id: 'smartphone', label: 'Smartphone', icon: <Smartphone size={32} /> },
  { id: 'laptop', label: 'Laptop', icon: <Laptop size={32} /> },
  { id: 'tablet', label: 'Tablet', icon: <Tablet size={32} /> },
  { id: 'smartwatch', label: 'Smartwatch', icon: <Watch size={32} /> },
  { id: 'desktop', label: 'Desktop', icon: <Monitor size={32} /> },
  { id: 'television', label: 'Television', icon: <Tv size={32} /> },
  { id: 'gaming_console', label: 'Gaming Console', icon: <Gamepad2 size={32} /> },
  { id: 'headphones', label: 'Headphones', icon: <Headphones size={32} /> },
  { id: 'camera', label: 'Camera', icon: <Camera size={32} /> },
  { id: 'printer', label: 'Printer', icon: <Printer size={32} /> },
  { id: 'others', label: 'Others', icon: <MoreHorizontal size={32} /> }
];

const brands = [
  'Apple', 'Samsung', 'Google', 'Sony', 'Microsoft', 'Dell', 'HP', 
  'Lenovo', 'Asus', 'LG', 'OnePlus', 'Xiaomi', 'Realme', 'Oppo', 
  'Vivo', 'Nokia', 'Motorola', 'Huawei', 'Other'
];

const conditions = [
  { value: 5, name: 'Excellent', description: 'Like new, no visible wear', color: '#00d4aa' },
  { value: 4, name: 'Good', description: 'Minor scratches, fully functional', color: '#55efc4' },
  { value: 3, name: 'Fair', description: 'Visible wear, works well', color: '#f39c12' },
  { value: 2, name: 'Poor', description: 'Significant wear, some issues', color: '#e74c3c' },
  { value: 1, name: 'Very Poor', description: 'Major damage, limited function', color: '#c0392b' }
];

const Evaluate = () => {
  const navigate = useNavigate();
  const { setEvaluationResult, userId } = useAppContext();
  const fileInputRef = useRef(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    deviceType: '',
    brand: '',
    age: 1,
    condition: 3,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const totalSteps = 4;

  const handleDeviceSelect = (deviceId) => {
    setFormData({ ...formData, deviceType: deviceId });
  };

  const handleBrandChange = (e) => {
    setFormData({ ...formData, brand: e.target.value });
  };

  const handleAgeChange = (e) => {
    setFormData({ ...formData, age: parseInt(e.target.value) });
  };

  const handleConditionChange = (value) => {
    setFormData({ ...formData, condition: value });
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.deviceType !== '';
      case 2:
        return formData.brand !== '';
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps && canProceed()) {
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
      const response = await fetch(`${API_URL}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_type: formData.deviceType,
          brand: formData.brand.toLowerCase(),
          age: formData.age,
          condition: formData.condition,
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error('Evaluation failed');
      }

      const result = await response.json();
      setEvaluationResult(result);
      navigate('/results');
    } catch (error) {
      console.error('Error:', error);
      // Use mock data for demo
      const mockResult = {
        decision: formData.condition >= 4 ? 'Resell' : formData.condition >= 2 ? 'Repair' : 'Recycle',
        confidence: 85.5,
        resale_value: 15000 - (formData.age * 2000) - ((5 - formData.condition) * 2000),
        repair_cost: 2000 + ((5 - formData.condition) * 800),
        post_repair_value: 18000 - (formData.age * 1500),
        recycle_value: 1500 + (formData.condition * 200),
        materials: {
          gold: 0.05,
          silver: 0.3,
          copper: 15,
          aluminum: 25,
          lithium: 5
        },
        impact: {
          co2_saved: 45,
          materials_recovered: 350,
          landfill_diverted: 0.25,
          circularity_score: 78,
          trees_equivalent: 2.1,
          water_saved: 150,
          energy_saved: 112
        },
        explanation: `Based on our AI analysis, we recommend this option for your ${formData.brand} ${formData.deviceType}.`,
        eco_points_earned: 35,
        device_info: {
          type: formData.deviceType,
          brand: formData.brand,
          age: formData.age,
          condition: formData.condition,
          condition_name: conditions.find(c => c.value === formData.condition)?.name || 'Fair'
        },
        alternatives: {
          Resell: { value: 15000 - (formData.age * 2000), score: 30 },
          Repair: { cost: 2500, potential_value: 18000, score: 25 },
          Recycle: { value: 1800, score: 20 }
        }
      };
      setEvaluationResult(mockResult);
      navigate('/results');
    } finally {
      setIsLoading(false);
    }
  };

  const currentCondition = conditions.find(c => c.value === formData.condition);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="step-content"
          >
            <h3 className="step-title">
              <span className="step-title-icon">📱</span>
              Select Device Type
            </h3>
            <div className="device-type-grid">
              {deviceTypes.map((device) => (
                <div
                  key={device.id}
                  className={`device-type-option ${formData.deviceType === device.id ? 'selected' : ''}`}
                  onClick={() => handleDeviceSelect(device.id)}
                >
                  <div className="device-type-icon">{device.icon}</div>
                  <div className="device-type-label">{device.label}</div>
                </div>
              ))}
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
            className="step-content"
          >
            <h3 className="step-title">
              <span className="step-title-icon">🏷️</span>
              Select Brand & Age
            </h3>
            
            <div className="form-group">
              <label className="form-label">Brand</label>
              <select
                className="form-select"
                value={formData.brand}
                onChange={handleBrandChange}
              >
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Device Age (Years)</label>
              <div className="condition-slider-container">
                <input
                  type="range"
                  className="condition-slider"
                  min="0"
                  max="10"
                  value={formData.age}
                  onChange={handleAgeChange}
                />
                <div className="condition-labels">
                  {[0, 2, 4, 6, 8, 10].map((year) => (
                    <span
                      key={year}
                      className={`condition-label ${formData.age === year ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, age: year })}
                    >
                      {year}y
                    </span>
                  ))}
                </div>
                <div className="condition-display">
                  <div className="condition-value">{formData.age} {formData.age === 1 ? 'Year' : 'Years'}</div>
                  <div className="condition-name">Device Age</div>
                </div>
              </div>
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
            className="step-content"
          >
            <h3 className="step-title">
              <span className="step-title-icon">⭐</span>
              Device Condition
            </h3>
            
            <div className="form-group">
              <label className="form-label">Rate your device condition</label>
              <div className="condition-slider-container">
                <input
                  type="range"
                  className="condition-slider"
                  min="1"
                  max="5"
                  value={formData.condition}
                  onChange={(e) => handleConditionChange(parseInt(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, ${currentCondition?.color} 0%, ${currentCondition?.color} ${(formData.condition - 1) * 25}%, var(--bg-tertiary) ${(formData.condition - 1) * 25}%, var(--bg-tertiary) 100%)`
                  }}
                />
                <div className="condition-labels">
                  {conditions.map((condition) => (
                    <span
                      key={condition.value}
                      className={`condition-label ${formData.condition === condition.value ? 'active' : ''}`}
                      onClick={() => handleConditionChange(condition.value)}
                    >
                      {condition.value}
                    </span>
                  ))}
                </div>
                <div className="condition-display" style={{ borderColor: currentCondition?.color }}>
                  <div className="condition-value" style={{ color: currentCondition?.color }}>
                    {currentCondition?.name}
                  </div>
                  <div className="condition-name">{currentCondition?.description}</div>
                </div>
              </div>
            </div>

            <div className="condition-info" style={{
              marginTop: 'var(--spacing-xl)',
              padding: 'var(--spacing-lg)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--spacing-md)'
            }}>
              <Info size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Condition Guide:</strong><br />
                  • <strong>Excellent:</strong> No scratches, like new<br />
                  • <strong>Good:</strong> Light scratches, works perfectly<br />
                  • <strong>Fair:</strong> Visible wear, functional<br />
                  • <strong>Poor:</strong> Heavy wear, minor issues<br />
                  • <strong>Very Poor:</strong> Damaged, major issues
                </p>
              </div>
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
            className="step-content"
          >
            <h3 className="step-title">
              <span className="step-title-icon">📸</span>
              Upload Device Image (Optional)
            </h3>
            
            <div
              className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Device preview" />
                  <button
                    className="remove-image"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="upload-icon" size={48} />
                  <p className="upload-text">
                    Drag and drop your device image here, or click to browse
                  </p>
                  <p className="upload-hint">
                    Supports: JPG, PNG, WebP (Max 10MB)
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleImageUpload(e.target.files[0])}
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
                <CheckCircle size={20} style={{ color: 'var(--accent-primary)' }} />
                Evaluation Summary
              </h4>
              <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Device Type:</span>
                  <span style={{ textTransform: 'capitalize' }}>{formData.deviceType.replace('_', ' ') || 'Not selected'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Brand:</span>
                  <span>{formData.brand || 'Not selected'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Age:</span>
                  <span>{formData.age} {formData.age === 1 ? 'year' : 'years'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Condition:</span>
                  <span style={{ color: currentCondition?.color }}>{currentCondition?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Image:</span>
                  <span>{imagePreview ? '✓ Uploaded' : 'Not uploaded'}</span>
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
    <div className="evaluate-page">
      <div className="evaluate-container">
        <div className="evaluate-header">
          <h1 className="evaluate-title">Device Evaluation</h1>
          <p className="evaluate-subtitle">
            Tell us about your device and our AI will recommend the best option for you.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          {[1, 2, 3, 4].map((step, index) => (
            <React.Fragment key={step}>
              <div className={`progress-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                <div className="progress-step-circle">
                  {currentStep > step ? <CheckCircle size={18} /> : step}
                </div>
                <span className="progress-step-label">
                  {step === 1 && 'Device'}
                  {step === 2 && 'Details'}
                  {step === 3 && 'Condition'}
                  {step === 4 && 'Image'}
                </span>
              </div>
              {index < 3 && <div className={`progress-step-line ${currentStep > step ? 'completed' : ''}`}></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Evaluation Form */}
        <div className="evaluate-card">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="form-navigation">
            <button
              className="btn btn-secondary"
              onClick={prevStep}
              disabled={currentStep === 1}
              style={{ opacity: currentStep === 1 ? 0.5 : 1 }}
            >
              <ArrowLeft size={18} />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                className="btn btn-primary"
                onClick={nextStep}
                disabled={!canProceed()}
                style={{ opacity: !canProceed() ? 0.5 : 1 }}
              >
                Next
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Get AI Recommendation
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evaluate;
