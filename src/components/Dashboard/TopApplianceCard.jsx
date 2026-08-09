import React from 'react';
import GlassCard from './GlassCard';
import { Zap } from 'lucide-react';

export default function TopApplianceCard({ colSpan = 8, rowSpan = 1, variant = 'glass' }) {
  return (
    <GlassCard colSpan={colSpan} rowSpan={rowSpan} variant={variant}>
      <div style={{ display: 'flex', justifyContent: 'space-between', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="wrapped-card-label">Your Top Power Hungry Appliance</h3>
          <div className="wrapped-card-value text-gradient-orange">AC Unit</div>
          <div className="wrapped-card-subvalue text-gradient-orange" style={{ marginTop: '16px' }}>
            450 kWh consumed this month
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
          <Zap size={120} color="#f97316" strokeWidth={1} />
        </div>
      </div>
    </GlassCard>
  );
}
