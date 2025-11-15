import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ECGWaveform = ({ ecgData, classification }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'ECG Signal',
      data: [],
      borderColor: '#00ff00',
      backgroundColor: 'rgba(0, 255, 0, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0
    }]
  });

  useEffect(() => {
    if (ecgData && ecgData.length > 0) {
      // Create time labels (0 to 5 seconds)
      const labels = ecgData.map((_, index) => (index / 100).toFixed(2));
      
      // Get color based on classification
      const getColor = () => {
        if (!classification) return '#00ff00';
        switch (classification.class) {
          case 'Normal': return '#00ff00';
          case 'Tachycardia': return '#ffaa00';
          case 'Bradycardia': return '#00aaff';
          case 'Arrhythmia': return '#ff0000';
          default: return '#00ff00';
        }
      };

      const color = getColor();

      setChartData({
        labels,
        datasets: [{
          label: 'ECG Signal',
          data: ecgData,
          borderColor: color,
          backgroundColor: `${color}20`,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      });
    }
  }, [ecgData, classification]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#ffffff'
        }
      },
      title: {
        display: true,
        text: 'Real-Time ECG Waveform (5-second window)',
        color: '#ffffff',
        font: {
          size: 16
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time (seconds)',
          color: '#ffffff'
        },
        ticks: {
          color: '#ffffff',
          maxTicksLimit: 10
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Amplitude (ADC Units)',
          color: '#ffffff'
        },
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  return (
    <div style={{ height: '400px', padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '10px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ECGWaveform;