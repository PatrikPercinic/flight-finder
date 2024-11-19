import React, { useState } from 'react';
import SearchForm from './SearchForm';
import ResultsTable from './ResultsTable';
import './FlightSearch.css';

const FlightSearch = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchFlights = async (searchParams) => {
    setHasSearched(true);
    setLoading(true);
    setError(null);

    try {
      const queryParamsObj = {
        departureairport: searchParams.departureAirport,
        arrivalairport: searchParams.destinationAirport,
        departureDate: searchParams.departureDate,
        passengercount: searchParams.passengers,
        currency: searchParams.currency
      };

      if (searchParams.returnDate) {
        queryParamsObj.returnDate = searchParams.returnDate;
      }

      const queryParams = new URLSearchParams(queryParamsObj);

      const response = await fetch(
        `https://localhost:7094/api/Flights/search?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.status === 404) {
        setSearchResults({ data: [] });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch flight data');
      }

      setSearchResults(data);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('An error occurred while searching for flights. Please try again.');
      } else {
        setSearchResults({ data: [] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flight-search ${hasSearched ? 'results-view' : ''}`}>
      <SearchForm onSearch={searchFlights} />
      {loading && <div className="loading">Searching for flights...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && hasSearched && <ResultsTable results={searchResults} />}
    </div>
  );
};

export default FlightSearch; 