import React from 'react';
import GlassCard from './GlassCard';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, subvalue, colSpan = 4, rowSpan = 1, gradient = 'green', trend = 'up', variant = 'glass' }) {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  
  return (
    <GlassCard colSpan={colSpan} rowSpan={rowSpan} variant={variant}>
      <h3 className="wrapped-card-label">{label}</h3>
      <div className="wrapped-card-value text-gradient-purple">{value}</div>
      {subvalue && (
        <div className={`wrapped-card-subvalue text-gradient-${gradient}`}>
          <TrendIcon size={18} />
          <span>{subvalue}</span>
        </div>
      )}
    </GlassCard>
  );
}
