import React, { useState, useEffect } from 'react';
import {getNotification}  from '../services/getService';
import { EventSourcePolyfill, NativeEventSource } from "event-source-polyfill";
function SSEComponent() {

  const [events, setEvents] = useState([]);
  const [notificationData, setNotificationData] = useState();

  const getNotifications = async (notificationId:string) =>{
    try{
      const fetchedNotification = await getNotification(notificationId);
      if(fetchedNotification.result ===true){
        setNotificationData(fetchedNotification.data);
      }

    }catch{

    }
  }
  useEffect(() => {
    console.log("켜짐");
    const EventSource = EventSourcePolyfill || NativeEventSource;
    /**
     * 유저의 모든 알림 정보 조회
     */
    const eventSource = new EventSource('https://mk-blogservice.site/api/notifications/stream',{ 
      headers: {
        Authorization: sessionStorage.getItem('accessToken')
      },
      withCredentials: true,
    
    });

    console.log('EventSource initialized:', eventSource);

    eventSource.onmessage = function(event) {
      try {
        console.log('Event received:', event);
        
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
      
    </div>
  );
}

export default SSEComponent;
