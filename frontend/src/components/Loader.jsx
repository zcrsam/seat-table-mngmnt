import React from 'react';

const Loader = ({ onDone }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onDone) onDone();
    }, 1500); // Auto-dismiss after 1.5 seconds
    
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      background: '#F7F4EE',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid #8C6B2A',
        borderTop: '3px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
