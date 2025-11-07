import React, { useEffect, useState } from 'react';
import './Dashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://pg-cards.vercel.app';

const fallbackInsights = {
  totalScans: 90533,
  contactShares: 2223,
  feedbacks: 63400,
  topCards: [
    { name: 'Executive NFC Card', scans: 15890, conversionRate: 37 },
    { name: 'Premium Gold Card', scans: 12104, conversionRate: 32 },
    { name: 'Standard NFC Card', scans: 9987, conversionRate: 28 },
  ],
  recentActivity: [
    { id: 1, time: '2 minutes ago', description: 'John Carter scanned Premium Gold Card', type: 'scan' },
    { id: 2, time: '12 minutes ago', description: 'New contact shared via Executive NFC Card', type: 'share' },
    { id: 3, time: '35 minutes ago', description: 'Sarah Williams left feedback on QR Promo card', type: 'feedback' },
  ],
};

const Dashboard = ({ user, token, onLogout }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [insights, setInsights] = useState(fallbackInsights);

  useEffect(() => {
    const controller = new AbortController();

    const fetchInsights = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/card/insights`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Unable to load insights data. Showing sample data instead.');
        }

        const result = await response.json();
        const data = result?.data;
        if (data) {
          setInsights({
            totalScans: data.totalScans ?? fallbackInsights.totalScans,
            contactShares: data.contactShares ?? fallbackInsights.contactShares,
            feedbacks: data.feedbacks ?? fallbackInsights.feedbacks,
            topCards: data.topCards?.length ? data.topCards : fallbackInsights.topCards,
            recentActivity: data.recentActivity?.length ? data.recentActivity : fallbackInsights.recentActivity,
          });
        }
      } catch (err) {
        console.error('Dashboard insights error:', err);
        setError(err.message || 'Unable to load insights at the moment.');
        setInsights(fallbackInsights);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();

    return () => controller.abort();
  }, [token]);

  return (
    <section id="dashboard" className="dashboard">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-label">PG DASHBOARD</span>
          </div>
          <nav className="sidebar-nav">
            <button className="nav-item active">Dashboard</button>
            <button className="nav-item">Leads</button>
            <button className="nav-item">Exchange Contact</button>
            <button className="nav-item">My Cards</button>
            <button className="nav-item">My Orders</button>
            <button className="nav-item">Address Book</button>
            <button className="nav-item">PG Statistics</button>
            <button className="nav-item">Settings</button>
            <button 
            className="sidebar-logout" 
            onClick={() => {
              if (onLogout) {
                onLogout();
              }
            }}
          >
            Logout
          </button>
          </nav>
          
        </aside>

        <main className="dashboard-main">
          <header className="dashboard-main-header">
            <div>
              <h1>Dashboard</h1>
              <p>Home / Dashboard</p>
            </div>
            <div className="dashboard-header-actions">
              <button className="dashboard-btn primary">Add New Card</button>
              <button className="dashboard-btn secondary">Share Contact</button>
            </div>
          </header>

          {error && <div className="dashboard-alert">{error}</div>}

          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">Taps</span>
              <span className="stat-value">{insights.totalScans.toLocaleString()}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Contact Shares</span>
              <span className="stat-value">{insights.contactShares.toLocaleString()}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Feedbacks</span>
              <span className="stat-value">{insights.feedbacks.toLocaleString()}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Total Cards</span>
              <span className="stat-value">12</span>
            </div>
          </div>

          <div className="data-grid">
            <div className="data-card large">
              <div className="data-card-header">
                <h2>Social Media Clicks</h2>
                <span>No data available</span>
              </div>
              <div className="data-card-body empty-state">Connect your cards to start tracking social clicks.</div>
            </div>
            <div className="data-card large">
              <div className="data-card-header">
                <h2>Geo Data</h2>
                <div className="geo-tabs">
                  <button className="active">Taps</button>
                  <button>Leads</button>
                  <button>Save Contact</button>
                </div>
              </div>
              <div className="data-card-body geo-placeholder">Geo map coming soon</div>
            </div>
          </div>

          <div className="data-grid">
            <div className="data-card">
              <div className="data-card-header">
                <h2>Digital Wallet</h2>
              </div>
              <div className="wallet-buttons">
                <button className="wallet-btn google">Add Google Wallet</button>
                <button className="wallet-btn apple">Add Apple Wallet</button>
              </div>
            </div>
            <div className="data-card">
              <div className="data-card-header">
                <h2>PG Feeds</h2>
              </div>
              <div className="data-card-body empty-state">No feeds available</div>
            </div>
            <div className="data-card">
              <div className="data-card-header">
                <h2>Card Taps Trend</h2>
                <button className="filter-btn">Filter ▾</button>
              </div>
              <div className="data-card-body empty-chart">Chart data will appear here</div>
            </div>
          </div>

          <div className="dashboard-panels">
            <div className="dashboard-panel full">
              <div className="panel-header">
                <h2>Top Performing Cards</h2>
                <button className="panel-action">View detailed report</button>
              </div>
              <div className="panel-body list">
                {insights.topCards.map((card, index) => (
                  <div key={index} className="card-row">
                    <div className="card-rank">#{index + 1}</div>
                    <div className="card-info">
                      <div className="card-name">{card.name}</div>
                      <div className="card-meta">{card.scans.toLocaleString()} taps • {card.conversionRate}% conversion</div>
                    </div>
                    <div className="card-progress">
                      <div className="card-progress-bar" style={{ width: `${Math.min(card.conversionRate, 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-panel full">
              <div className="panel-header">
                <h2>Recent Activity</h2>
                <button className="panel-action">See all</button>
              </div>
              <div className="panel-body list">
                {isLoading ? (
                  <div className="panel-loading">Loading activity...</div>
                ) : (
                  insights.recentActivity.map(activity => (
                    <div key={activity.id} className={`activity-item activity-${activity.type}`}>
                      <div className="activity-indicator" />
                      <div className="activity-content">
                        <div className="activity-description">{activity.description}</div>
                        <div className="activity-meta">{activity.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default Dashboard;


