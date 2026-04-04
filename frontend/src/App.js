import React, { useEffect, useState } from 'react';

function App() {
  const [health, setHealth] = useState('checking...');

  useEffect(() => {
    fetch('http://localhost:8081/health')
      .then((res) => res.json())
      .then((data) => setHealth(`${data.status} (${data.service})`))
      .catch(() => setHealth('backend unreachable'));
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>Smart Retail - Intelligent Sales Analytics System</h1>
      <p>Frontend container is running.</p>
      <p>Backend health: <strong>{health}</strong></p>
    </main>
  );
}

export default App;
