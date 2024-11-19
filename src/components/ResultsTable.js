import React from 'react';

const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date.toLocaleString();
};

const formatDuration = (duration) => {
  return duration.replace('PT', '').toLowerCase();
};

const ResultsTable = ({ results }) => {
  if (!results?.data || results.data.length === 0) {
    return <div className="no-results">No flights found</div>;
  }

  const { data, dictionaries } = results;

  const getAircraftName = (code) => {
    return dictionaries?.aircraft?.[`_${code}`] || code;
  };

  const getLocationInfo = (iataCode) => {
    const location = dictionaries?.locations?.[iataCode];
    return location ? `${iataCode} (${location.countryCode})` : iataCode;
  };

  return (
    <div className="results-table-container">
      <table className="results-table">
        <thead>
          <tr>
            <th>Flight Details</th>
            <th>Departure</th>
            <th>Arrival</th>
            <th>Duration</th>
            <th>Aircraft</th>
            <th>Stops</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {data.map((flight) => (
            <div className="flight-group" key={flight.id}>
              {flight.itineraries.map((itinerary, itinIndex) => (
                <tr key={`${flight.id}-${itinIndex}`} className={`${itinIndex === 0 ? 'outbound' : 'return'}-flight`}>
                  <td>
                    <div className="flight-type">
                      {flight.itineraries.length > 1 ? (itinIndex === 0 ? 'Outbound' : 'Return') : 'Flight'}
                    </div>
                    <div className="flight-number">
                      Flight {itinerary.segments[0].number}
                    </div>
                    <div className="seats-info">
                      {flight.numberOfBookableSeats} seats available
                    </div>
                  </td>
                  <td>
                    <div className="airport-code">
                      {getLocationInfo(itinerary.segments[0].departure.iataCode)}
                    </div>
                    <div className="datetime">
                      {formatDateTime(itinerary.segments[0].departure.at)}
                    </div>
                    {itinerary.segments[0].departure.terminal && (
                      <div className="terminal">Terminal {itinerary.segments[0].departure.terminal}</div>
                    )}
                  </td>
                  <td>
                    <div className="airport-code">
                      {getLocationInfo(itinerary.segments[itinerary.segments.length - 1].arrival.iataCode)}
                    </div>
                    <div className="datetime">
                      {formatDateTime(itinerary.segments[itinerary.segments.length - 1].arrival.at)}
                    </div>
                    {itinerary.segments[itinerary.segments.length - 1].arrival.terminal && (
                      <div className="terminal">
                        Terminal {itinerary.segments[itinerary.segments.length - 1].arrival.terminal}
                      </div>
                    )}
                  </td>
                  <td>{formatDuration(itinerary.duration)}</td>
                  <td>
                    {itinerary.segments.map((segment, idx) => (
                      <div key={idx} className="aircraft-info">
                        {getAircraftName(segment.aircraft.code)}
                      </div>
                    ))}
                  </td>
                  <td>
                    <div className="stops-info">
                      {itinerary.segments.length - 1 === 0 
                        ? 'Direct' 
                        : `${itinerary.segments.length - 1} stop${itinerary.segments.length - 1 > 1 ? 's' : ''}`
                      }
                    </div>
                    {itinerary.segments.length > 1 && (
                      <div className="stopover-airports">
                        via {itinerary.segments.slice(0, -1).map(seg => seg.arrival.iataCode).join(', ')}
                      </div>
                    )}
                  </td>
                  {itinIndex === 0 && (
                    <td className="price-cell" rowSpan={flight.itineraries.length}>
                      <div className="total-price">
                        {flight.price.grandTotal} {flight.price.currency}
                      </div>
                      <div className="base-price">
                        Base: {flight.price._base} {flight.price.currency}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </div>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable; 