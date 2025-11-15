import React from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress } from '@mui/material';
import { Favorite, Warning, CheckCircle, Error } from '@mui/icons-material';

const ClassificationPanel = ({ classification, heartRate, deviceId, timestamp }) => {
  if (!classification) {
    return (
      <Card sx={{ backgroundColor: '#1e1e1e', color: '#fff', height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Classification
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Waiting for ECG data...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getClassColor = () => {
    switch (classification.class) {
      case 'Normal': return '#4caf50';
      case 'Tachycardia': return '#ff9800';
      case 'Bradycardia': return '#2196f3';
      case 'Arrhythmia': return '#f44336';
      default: return '#757575';
    }
  };

  const getClassIcon = () => {
    switch (classification.class) {
      case 'Normal': return <CheckCircle sx={{ color: '#4caf50', fontSize: 40 }} />;
      case 'Tachycardia': return <Warning sx={{ color: '#ff9800', fontSize: 40 }} />;
      case 'Bradycardia': return <Warning sx={{ color: '#2196f3', fontSize: 40 }} />;
      case 'Arrhythmia': return <Error sx={{ color: '#f44336', fontSize: 40 }} />;
      default: return <Favorite sx={{ color: '#757575', fontSize: 40 }} />;
    }
  };

  const getClassDescription = () => {
    switch (classification.class) {
      case 'Normal': return 'Normal Sinus Rhythm';
      case 'Tachycardia': return 'Fast heart rate (>100 BPM)';
      case 'Bradycardia': return 'Slow heart rate (<60 BPM)';
      case 'Arrhythmia': return 'Irregular heart rhythm';
      default: return 'Unknown classification';
    }
  };

  return (
    <Card sx={{ backgroundColor: '#1e1e1e', color: '#fff', height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Current Classification
        </Typography>

        {/* Main Classification */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2 }}>
          {getClassIcon()}
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography variant="h4" sx={{ color: getClassColor(), fontWeight: 'bold' }}>
              {classification.class}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getClassDescription()}
            </Typography>
          </Box>
        </Box>

        {/* Confidence */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Confidence</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {(classification.confidence * 100).toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={classification.confidence * 100}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getClassColor(),
                borderRadius: 5
              }
            }}
          />
        </Box>

        {/* Heart Rate */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, backgroundColor: '#2a2a2a', borderRadius: 2 }}>
          <Favorite sx={{ color: '#e91e63', fontSize: 30, mr: 2 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {heartRate} BPM
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Heart Rate
            </Typography>
          </Box>
        </Box>

        {/* Device Info */}
        <Box sx={{ mt: 2 }}>
          <Chip 
            label={`Device: ${deviceId}`} 
            size="small" 
            sx={{ mr: 1, mb: 1, backgroundColor: '#333' }} 
          />
          <Chip 
            label={`Code: ${classification.class_code}`} 
            size="small" 
            sx={{ mr: 1, mb: 1, backgroundColor: '#333' }} 
          />
          {classification.high_confidence && (
            <Chip 
              label="High Confidence" 
              size="small" 
              color="success"
              sx={{ mb: 1 }} 
            />
          )}
        </Box>

        {/* Probabilities */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Class Probabilities
          </Typography>
          {Object.entries(classification.probabilities || {}).map(([className, prob]) => (
            <Box key={className} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption">{className}</Typography>
                <Typography variant="caption">{(prob * 100).toFixed(1)}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={prob * 100}
                sx={{
                  height: 4,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: className === classification.class ? getClassColor() : '#555'
                  }
                }}
              />
            </Box>
          ))}
        </Box>

        {/* Timestamp */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Last update: {timestamp ? new Date(timestamp).toLocaleTimeString() : 'N/A'}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ClassificationPanel;