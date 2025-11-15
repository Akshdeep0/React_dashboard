import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Alert, IconButton, Badge, List, ListItem, ListItemText, Chip } from '@mui/material';
import { NotificationsActive, Close, Warning, Error as ErrorIcon, Info } from '@mui/icons-material';

const AlertPanel = ({ alert, classification }) => {
  const [alerts, setAlerts] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (alert && alert.triggered) {
      const newAlert = {
        id: Date.now(),
        severity: alert.severity,
        message: alert.message,
        confidence: alert.confidence,
        timestamp: alert.timestamp || new Date().toISOString(),
        classification: classification?.class
      };

      setAlerts(prev => [newAlert, ...prev].slice(0, 10)); // Keep last 10 alerts
      setShowPanel(true);

      // Auto-hide non-critical alerts after 10 seconds
      if (alert.severity !== 'critical') {
        setTimeout(() => {
          setShowPanel(false);
        }, 10000);
      }
    }
  }, [alert, classification]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#757575';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <ErrorIcon />;
      case 'warning': return <Warning />;
      case 'info': return <Info />;
      default: return <NotificationsActive />;
    }
  };

  const clearAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const activeAlerts = alerts.filter(a => 
    (new Date() - new Date(a.timestamp)) < 60000 // Last minute
  );

  return (
    <>
      {/* Active Alert Banner */}
      {showPanel && alert?.triggered && (
        <Box sx={{ mb: 2 }}>
          <Alert
            severity={alert.severity === 'critical' ? 'error' : 'warning'}
            icon={getSeverityIcon(alert.severity)}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setShowPanel(false)}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
            sx={{
              backgroundColor: alert.severity === 'critical' ? '#d32f2f' : '#f57c00',
              color: '#fff',
              '& .MuiAlert-icon': { color: '#fff' }
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {alert.message}
            </Typography>
            <Typography variant="caption">
              Confidence: {(alert.confidence * 100).toFixed(1)}% | {new Date(alert.timestamp).toLocaleTimeString()}
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Alert History Panel */}
      <Card sx={{ backgroundColor: '#1e1e1e', color: '#fff', height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              <Badge badgeContent={activeAlerts.length} color="error">
                Alerts
              </Badge>
            </Typography>
            {alerts.length > 0 && (
              <Chip 
                label={`${alerts.length} total`} 
                size="small" 
                sx={{ backgroundColor: '#333' }}
              />
            )}
          </Box>

          {alerts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsActive sx={{ fontSize: 60, color: '#555', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                No alerts yet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Abnormalities will be displayed here
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {alerts.map((alert) => {
                const isRecent = (new Date() - new Date(alert.timestamp)) < 60000;
                return (
                  <ListItem
                    key={alert.id}
                    sx={{
                      backgroundColor: isRecent ? 'rgba(244, 67, 54, 0.1)' : '#2a2a2a',
                      borderRadius: 1,
                      mb: 1,
                      border: isRecent ? '1px solid rgba(244, 67, 54, 0.5)' : 'none'
                    }}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => clearAlert(alert.id)} size="small">
                        <Close sx={{ color: '#999' }} />
                      </IconButton>
                    }
                  >
                    <Box sx={{ mr: 2, color: getSeverityColor(alert.severity) }}>
                      {getSeverityIcon(alert.severity)}
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: isRecent ? 'bold' : 'normal' }}>
                          {alert.message}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {alert.classification} | Confidence: {(alert.confidence * 100).toFixed(1)}%
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(alert.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AlertPanel;