import React, { useState } from 'react';

export function TwoFactorSlide({ color = '#4ade80' }: { color?: string }) {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="flex items-center space-x-3">
      <button
        className="relative w-12 h-6 rounded-full transition-colors duration-200"
        style={{ backgroundColor: enabled ? color : '#d1d5db' }}
        onClick={() => setEnabled(e => !e)}
        type="button"
        aria-label="Activar/desactivar 2FA"
      >
        <span
          className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: enabled ? 'translateX(24px)' : 'none' }}
        />
      </button>
      <span className={`text-xs ml-2`} style={{ color: enabled ? color : '#d1d5db' }}>{enabled ? 'Activado' : 'Desactivado'}</span>
    </div>
  );
}
