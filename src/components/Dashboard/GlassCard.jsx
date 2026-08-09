import React from 'react';

/**
 * GlassCard Component
 * 
 * A reusable layout container used in the Dashboard's Bento-grid.
 * It dynamically applies CSS classes based on the requested color variant 
 * (black, white, magenta, etc.) and grid span (rows/cols).
 */
export default function GlassCard({ className = '', style = {}, children, colSpan = 4, rowSpan = 1, variant = 'glass' }) {
  // Determine grid spanning classes
  const colClass = `card-col-span-${colSpan}`;
  const rowClass = rowSpan > 1 ? `card-row-span-${rowSpan}` : '';
  
  // Determine base aesthetic class based on the requested variant prop
  let baseClass = 'wrapped-glass-card';
  if (variant === 'black') baseClass = 'wrapped-glass-card solid-black-card';
  if (variant === 'white') baseClass = 'wrapped-glass-card solid-white-card';
  if (variant === 'orange') baseClass = 'wrapped-glass-card solid-orange-card';
  if (variant === 'magenta') baseClass = 'wrapped-glass-card solid-magenta-card';
  if (variant === 'lime') baseClass = 'wrapped-glass-card solid-lime-card';
  
  return (
    <div className={`${baseClass} ${colClass} ${rowClass} ${className}`} style={style}>
      {children}
    </div>
  );
}
