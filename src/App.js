/* global chrome */
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import "./App.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [goal, setGoal] = useState("");
  const [savedGoal, setSavedGoal] = useState("");
  const [usageData, setUsageData] = useState({});
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    // Check if chrome API is available (for development)
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // Fetch saved goal
      chrome.storage.local.get(["dailyGoal"], (result) => {
        if (result.dailyGoal) setSavedGoal(result.dailyGoal);
      });

      // Fetch usage data and update chart
      chrome.storage.local.get(["usage"], (result) => {
        const data = result.usage || {};
        setUsageData(data);
        updateChartData(data);
      });
    } else {
      // Mock data for development
      setSavedGoal("Complete project");
      setUsageData({
        "google.com": 125,
        "youtube.com": 300,
        "github.com": 420
      });
      updateChartData({
        "google.com": 125,
        "youtube.com": 300,
        "github.com": 420
      });
    }
  }, []);

  const updateChartData = (data) => {
    const labels = Object.keys(data);
    const times = Object.values(data).map(seconds => Math.floor(seconds / 60));

    if (labels.length > 0 && times.length > 0) {
      setChartData({
        labels: labels,
        datasets: [{
          label: 'Time Spent (Minutes)',
          data: times,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        }],
      });
    }
  };

  const handleSaveGoal = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ dailyGoal: goal }, () => setSavedGoal(goal));
    } else {
      setSavedGoal(goal);
    }
  };

  return (
    <div className="App">
      <h2>🎯 Productivity Tracker</h2>

      <input
        type="text"
        placeholder="Set your daily goal"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />
      <button onClick={handleSaveGoal}>Save Goal</button>

      {savedGoal && <p><strong>Today's Goal:</strong> {savedGoal}</p>}

      <h3>📊 Website Usage:</h3>
      <ul>
        {Object.entries(usageData).map(([site, time]) => (
          <li key={site}>
            <strong>{site}</strong>: {Math.floor(time / 60)}m {time % 60}s
          </li>
        ))}
      </ul>

      <h3>📈 Productivity Trends:</h3>
      <div style={{ width: '100%', margin: '0' }}>
        {chartData.labels?.length > 0 ? (
          <Bar 
            data={chartData} 
            options={{ 
              responsive: true, 
              plugins: { 
                title: { 
                  display: true, 
                  text: 'Time Spent on Websites' 
                } 
              } 
            }} 
          />
        ) : (
          <p>No data available to display the chart.</p>
        )}
      </div>
    </div>
  );
}

export default App;