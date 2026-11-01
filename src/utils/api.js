/**
 * Centralized API configuration for EnerSense
 * In development: defaults to http://localhost:5000
 * In production: reads VITE_API_URL configured on Vercel / Netlify
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
