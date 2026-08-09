import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="toast-notification">
      <CheckCircle2 size={20} color="#10b981" />
      <span>{message}</span>
    </div>
  );
}
