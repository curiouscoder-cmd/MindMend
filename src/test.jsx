// Simple test component
import React from 'react';
import ReactDOM from 'react-dom/client';

const TestApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: 'green' }}>✅ React is Working!</h1>
      <p>If you see this, React is rendering correctly.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TestApp />);
