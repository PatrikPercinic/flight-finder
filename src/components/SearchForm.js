import React, { useState, useEffect, useRef } from 'react';
import config from '../config';

const SearchForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    departureAirport: '',
    destinationAirport: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    currency: 'EUR'
  });

  const [iataData, setIataData] = useState([]);
  const [suggestions, setSuggestions] = useState({
    departure: [],
    destination: []
  });
  const [loading, setLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    const fetchIataCodes = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.IATA_CODES}`);
        if (!response.ok) throw new Error('Failed to fetch IATA codes');
        const data = await response.json();
        setIataData(data.data);
      } catch (error) {
        console.error('Error fetching IATA codes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIataCodes();

    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setSuggestions({ departure: [], destination: [] });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuggestions({ departure: [], destination: [] });
    const searchData = { ...formData };
    if (!searchData.returnDate) {
      delete searchData.returnDate;
    }
    onSearch(searchData);
  };

  const filterAirports = (searchTerm) => {
    if (!searchTerm) return [];
    
    const searchTermLower = searchTerm.toLowerCase();
    return iataData
      .filter(airport => {
        const codeMatch = airport.code.toLowerCase().includes(searchTermLower);
        const nameMatch = airport.name.toLowerCase().includes(searchTermLower);
        const countryMatch = airport.countryCode.toLowerCase().includes(searchTermLower);
        return codeMatch || nameMatch || countryMatch;
      })
      .slice(0, 5);
  };

  const handleIataInput = (e, type) => {
    const { value } = e.target;
    const upperValue = value.toUpperCase();
    
    setFormData(prev => ({
      ...prev,
      [type]: upperValue
    }));

    const filtered = filterAirports(value);
    setSuggestions(prev => ({
      ...prev,
      [type === 'departureAirport' ? 'departure' : 'destination']: filtered
    }));
  };

  const handleSuggestionClick = (airport, type) => {
    setFormData(prev => ({
      ...prev,
      [type]: airport.code
    }));
    setSuggestions(prev => ({
      ...prev,
      [type === 'departureAirport' ? 'departure' : 'destination']: []
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleKeyDown = (e, type) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      setSuggestions(prev => ({
        ...prev,
        [type === 'departureAirport' ? 'departure' : 'destination']: []
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form" ref={formRef}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="departureAirport">Departure Airport (IATA)</label>
          <div className="autocomplete-wrapper">
            <input
              type="text"
              id="departureAirport"
              name="departureAirport"
              value={formData.departureAirport}
              onChange={(e) => handleIataInput(e, 'departureAirport')}
              onKeyDown={(e) => handleKeyDown(e, 'departureAirport')}
              required
              maxLength="3"
              placeholder="Enter city or airport code"
              autoComplete="off"
            />
            {suggestions.departure.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.departure.map((airport) => (
                  <li
                    key={airport.code}
                    onClick={() => handleSuggestionClick(airport, 'departureAirport')}
                  >
                    {airport.code} - {airport.name} ({airport.countryCode})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="destinationAirport">Destination Airport (IATA)</label>
          <div className="autocomplete-wrapper">
            <input
              type="text"
              id="destinationAirport"
              name="destinationAirport"
              value={formData.destinationAirport}
              onChange={(e) => handleIataInput(e, 'destinationAirport')}
              onKeyDown={(e) => handleKeyDown(e, 'destinationAirport')}
              required
              maxLength="3"
              placeholder="Enter city or airport code"
              autoComplete="off"
            />
            {suggestions.destination.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.destination.map((airport) => (
                  <li
                    key={airport.code}
                    onClick={() => handleSuggestionClick(airport, 'destinationAirport')}
                  >
                    {airport.code} - {airport.name} ({airport.countryCode})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="departureDate">Departure Date</label>
          <input
            type="date"
            id="departureDate"
            name="departureDate"
            value={formData.departureDate}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="form-group">
          <label htmlFor="returnDate">Return Date (Optional)</label>
          <input
            type="date"
            id="returnDate"
            name="returnDate"
            value={formData.returnDate}
            onChange={handleChange}
            min={formData.departureDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="passengers">Passengers</label>
          <input
            type="number"
            id="passengers"
            name="passengers"
            min="1"
            max="9"
            value={formData.passengers}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
      <button type="submit" className="search-button">
        {loading ? 'Loading Airports...' : 'Search Flights'}
      </button>
    </form>
  );
};

export default SearchForm; 