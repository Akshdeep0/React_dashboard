import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Grid, Box } from '@mui/material';
import Header from './components/Header';
import ECGWaveform from './components/ECGWaveform';
import ClassificationPanel from './components/ClassificationPanel';
import AlertPanel from './components/AlertPanel';
import StatisticsPanel from './components/StatisticsPanel';
import websocketService from './services/websocket';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff00',
    },
    secondary: {
      main: '#e91e63',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [connected, setConnected] = useState(false);
  const [ecgData, setEcgData] = useState([]);
  const [classification, setClassification] = useState(null);
  const [heartRate, setHeartRate] = useState(0);
  const [deviceId, setDeviceId] = useState('');
  const [timestamp, setTimestamp] = useState(null);
  const [alert, setAlert] = useState({ triggered: false });
  const [inferenceTime, setInferenceTime] = useState(0);

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Setup event listeners
    websocketService.on('connection_established', () => {
      setConnected(true);
      console.log('WebSocket connected');
    });

    websocketService.on('connection_lost', () => {
      setConnected(false);
      console.log('WebSocket disconnected');
    });

    websocketService.on('ecg_data', (data) => {
      console.log('Received ECG data:', data);
      
      setEcgData(data.ecg_samples || []);
      setClassification(data.classification || null);
      setHeartRate(data.heart_rate || 0);
      setDeviceId(data.device_id || '');
      setTimestamp(data.timestamp);
      setAlert(data.alert || { triggered: false });
      
      // If inference time is in the data
      if (data.inference_time_ms) {
        setInferenceTime(data.inference_time_ms);
      }
    });

    websocketService.on('status_update', (data) => {
      console.log('Status update:', data);
    });

    // Request initial status
    setTimeout(() => {
      websocketService.requestStatus();
    }, 1000);

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
        <Header connected={connected} deviceId={deviceId} />
        
        <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
          <Grid container spacing={3}>
            {/* ECG Waveform - Full Width */}
            <Grid item xs={12}>
              <ECGWaveform ecgData={ecgData} classification={classification} />
            </Grid>

            {/* Classification Panel */}
            <Grid item xs={12} md={4}>
              <ClassificationPanel
                classification={classification}
                heartRate={heartRate}
                deviceId={deviceId}
                timestamp={timestamp}
              />
            </Grid>

            {/* Alert Panel */}
            <Grid item xs={12} md={8}>
              <AlertPanel alert={alert} classification={classification} />
            </Grid>

            {/* Statistics Panel - Full Width */}
            <Grid item xs={12}>
              <StatisticsPanel
                classification={classification}
                heartRate={heartRate}
                inferenceTime={inferenceTime}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App();