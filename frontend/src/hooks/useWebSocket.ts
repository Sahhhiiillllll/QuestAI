'use client';
import { useEffect, useRef } from 'react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { WSMessage } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws';

export function useWebSocket(assignmentId?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const { handleWSMessage, setWsConnected } = useAssignmentStore();
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setWsConnected(true);
          if (assignmentId) {
            ws.send(JSON.stringify({ type: 'subscribe', assignmentId }));
          }
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const msg: WSMessage = JSON.parse(event.data);
            handleWSMessage(msg);
          } catch (e) {
            console.error('WS parse error:', e);
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setWsConnected(false);
          // Reconnect after 3s
          reconnectTimeout.current = setTimeout(connect, 3000);
        };

        ws.onerror = (err) => {
          console.error('WS error:', err);
          ws.close();
        };
      } catch (e) {
        console.error('WS connect error:', e);
        reconnectTimeout.current = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [assignmentId, handleWSMessage, setWsConnected]);

  return wsRef.current;
}
