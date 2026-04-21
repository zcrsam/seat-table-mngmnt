import React from 'react';

const HeroSection = ({ loaded, onNavigateToVenues, onManageBooking }) => {
  return (
    <div style={{
      position: 'relative',
      height: '70vh',
      minHeight: 500,
      backgroundImage: `url('/src/assets/banner-grandroom.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '40px',
        borderRadius: '8px',
        maxWidth: '600px'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '20px',
          fontFamily: 'Playfair Display, serif'
        }}>
          Bellevue Hotel
        </h1>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '30px',
          opacity: 0.9
        }}>
          Experience luxury and elegance in the heart of the city
        </p>
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onNavigateToVenues}
            style={{
              padding: '15px 30px',
              fontSize: '1rem',
              backgroundColor: '#8C6B2A',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            >
            View Venues
          </button>
          <button
            onClick={onManageBooking}
            style={{
              padding: '15px 30px',
              fontSize: '1rem',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Manage Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
