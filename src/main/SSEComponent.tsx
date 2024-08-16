import React, { useState, useEffect } from 'react';

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    console.log("켜짐");
    const eventSource = new EventSource('https://mk-blogservice.site/api/event');

    console.log('EventSource initialized:', eventSource);

    eventSource.onmessage = function(event) {
      try {
        console.log('Event received:', event);
        const newEvent = JSON.parse(event.data);
        setEvents(prevEvents => [...prevEvents, newEvent]);
      } catch (err) {
        console.error('Error parsing event data:', err);
      }
    };

    eventSource.onerror = function(err) {
      console.error("EventSource failed:", err);
      eventSource.close();
    };

    return () => {
      console.log('Closing EventSource');
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h1>Server-Sent Events</h1>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            {event.timestamp}: {event.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;