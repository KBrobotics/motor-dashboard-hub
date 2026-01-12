import { useEffect, useRef, useCallback, useState } from 'react';
import { SignalUpdate } from '@/types/signals';

interface UseWebSocketOptions {
  url: string;
  onSignalUpdate: (update: SignalUpdate) => void;
  reconnectInterval?: number;
}

interface WebSocketState {
  isConnected: boolean;
  lastConnected: Date | null;
  reconnectAttempts: number;
}

export function useWebSocket({ url, onSignalUpdate, reconnectInterval = 5000 }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    lastConnected: null,
    reconnectAttempts: 0,
  });

  const connect = useCallback(() => {
    // Don't connect if already connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log(`[WebSocket] Connecting to ${url}...`);
    
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        setState({
          isConnected: true,
          lastConnected: new Date(),
          reconnectAttempts: 0,
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WebSocket] Received:', data);
          
          // Handle signal update message
          if (data.signalId && data.value !== undefined) {
            onSignalUpdate({
              signalId: data.signalId,
              value: data.value,
              timestamp: data.timestamp,
            });
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`[WebSocket] Disconnected (code: ${event.code})`);
        setState((prev) => ({
          ...prev,
          isConnected: false,
        }));
        
        // Schedule reconnect
        scheduleReconnect();
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      scheduleReconnect();
    }
  }, [url, onSignalUpdate]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setState((prev) => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1,
    }));

    console.log(`[WebSocket] Reconnecting in ${reconnectInterval}ms...`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, reconnectInterval);
  }, [connect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected: state.isConnected,
    lastConnected: state.lastConnected,
    reconnectAttempts: state.reconnectAttempts,
    reconnect: connect,
  };
}
