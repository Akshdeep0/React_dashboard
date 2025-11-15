import React, { useState, useEffect, useRef } from 'react';
import { Activity, Heart, AlertCircle, Wifi, WifiOff, User, Droplet, Weight, Calendar, Users, LogOut, Save } from 'lucide-react';

// Mock Clerk hooks (replace with actual @clerk/clerk-react imports)
const useUser = () => ({
  isSignedIn: true,
  user: { id: 'user_123', primaryEmailAddress: { emailAddress: 'patient@example.com' } }
});

const useClerk = () => ({
  signOut: () => console.log('Signing out...')
});

const ECGDashboard = () => {
  // Auth state
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  // Patient data state
  const [patientData, setPatientData] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: '',
    weight: '',
    gender: '',
    age: ''
  });

  // ECG state
  const [ecgData, setEcgData] = useState([]);
  const [classification, setClassification] = useState('Normal');
  const [heartRate, setHeartRate] = useState(72);
  const [isConnected, setIsConnected] = useState(false);
  const [alert, setAlert] = useState(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Color palette
  const colors = {
    raisinBlack: '#201E1F',
    seaGreen: '#4C956C',
    lightYellow: '#FEFEE3',
    bittersweet: '#FF595E'
  };

  // Firebase operations (replace with actual Firebase SDK)
  const savePatientData = async (data) => {
    try {
      // Replace with actual Firebase call:
      // await setDoc(doc(db, 'patients', user.id), data);
      console.log('Saving to Firebase:', data);
      localStorage.setItem(`patient_${user.id}`, JSON.stringify(data));
      setPatientData(data);
      setShowProfileSetup(false);
      setIsEditingProfile(false);
      showAlert('Profile saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving patient data:', error);
      showAlert('Failed to save profile', 'danger');
    }
  };

  const loadPatientData = async () => {
    try {
      // Replace with actual Firebase call:
      // const docSnap = await getDoc(doc(db, 'patients', user.id));
      const stored = localStorage.getItem(`patient_${user.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        setPatientData(data);
        setFormData(data);
      } else {
        setShowProfileSetup(true);
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  // Load patient data on mount
  useEffect(() => {
    if (isSignedIn && user) {
      loadPatientData();
    }
  }, [isSignedIn, user]);

  // ECG simulation
  useEffect(() => {
    if (!patientData) return;

    setIsConnected(true);
    
    const interval = setInterval(() => {
      const timestamp = Date.now();
      const value = Math.sin(timestamp / 100) * 0.5 + Math.random() * 0.2;
      
      setEcgData(prev => {
        const newData = [...prev, { timestamp, value }];
        return newData.slice(-500);
      });

      if (timestamp % 5000 < 100) {
        const classifications = ['Normal', 'Tachycardia', 'Bradycardia', 'Arrhythmia'];
        const newClass = classifications[Math.floor(Math.random() * classifications.length)];
        setClassification(newClass);
        
        if (newClass === 'Tachycardia') {
          setHeartRate(Math.floor(Math.random() * 40) + 100);
          showAlert('High heart rate detected!', 'warning');
        } else if (newClass === 'Bradycardia') {
          setHeartRate(Math.floor(Math.random() * 20) + 40);
          showAlert('Low heart rate detected!', 'warning');
        } else if (newClass === 'Arrhythmia') {
          setHeartRate(Math.floor(Math.random() * 30) + 70);
          showAlert('Irregular rhythm detected!', 'danger');
        } else {
          setHeartRate(Math.floor(Math.random() * 20) + 60);
        }
      }
    }, 10);

    return () => clearInterval(interval);
  }, [patientData]);

  // Alert system
  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Draw ECG waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || ecgData.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      ctx.fillStyle = colors.raisinBlack;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(76, 149, 108, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      ctx.strokeStyle = colors.seaGreen;
      ctx.lineWidth = 2;
      ctx.beginPath();

      ecgData.forEach((point, index) => {
        const x = (index / ecgData.length) * width;
        const y = height / 2 - (point.value * height * 0.4);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [ecgData]);

  // Resize canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getClassificationColor = () => {
    switch (classification) {
      case 'Tachycardia':
      case 'Bradycardia':
        return colors.lightYellow;
      case 'Arrhythmia':
        return colors.bittersweet;
      default:
        return colors.seaGreen;
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.bloodGroup || !formData.weight || !formData.gender || !formData.age) {
      showAlert('Please fill all fields', 'warning');
      return;
    }
    savePatientData(formData);
  };

  // Profile Setup/Edit Form
  if (showProfileSetup || isEditingProfile) {
    return (
      <div style={{ 
        backgroundColor: colors.raisinBlack, 
        minHeight: '100vh', 
        color: colors.lightYellow,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: 'rgba(76, 149, 108, 0.05)',
          border: `2px solid ${colors.seaGreen}`,
          borderRadius: '12px',
          padding: '32px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Activity size={48} color={colors.seaGreen} style={{ margin: '0 auto 16px' }} />
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700 }}>
              {isEditingProfile ? 'Edit Profile' : 'Complete Your Profile'}
            </h1>
            <p style={{ marginTop: '8px', opacity: 0.7, fontSize: '14px' }}>
              {isEditingProfile ? 'Update your patient information' : 'Please provide your details to continue'}
            </p>
          </div>

          <form onSubmit={handleFormSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  <User size={18} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter your full name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: colors.raisinBlack,
                    border: `2px solid ${colors.seaGreen}`,
                    borderRadius: '8px',
                    color: colors.lightYellow,
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Blood Group & Gender Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                    <Droplet size={18} />
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: colors.raisinBlack,
                      border: `2px solid ${colors.seaGreen}`,
                      borderRadius: '8px',
                      color: colors.lightYellow,
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                    <Users size={18} />
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: colors.raisinBlack,
                      border: `2px solid ${colors.seaGreen}`,
                      borderRadius: '8px',
                      color: colors.lightYellow,
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Weight & Age Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                    <Weight size={18} />
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleFormChange}
                    placeholder="Enter weight"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: colors.raisinBlack,
                      border: `2px solid ${colors.seaGreen}`,
                      borderRadius: '8px',
                      color: colors.lightYellow,
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                    <Calendar size={18} />
                    Age (years)
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleFormChange}
                    placeholder="Enter age"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: colors.raisinBlack,
                      border: `2px solid ${colors.seaGreen}`,
                      borderRadius: '8px',
                      color: colors.lightYellow,
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: colors.seaGreen,
                  border: 'none',
                  borderRadius: '8px',
                  color: colors.raisinBlack,
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Save size={20} />
                {isEditingProfile ? 'Update Profile' : 'Save & Continue'}
              </button>

              {isEditingProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: 'transparent',
                    border: `2px solid ${colors.seaGreen}`,
                    borderRadius: '8px',
                    color: colors.seaGreen,
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div style={{ 
      backgroundColor: colors.raisinBlack, 
      minHeight: '100vh', 
      color: colors.lightYellow,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Alert Banner */}
      {alert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: alert.type === 'danger' ? colors.bittersweet : 
                          alert.type === 'success' ? colors.seaGreen : colors.lightYellow,
          color: colors.raisinBlack,
          padding: '16px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
          <AlertCircle size={24} />
          <span style={{ fontWeight: 600, fontSize: '16px' }}>{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '24px',
        borderBottom: `2px solid ${colors.seaGreen}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={32} color={colors.seaGreen} />
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>ECG Monitor</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isConnected ? (
              <>
                <Wifi size={20} color={colors.seaGreen} />
                <span style={{ fontSize: '14px', color: colors.seaGreen }}>Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={20} color={colors.bittersweet} />
                <span style={{ fontSize: '14px', color: colors.bittersweet }}>Disconnected</span>
              </>
            )}
          </div>
          <button
            onClick={() => signOut()}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: `2px solid ${colors.bittersweet}`,
              borderRadius: '8px',
              color: colors.bittersweet,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Patient Info Card */}
        {patientData && (
          <div style={{
            backgroundColor: 'rgba(76, 149, 108, 0.1)',
            border: `2px solid ${colors.seaGreen}`,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>2
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={24} />
                Patient Information
              </h2>
              <button
                onClick={() => setIsEditingProfile(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: colors.seaGreen,
                  border: 'none',
                  borderRadius: '8px',
                  color: colors.raisinBlack,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Edit Profile
              </button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Name</div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>{patientData.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Blood Group</div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>{patientData.bloodGroup}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Weight</div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>{patientData.weight} kg</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Gender</div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>{patientData.gender}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Age</div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>{patientData.age} years</div>
              </div>
            </div>
          </div>
        )}

        {/* Status Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {/* Heart Rate Card */}
          <div style={{
            backgroundColor: 'rgba(76, 149, 108, 0.1)',
            border: `2px solid ${colors.seaGreen}`,
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
              <Heart size={20} />
              <span style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Heart Rate</span>
            </div>
            <div style={{ fontSize: '48px', fontWeight: 700, color: colors.seaGreen }}>
              {heartRate}
              <span style={{ fontSize: '24px', marginLeft: '8px' }}>bpm</span>
            </div>
          </div>

          {/* Classification Card */}
          <div style={{
            backgroundColor: 'rgba(254, 254, 227, 0.05)',
            border: `2px solid ${getClassificationColor()}`,
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
              <Activity size={20} />
              <span style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Classification</span>
            </div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 700, 
              color: getClassificationColor()
            }}>
              {classification}
            </div>
          </div>

          {/* Data Points Card */}
          <div style={{
            backgroundColor: 'rgba(76, 149, 108, 0.1)',
            border: `2px solid ${colors.seaGreen}`,
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
              <Activity size={20} />
              <span style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Sample Rate</span>
            </div>
            <div style={{ fontSize: '48px', fontWeight: 700, color: colors.seaGreen }}>
              100
              <span style={{ fontSize: '24px', marginLeft: '8px' }}>Hz</span>
            </div>
          </div>
        </div>

        {/* ECG Waveform */}
        <div style={{
          backgroundColor: 'rgba(76, 149, 108, 0.05)',
          border: `2px solid ${colors.seaGreen}`,
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Live ECG Waveform</h2>
            <span style={{ fontSize: '14px', opacity: 0.7 }}>Last 5 seconds</span>
          </div>
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '300px',
              borderRadius: '8px',
              backgroundColor: colors.raisinBlack
            }}
          />
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          fontSize: '14px',
          opacity: 0.7,
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '3px', backgroundColor: colors.seaGreen }}></div>
            <span>Normal / Active Signal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '3px', backgroundColor: colors.lightYellow }}></div>
            <span>Warning (Tachy/Brady)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '3px', backgroundColor: colors.bittersweet }}></div>
            <span>Critical (Arrhythmia)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ECGDashboard;