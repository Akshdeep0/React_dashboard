import React from 'react';
import { AppBar, Toolbar, Typography, Box, Chip } from '@mui/material';
import { Favorite, WifiTethering, WifiOff } from '@mui/icons-material';

const Header = ({ connected, deviceId }) => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1a1a1a', boxShadow: 'none', borderBottom: '1px solid #333' }}>
      <Toolbar>
        <Favorite sx={{ mr: 2, color: '#e91e63', fontSize: 32 }} />
        <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Real-Time ECG Monitor
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            icon={connected ? <WifiTethering /> : <WifiOff />}
            label={connected ? 'Connected' : 'Disconnected'}
            color={connected ? 'success' : 'error'}
            size="small"
          />
          {deviceId && (
            <Chip
              label={`Device: ${deviceId}`}
              size="small"
              sx={{ backgroundColor: '#333' }}
            />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 