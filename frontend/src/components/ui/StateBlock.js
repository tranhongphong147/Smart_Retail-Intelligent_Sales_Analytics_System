import React from 'react';

export function LoadingBlock({ height = 220 }) {
  return (
    <div
      style={{
        height,
        borderRadius: 12,
        border: '1px solid #eef2f7',
        background: 'linear-gradient(90deg,#f8fafc,#f1f5f9,#f8fafc)',
        backgroundSize: '240% 100%',
        animation: 'pulseMove 1.4s ease infinite'
      }}
    />
  );
}

export function ErrorBlock({ message }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px solid #fecaca',
        background: '#fef2f2',
        color: '#b91c1c',
        fontSize: 13,
        padding: '12px 14px'
      }}
    >
      {message || 'Failed to load data.'}
    </div>
  );
}
