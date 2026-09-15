import React, { useState, useEffect } from 'react';
import { Calendar, Download } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip,
  BarChart, Bar
} from 'recharts';
import { fetchWithAuth } from '../services/apiClient';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = () => {
    setLoading(true);
    setError(null);
    fetchWithAuth('/admin/dashboard/metrics')
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard metrics', err);
        setError('Server is taking longer to respond (Render cold start). You can retry or view cached metrics.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="page-container flex-center" style={{ minHeight: 350, flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTopColor: '#7126D0', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Connecting to CelebStash backend & loading analytics...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Daily operations, marketplace analytics and creative metrics.</p>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            border: '1px solid #FCD34D',
          }}
        >
          <span>⚠️ {error || 'Dashboard metrics are unavailable.'}</span>
          <button
            onClick={loadMetrics}
            style={{
              background: '#D97706',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 12px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '12px',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const data = metrics;

  const donutData = Array.isArray(data.entityCounts) && data.entityCounts.length > 0
    ? data.entityCounts.map((item: any) => ({
        name: item.name,
        value: Number(item.value || item.count || 0),
        color: item.color || '#7126D0'
      }))
    : [
        { name: 'Users', value: Number(data.totalUsers || 0), color: '#7126D0' },
        { name: 'Artists', value: Number(data.totalArtists || 0), color: '#A78BFA' },
        { name: 'Products', value: Number(data.totalProducts || 0), color: '#10B981' }
      ];

  const userGrowthData = Array.isArray(data.userGrowth) && data.userGrowth.length > 0
    ? data.userGrowth.map((g: any) => ({
        month: g.month,
        Artists: g.artists !== undefined ? g.artists : (g.Artists || 0),
        Users: g.users !== undefined ? g.users : (g.Users || 0)
      }))
    : [];

  const revenueData = Array.isArray(data.revenueData) && data.revenueData.length > 0
    ? data.revenueData
    : [];

  const totalDonutItems = donutData.reduce((acc: number, curr: any) => acc + curr.value, 0);

  return (
    <div className="dashboard-container">
      {/* Top Title & Actions */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Daily operations, marketplace analytics and creative metrics.</p>
        </div>
        <div className="header-button-group">
          <div className="date-badge">
            <Calendar size={16} />
            <span>Sun, 17 Aug 2026</span>
          </div>
          <button className="btn-primary">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            border: '1px solid #FCD34D',
          }}
        >
          <span>⚠️ {error}</span>
          <button
            onClick={loadMetrics}
            style={{
              background: '#D97706',
              color: '#FFF',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 12px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '12px',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="stats-grid">
        <StatCard title="Total Users" value={data.totalUsers.toLocaleString()} />
        <StatCard title="Total Products" value={data.totalProducts.toLocaleString()} />
        <StatCard title="Total Artists" value={data.totalArtists.toLocaleString()} />
        <StatCard title="Total Earnings" value={`$${Number(data.totalEarnings || 0).toLocaleString()}`} isHighlighted />
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-two-col">
        {/* Donut Chart: Total Users Overtime */}
        <div className="card-box">
          <h3 className="card-title">User Distribution</h3>
          <p className="card-sub">Platform composition by roles and content</p>

          <div className="donut-wrapper">
            <div className="donut-center">
              <span className="donut-sub-text">Total Entities</span>
              <span className="donut-count">{totalDonutItems.toLocaleString()}</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="donut-legend">
            {donutData.map((item: any, index: number) => (
              <div className="legend-item" key={index}>
                <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                <div className="legend-text">
                  <span className="legend-name">{item.name}</span>
                  <span className="legend-val">{item.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Line Chart: Active Users Over Time */}
        <div className="card-box">
          <div className="chart-header-row">
            <div>
              <h3 className="card-title">Total Users Overtime</h3>
              <p className="card-sub">Track how the growing users overtime</p>
            </div>
            <div className="chart-legend-top">
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#0284C7' }}></span>
                <span>Artists</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#7126D0' }}></span>
                <span>Users</span>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 250, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip />
                <Line type="monotone" dataKey="Artists" stroke="#0284C7" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Users" stroke="#7126D0" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue Streams Bar Chart */}
      <div className="card-box full-width">
        <div className="chart-header-row">
          <div>
            <h3 className="card-title">Revenue Streams</h3>
            <p className="card-sub">Monthly sales totals from digital & physical products</p>
          </div>
            <div className="revenue-highlight">
              Historical monthly series is not stored; showing current totals only.
            </div>
        </div>

        <div style={{ width: '100%', height: 220, marginTop: 24 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} barCategoryGap="25%">
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <Bar dataKey="revenue" fill="#7126D0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
