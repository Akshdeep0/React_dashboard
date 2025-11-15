import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import { TrendingUp, Speed, Timer, CheckCircle } from '@mui/icons-material';

const StatisticsPanel = ({ classification, heartRate, inferenceTime }) => {
  const [stats, setStats] = useState({
    totalReadings: 0,
    avgHeartRate: 0,
    avgConfidence: 0,
    avgInferenceTime: 0,
    normalCount: 0,
    abnormalCount: 0,
    lastUpdate: null
  });

  useEffect(() => {
    if (classification && heartRate) {
      setStats(prev => {
        const newTotal = prev.totalReadings + 1;
        const newNormal = classification.class === 'Normal' ? prev.normalCount + 1 : prev.normalCount;
        const newAbnormal = classification.class !== 'Normal' ? prev.abnormalCount + 1 : prev.abnormalCount;

        return {
          totalReadings: newTotal,
          avgHeartRate: ((prev.avgHeartRate * prev.totalReadings) + heartRate) / newTotal,
          avgConfidence: ((prev.avgConfidence * prev.totalReadings) + classification.confidence) / newTotal,
          avgInferenceTime: inferenceTime ? ((prev.avgInferenceTime * prev.totalReadings) + inferenceTime) / newTotal : prev.avgInferenceTime,
          normalCount: newNormal,
          abnormalCount: newAbnormal,
          lastUpdate: new Date().toISOString()
        };
      });
    }
  }, [classification, heartRate, inferenceTime]);

  const StatCard = ({ icon, title, value, unit, color }) => (
    <Card sx={{ backgroundColor: '#2a2a2a', color: '#fff' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ color: color, mr: 1 }}>
            {icon}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {typeof value === 'number' ? value.toFixed(1) : value}
          <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
            {unit}
          </Typography>
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Card sx={{ backgroundColor: '#1e1e1e', color: '#fff' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Session Statistics
        </Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6} sm={3}>
            <StatCard
              icon={<CheckCircle />}
              title="Total Readings"
              value={stats.totalReadings}
              unit=""
              color="#4caf50"
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <StatCard
              icon={<TrendingUp />}
              title="Avg Heart Rate"
              value={stats.avgHeartRate}
              unit="BPM"
              color="#e91e63"
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <StatCard
              icon={<Speed />}
              title="Avg Confidence"
              value={stats.avgConfidence * 100}
              unit="%"
              color="#2196f3"
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <StatCard
              icon={<Timer />}
              title="Avg Inference"
              value={stats.avgInferenceTime}
              unit="ms"
              color="#ff9800"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-around' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
              {stats.normalCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Normal Readings
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 'bold' }}>
              {stats.abnormalCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Abnormal Readings
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
              {stats.totalReadings > 0 ? ((stats.normalCount / stats.totalReadings) * 100).toFixed(0) : 0}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Normal Rate
            </Typography>
          </Box>
        </Box>

        {stats.lastUpdate && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
            Last updated: {new Date(stats.lastUpdate).toLocaleTimeString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatisticsPanel;