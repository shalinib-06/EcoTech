import React, { useState, createContext, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Evaluate from './pages/Evaluate';
import Results from './pages/Results';
import Pickup from './pages/Pickup';
import Progress from './pages/Progress';

// Create context for global state
export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

function App() {
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [userProgress, setUserProgress] = useState({
    eco_points: 0,
    devices_evaluated: 0,
    total_co2_saved: 0,
    level: 1,
    badges: [],
    points_history: []
  });
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9));

  const contextValue = {
    evaluationResult,
    setEvaluationResult,
    userProgress,
    setUserProgress,
    userId
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/evaluate" element={<Evaluate />} />
            <Route path="/results" element={<Results />} />
            <Route path="/pickup" element={<Pickup />} />
            <Route path="/progress" element={<Progress />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AppContext.Provider>
  );
}

export default App;
