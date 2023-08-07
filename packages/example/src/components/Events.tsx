import { WebLoginEvents, useWebLoginEvent } from 'aelf-web-login';
import { useState } from 'react';

export default function Events() {
  const [events, setEvents] = useState([]);
  for (const key in WebLoginEvents) {
    useWebLoginEvent(WebLoginEvents[key], (data: any) => {
      console.log(WebLoginEvents[key], data);
      events.push({
        type: key,
        data,
      });
      setEvents([...events]);
    });
  }
  return (
    <>
      <div>
        <div className="result">
          {events.map((item, index) => {
            return <div key={`${item.type}-${index}`}>{`${item.type} ${JSON.stringify(item.data)}`}</div>;
          })}
        </div>
      </div>
    </>
  );
}
