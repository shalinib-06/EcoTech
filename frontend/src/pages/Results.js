import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../App';
import {
  TrendingUp,
  Wrench,
  Recycle,
  Leaf,
  TreePine,
  Droplets,
  Zap,
  Award,
  ChevronRight,
  RotateCcw,
  Truck,
  CheckCircle,
  Info,
  Sparkles
} from 'lucide-react';

const Results = () => {
  const navigate = useNavigate();
  const { evaluationResult, setUserProgress } = useAppContext();
  const [selectedOption, setSelectedOption] = useState(null);
  const [animatedValues, setAnimatedValues] = useState({
    confidence: 0,
    circularity: 0,
    co2: 0
  });

  useEffect(() => {
    if (!evaluationResult) {
      navigate('/evaluate');
      return;
    }

    // Animate values
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        confidence: Math.floor(evaluationResult.confidence * easeOut),
        circularity: Math.floor(evaluationResult.impact.circularity_score * easeOut),
        co2: Math.floor(evaluationResult.impact.co2_saved * easeOut)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues({
          confidence: evaluationResult.confidence,
          circularity: evaluationResult.impact.circularity_score,
          co2: evaluationResult.impact.co2_saved
        });
      }
    }, interval);

    setSelectedOption(evaluationResult.decision);

    return () => clearInterval(timer);
  }, [evaluationResult, navigate]);

  if (!evaluationResult) {
    return null;
  }

  const {
    decision,
    confidence,
    resale_value,
    repair_cost,
    post_repair_value,
    recycle_value,
    materials,
    impact,
    explanation,
    eco_points_earned,
    device_info,
    alternatives
  } = evaluationResult;

  const decisionConfig = {
    Resell: {
      icon: <TrendingUp size={32} />,
      color: '#00d4aa',
      gradient: 'linear-gradient(135deg, #00d4aa, #00b894)',
      description: 'Your device has good market value'
    },
    Repair: {
      icon: <Wrench size={32} />,
      color: '#0984e3',
      gradient: 'linear-gradient(135deg, #0984e3, #74b9ff)',
      description: 'Repair can extend your device life'
    },
    Recycle: {
      icon: <Recycle size={32} />,
      color: '#a29bfe',
      gradient: 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
      description: 'Responsible recycling is recommended'
    }
  };

  const currentConfig = decisionConfig[decision];

  const materialIcons = {
    gold: '🥇',
    silver: '🥈',
    copper: '🔶',
    aluminum: '⬜',
    lithium: '🔋',
    steel: '⚙️',
    plastic: '📦',
    glass: '🔮'
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleProceed = () => {
    if (selectedOption === 'Recycle') {
      navigate('/pickup');
    } else {
      // For Resell and Repair, show a success message or redirect
      alert(`Great choice! You've selected to ${selectedOption.toLowerCase()} your device. You'll earn bonus eco points!`);
    }
  };

  const handleStartOver = () => {
    navigate('/evaluate');
  };

  return (
    <div className="results-page">
      <div className="results-container">
        {/* AI Decision Card */}
        <motion.div
          className="decision-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="decision-header">
            <div className="decision-badge">
              <Sparkles size={16} />
              AI Recommendation
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-sm)',
              background: 'var(--bg-tertiary)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.9rem'
            }}>
              <Award size={16} style={{ color: 'var(--accent-primary)' }} />
              +{eco_points_earned} Eco Points
            </div>
          </div>

          <div className="decision-main">
            <div className="decision-label">Best Option For Your {device_info.type.replace('_', ' ')}</div>
            <motion.div
              className="decision-value"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ background: currentConfig.gradient, WebkitBackgroundClip: 'text' }}
            >
              {decision}
            </motion.div>
            <div className="decision-confidence">
              <span style={{ color: 'var(--text-muted)' }}>AI Confidence:</span>
              <div className="confidence-bar">
                <motion.div
                  className="confidence-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${animatedValues.confidence}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
              <span className="confidence-text">{animatedValues.confidence}%</span>
            </div>
          </div>

          {/* Value Options */}
          <div className="value-cards">
            <div
              className={`value-card ${selectedOption === 'Resell' ? 'recommended' : ''}`}
              onClick={() => handleOptionSelect('Resell')}
            >
              <div className="value-card-icon">💰</div>
              <div className="value-card-label">Resale Value</div>
              <div className="value-card-amount">₹{resale_value?.toLocaleString()}</div>
              {decision === 'Resell' && <span className="value-card-tag">Recommended</span>}
            </div>

            <div
              className={`value-card ${selectedOption === 'Repair' ? 'recommended' : ''}`}
              onClick={() => handleOptionSelect('Repair')}
            >
              <div className="value-card-icon">🔧</div>
              <div className="value-card-label">Repair Cost</div>
              <div className="value-card-amount">₹{repair_cost?.toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                Post-repair: ₹{post_repair_value?.toLocaleString()}
              </div>
              {decision === 'Repair' && <span className="value-card-tag">Recommended</span>}
            </div>

            <div
              className={`value-card ${selectedOption === 'Recycle' ? 'recommended' : ''}`}
              onClick={() => handleOptionSelect('Recycle')}
            >
              <div className="value-card-icon">♻️</div>
              <div className="value-card-label">Recycle Value</div>
              <div className="value-card-amount">₹{recycle_value?.toLocaleString()}</div>
              {decision === 'Recycle' && <span className="value-card-tag">Recommended</span>}
            </div>
          </div>
        </motion.div>

        {/* Explanation Card */}
        <motion.div
          className="explanation-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="explanation-title">
            <Info size={20} style={{ color: 'var(--accent-primary)' }} />
            Why This Recommendation?
          </h3>
          <div className="explanation-content">
            {explanation || `Based on your ${device_info.brand} ${device_info.type.replace('_', ' ')} with ${device_info.condition_name} condition and ${device_info.age} year(s) of age, our AI recommends ${decision.toLowerCase()} as the optimal choice.`}
          </div>
        </motion.div>

        {/* Materials Card */}
        <motion.div
          className="materials-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="explanation-title">
            <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
            Material Composition
          </h3>
          <div className="materials-grid">
            {Object.entries(materials).map(([material, amount]) => (
              <div key={material} className="material-item">
                <div className="material-icon">{materialIcons[material] || '⚫'}</div>
                <div className="material-name">{material}</div>
                <div className="material-amount">{amount}</div>
                <div className="material-unit">grams</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Environmental Dashboard */}
        <motion.div
          className="environmental-dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="dashboard-title">
            <Leaf size={20} style={{ color: 'var(--accent-primary)' }} />
            Environmental Impact Dashboard
          </h3>

          <div className="dashboard-grid">
            <div className="dashboard-metric">
              <div className="metric-icon">🌿</div>
              <div className="metric-value">{animatedValues.co2}</div>
              <div className="metric-label">kg CO2 Saved</div>
            </div>

            <div className="dashboard-metric">
              <div className="metric-icon">⚡</div>
              <div className="metric-value">{impact.materials_recovered}</div>
              <div className="metric-label">g Materials Recovered</div>
            </div>

            <div className="dashboard-metric">
              <div className="metric-icon">🗑️</div>
              <div className="metric-value">{impact.landfill_diverted}</div>
              <div className="metric-label">kg Landfill Diverted</div>
            </div>

            <div className="dashboard-metric">
              <div className="metric-icon">🌳</div>
              <div className="metric-value">{impact.trees_equivalent}</div>
              <div className="metric-label">Trees Equivalent</div>
            </div>
          </div>

          {/* Circularity Score */}
          <div className="circularity-section">
            <div className="circularity-header">
              <span className="circularity-title">Circularity Score</span>
              <span className="circularity-value">{animatedValues.circularity}%</span>
            </div>
            <div className="circularity-bar">
              <motion.div
                className="circularity-fill"
                initial={{ width: 0 }}
                animate={{ width: `${animatedValues.circularity}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              />
            </div>
            <p style={{ 
              marginTop: 'var(--spacing-md)', 
              fontSize: '0.9rem', 
              color: 'var(--text-muted)',
              textAlign: 'center'
            }}>
              {impact.circularity_score >= 80 
                ? '🌟 Excellent! Your choice maximizes resource efficiency.'
                : impact.circularity_score >= 60
                ? '👍 Good circularity score. You\'re making a positive impact!'
                : '💡 Consider options that improve resource reuse.'}
            </p>
          </div>

          {/* Additional Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--spacing-md)',
            marginTop: 'var(--spacing-xl)',
            paddingTop: 'var(--spacing-xl)',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)'
            }}>
              <Droplets size={24} style={{ color: '#0984e3' }} />
              <div>
                <div style={{ fontWeight: '600' }}>{impact.water_saved} L</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Water Saved</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)'
            }}>
              <Zap size={24} style={{ color: '#f39c12' }} />
              <div>
                <div style={{ fontWeight: '600' }}>{impact.energy_saved} kWh</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Energy Saved</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="action-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ marginTop: 'var(--spacing-xl)' }}
        >
          <button className="btn btn-secondary" onClick={handleStartOver}>
            <RotateCcw size={18} />
            Evaluate Another
          </button>

          {selectedOption === 'Recycle' ? (
            <button className="btn btn-primary btn-lg" onClick={handleProceed}>
              <Truck size={18} />
              Schedule Pickup
              <ChevronRight size={18} />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleProceed}>
              <CheckCircle size={18} />
              Confirm {selectedOption}
              <ChevronRight size={18} />
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Results;
