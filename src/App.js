import React from 'react';
import './App.css';
import FlightSearch from './components/FlightSearch';

function App() {
  return (
    <div className="App">
      <video
        className="video-background"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/planeTakingOff.mp4" type="video/mp4" />
      </video>
      <div className="overlay"></div>
      <header className="App-header">
        <h1>Flight Search</h1>
      </header>
      <main>
        <FlightSearch />
      </main>
    </div>
  );
}

export default App;
