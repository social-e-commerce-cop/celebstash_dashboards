import React from 'react';
import { Timer, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isHighlighted?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, isHighlighted }) => {
  return (
    <div className={`stat-card ${isHighlighted ? 'highlighted' : ''}`}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div className="stat-icon-wrap">
          <Timer size={16} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-growth">
        <span className="growth-badge">
          <ArrowUpRight size={12} />
          {change}
        </span>
        <span className="growth-sub">vs last week</span>
      </div>
    </div>
  );
};
