import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Laptop, 
  Recycle, 
  Zap, 
  ArrowRight,
  Cpu,
  TreePine,
  Droplets,
  Wind,
  Tablet,
} from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState({
    devicesEvaluated: 0,
    co2Saved: 0,
    usersActive: 0
  });

  useEffect(() => {
    const targetStats = {
      devicesEvaluated: 15847,
      co2Saved: 423,
      usersActive: 3254
    };

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setStats({
        devicesEvaluated: Math.floor(targetStats.devicesEvaluated * progress),
        co2Saved: Math.floor(targetStats.co2Saved * progress),
        usersActive: Math.floor(targetStats.usersActive * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setStats(targetStats);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const impactStats = [
    { icon: <TreePine size={36} />, value: '423K', label: 'kg CO2 Saved', color: '#00d4aa' },
    { icon: <Recycle size={36} />, value: '89K', label: 'kg Materials Recovered', color: '#0984e3' },
    { icon: <Droplets size={36} />, value: '1.2M', label: 'Liters Water Saved', color: '#a29bfe' },
    { icon: <Wind size={36} />, value: '850K', label: 'kWh Energy Saved', color: '#f39c12' }
  ];

  const glassStyle = {
    background: 'rgba(255,255,255,0.03)',
    padding: '14px',
    borderRadius: '18px',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
    cursor: 'pointer'
  };

  return (
    <div className="home-page" style={{ background: '#020617', color: 'white', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HERO SECTION */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden', paddingTop: '80px' }}>
        
        {/* Background Twinkling Stars */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4, zIndex: 0 }}>
           {[...Array(30)].map((_, i) => (
             <motion.div
               key={i}
               animate={{ opacity: [0.1, 0.7, 0.1] }}
               transition={{ duration: Math.random() * 4 + 2, repeat: Infinity }}
               style={{
                 position: 'absolute',
                 left: `${Math.random() * 100}%`,
                 top: `${Math.random() * 100}%`,
                 width: '2px',
                 height: '2px',
                 background: 'white',
                 borderRadius: '50%'
               }}
             />
           ))}
        </div>

        <div className="hero-container" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.1fr 0.9fr', 
          alignItems: 'center', 
          minHeight: '85vh',
          maxWidth: '1300px',
          margin: '0 auto',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 1
        }}>
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-badge" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '10px', 
              background: 'rgba(0, 212, 170, 0.08)', 
              padding: '8px 20px', 
              borderRadius: '100px', 
              color: '#00d4aa',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '2rem',
              border: '1px solid rgba(0, 212, 170, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '1.5px'
            }}>
              <span style={{ width: '8px', height: '8px', background: '#00d4aa', borderRadius: '50%', boxShadow: '0 0 10px #00d4aa' }}></span>
              The Future of E-Waste AI
            </div>
            
            <h1 style={{ fontSize: '4.8rem', fontWeight: '900', lineHeight: '1.05', marginBottom: '1.5rem', letterSpacing: '-2px' }}>
              Give Your Tech<br />
              <span style={{ 
                background: 'linear-gradient(135deg, #00d4aa 0%, #0984e3 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
              }}>a Second Life</span>
            </h1>
            
            <p style={{ fontSize: '1.3rem', opacity: 0.7, marginBottom: '3rem', maxWidth: '580px', lineHeight: '1.6' }}>
              Join the circular economy. Our AI identifies the most sustainable and profitable path for your old electronics in seconds.
            </p>
            
            <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '5rem' }}>
              <Link to="/evaluate" className="btn-primary" style={{ 
                background: '#00d4aa', 
                padding: '18px 40px', 
                borderRadius: '16px', 
                fontWeight: '700', 
                color: '#020617',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 15px 30px -10px rgba(0, 212, 170, 0.5)'
              }}>
                <Zap size={20} fill="#020617" />
                Evaluate My Device
              </Link>
              <Link to="/progress" style={{ 
                padding: '18px 40px', 
                borderRadius: '16px', 
                fontWeight: '600', 
                color: 'white',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255,255,255,0.03)'
              }}>
                Impact Dashboard
                <ArrowRight size={20} />
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '5rem' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#00d4aa' }}>{stats.devicesEvaluated.toLocaleString()}+</div>
                <div style={{ opacity: 0.5, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Evaluations</div>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0984e3' }}>{stats.co2Saved}K</div>
                <div style={{ opacity: 0.5, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>kg CO2 Saved</div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE: STATIC EARTH + FLOATING ICONS */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            
            <div style={{ 
              position: 'absolute', 
              width: '550px', 
              height: '550px', 
              background: 'radial-gradient(circle, rgba(0, 212, 170, 0.12) 0%, transparent 70%)', 
              borderRadius: '50%',
              filter: 'blur(50px)'
            }}></div>

            {/* Earth is now STATIC (No rotation) */}
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/2/22/Earth_Western_Hemisphere_transparent_background.png" 
              alt="Realistic Earth"
              style={{ 
                width: '100%', 
                maxWidth: '520px', 
                zIndex: 2, 
                filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.9))' 
              }}
            />

            {/* Orbiting Tech Icons with Hover Scale */}
            <motion.div 
              whileHover={{ scale: 1.2 }}
              animate={{ y: [0, -25, 0], rotate: [0, 10, 0] }} 
              transition={{ 
                y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.2 } 
              }}
              style={{ position: 'absolute', top: '5%', left: '-5%', zIndex: 3, ...glassStyle }}>
              <Laptop size={34} color="#00d4aa" />
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.2 }}
              animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }} 
              transition={{ 
                y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                scale: { duration: 0.2 } 
              }}
              style={{ position: 'absolute', bottom: '10%', right: '-5%', zIndex: 3, ...glassStyle }}>
              <Tablet size={30} color="#0984e3" />
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.2 }}
              animate={{ x: [0, 15, 0], y: [0, -15, 0] }} 
              transition={{ 
                x: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 },
                scale: { duration: 0.2 } 
              }}
              style={{ position: 'absolute', top: '15%', right: '5%', zIndex: 3, ...glassStyle }}>
              <Smartphone size={28} color="#a29bfe" />
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.3, opacity: 1 }}
              animate={{ y: [0, 20, 0], x: [0, -10, 0] }} 
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: 'absolute', top: '45%', left: '-15%', zIndex: 1, opacity: 0.4, cursor: 'pointer' }}>
              <Cpu size={45} color="#00d4aa" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* GLOBAL ENVIRONMENTAL IMPACT SECTION */}
      <section style={{ padding: '140px 0', position: 'relative', background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,212,170,0.3), transparent)' }}></div>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              style={{ color: '#00d4aa', textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.8rem', fontWeight: '800' }}
            >
              Sustainability Data
            </motion.span>
            <h2 style={{ fontSize: '3.8rem', fontWeight: '900', marginTop: '1.5rem', letterSpacing: '-1.5px' }}>
              Global <span style={{ color: '#00d4aa' }}>Environmental</span> Impact
            </h2>
            <p style={{ opacity: 0.5, maxWidth: '650px', margin: '1.5rem auto 0', fontSize: '1.2rem', lineHeight: '1.6' }}>
              By choosing to recycle and reuse, our community is creating a measurable positive change for the planet's future.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2.5rem' }}>
            {impactStats.map((stat, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -15, backgroundColor: 'rgba(255,255,255,0.04)', borderColor: stat.color }}
                style={{ 
                  padding: '4rem 2rem', 
                  background: 'rgba(255,255,255,0.015)', 
                  borderRadius: '40px', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  textAlign: 'center',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ 
                  position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', 
                  width: '140px', height: '140px', background: stat.color, 
                  filter: 'blur(70px)', opacity: 0.12, zIndex: 0
                }}></div>

                <div style={{ 
                  color: stat.color, marginBottom: '2.5rem', display: 'inline-flex', 
                  padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '28px',
                  position: 'relative', zIndex: 1, boxShadow: `0 15px 30px -10px ${stat.color}44`
                }}>
                  {stat.icon}
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '3.8rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-2px' }}>
                    {stat.value}
                  </div>
                  <div style={{ 
                    opacity: 0.7, textTransform: 'uppercase', letterSpacing: '2px', 
                    fontSize: '0.8rem', fontWeight: '800', color: stat.color
                  }}>
                    {stat.label}
                  </div>
                </div>

                <div style={{ 
                  position: 'absolute', bottom: 0, left: '15%', right: '15%', height: '3px', 
                  background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                  opacity: 0.5 
                }}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: '120px 20px', textAlign: 'center' }}>
        <motion.div 
          whileHover={{ scale: 1.01 }}
          style={{ 
            maxWidth: '1100px', margin: '0 auto', padding: '80px 40px', 
            background: 'linear-gradient(135deg, rgba(0,212,170,0.05) 0%, rgba(9,132,227,0.05) 100%)',
            borderRadius: '50px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden'
          }}>
          <h2 style={{ fontSize: '3.2rem', fontWeight: '900', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
            Ready to Build a Greener Future?
          </h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.6, marginBottom: '3.5rem', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
            It takes less than 2 minutes to evaluate your device and find the best way to handle your E-waste responsibly.
          </p>
          <Link to="/evaluate" className="btn-primary" style={{ 
            display: 'inline-flex', background: '#fff', padding: '20px 50px', 
            borderRadius: '18px', fontWeight: '800', color: '#020617', textDecoration: 'none',
            boxShadow: '0 20px 40px rgba(255,255,255,0.1)'
          }}>
            Evaluate Now
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;