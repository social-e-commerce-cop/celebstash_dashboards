import React from 'react';
import { Calendar, Download } from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip,
  BarChart, Bar
} from 'recharts';

export const DashboardPage: React.FC = () => {
  // Donut chart data
  const donutData = [
    { name: 'Music', value: 6500, color: '#7126D0' },
    { name: 'Products', value: 4500, color: '#A78BFA' },
    { name: 'Tickets', value: 2872, color: '#10B981' },
  ];

  // User growth line chart data
  const userGrowthData = [
    { month: 'Jan', Artists: 150, Users: 420 },
    { month: 'Feb', Artists: 210, Users: 450 },
    { month: 'Mar', Artists: 190, Users: 440 },
    { month: 'Apr', Artists: 240, Users: 480 },
    { month: 'May', Artists: 220, Users: 490 },
    { month: 'Jun', Artists: 280, Users: 520 },
    { month: 'Jul', Artists: 250, Users: 540 },
    { month: 'Aug', Artists: 310, Users: 560 },
    { month: 'Sep', Artists: 290, Users: 530 },
    { month: 'Oct', Artists: 350, Users: 550 },
    { month: 'Nov', Artists: 380, Users: 580 },
    { month: 'Dec', Artists: 420, Users: 620 },
  ];

  // Revenue bar chart data
  const revenueData = [
    { month: 'Jan', revenue: 45 },
    { month: 'Feb', revenue: 70 },
    { month: 'Mar', revenue: 52 },
    { month: 'Apr', revenue: 105 },
    { month: 'May', revenue: 135 },
    { month: 'Jun', revenue: 128 },
    { month: 'Jul', revenue: 185 },
  ];

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

      {/* Metric Cards Row */}
      <div className="stats-grid">
        <StatCard title="Total Users" value="12,480" change="+12.3%" />
        <StatCard title="Total Products" value="12,480" change="+12.3%" />
        <StatCard title="Total Artists" value="12,480" change="+12.3%" />
        <StatCard title="Total Earnings" value="12,480" change="+12.3%" isHighlighted />
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-two-col">
        {/* Donut Chart: Total Users Overtime */}
        <div className="card-box">
          <h3 className="card-title">Total Users Overtime</h3>
          <p className="card-sub">Track how the growing users overtime</p>

          <div className="donut-wrapper">
            <div className="donut-center">
              <span className="donut-sub-text">Total items</span>
              <span className="donut-count">13872</span>
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
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-legend">
            {donutData.map((item) => (
              <div key={item.name} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                <span className="legend-label">{item.name}</span>
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
            +$185.2K
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
