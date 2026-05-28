import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface WSClient {
  ws: WebSocket;
  assignmentId?: string;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WSClient> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientId = Math.random().toString(36).slice(2);
      this.clients.set(clientId, { ws });

      console.log(`WS client connected: ${clientId}`);

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'subscribe' && msg.assignmentId) {
            const client = this.clients.get(clientId);
            if (client) {
              client.assignmentId = msg.assignmentId;
              console.log(`Client ${clientId} subscribed to assignment ${msg.assignmentId}`);
            }
          }
        } catch (e) {
          console.error('WS message parse error:', e);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`WS client disconnected: ${clientId}`);
      });

      ws.on('error', (err) => {
        console.error(`WS error for client ${clientId}:`, err);
        this.clients.delete(clientId);
      });

      ws.send(JSON.stringify({ type: 'connected', clientId }));
    });

    console.log('WebSocket server initialized');
  }

  sendToAssignment(assignmentId: string, data: object) {
    const message = JSON.stringify(data);
    let sent = 0;

    this.clients.forEach((client) => {
      if (
        client.assignmentId === assignmentId &&
        client.ws.readyState === WebSocket.OPEN
      ) {
        client.ws.send(message);
        sent++;
      }
    });

    console.log(`Sent WS message to ${sent} clients for assignment ${assignmentId}`);
  }

  broadcast(data: object) {
    const message = JSON.stringify(data);
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }
}

export const wsManager = new WebSocketManager();
