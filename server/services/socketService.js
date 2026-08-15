// Socket.IO real-time service for live availability updates
const jwt = require('jsonwebtoken');

let io = null;

const initSocket = (server, clientUrl) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: clientUrl || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  // Identify the connection so per-user events can be routed to that user only.
  // A missing or stale token is fine — the socket stays anonymous and still
  // receives public availability updates.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        socket.userId = jwt.verify(token, process.env.JWT_SECRET).id;
      } catch {
        // Anonymous connection
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    // Private room for this user's booking events
    if (socket.userId) socket.join(`user:${socket.userId}`);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔌 Socket connected: ${socket.id}`);
    }

    // Clients join a room per parking spot to receive targeted updates
    socket.on('spot:subscribe', (spotId) => {
      socket.join(`spot:${spotId}`);
    });

    socket.on('spot:unsubscribe', (spotId) => {
      socket.leave(`spot:${spotId}`);
    });

    socket.on('disconnect', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      }
    });
  });

  return io;
};

// Broadcast an availability change to everyone + the spot's subscribers
const emitAvailabilityUpdate = (spotId, availableSpots, totalSpots) => {
  if (!io) return;
  const payload = { spotId: String(spotId), availableSpots, totalSpots };
  io.emit('availability:update', payload);
  io.to(`spot:${spotId}`).emit('spot:availability', payload);
};

// Notify a specific user (booking status changes, etc.). Delivered only to that
// user's own room — never broadcast, or every connected client sees it.
const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

module.exports = { initSocket, emitAvailabilityUpdate, emitToUser };
