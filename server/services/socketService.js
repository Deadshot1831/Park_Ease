// Socket.IO real-time service for live availability updates

let io = null;

const initSocket = (server, clientUrl) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: clientUrl || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
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

// Notify a specific user (booking status changes, etc.)
const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.emit(`user:${userId}:${event}`, data);
};

module.exports = { initSocket, emitAvailabilityUpdate, emitToUser };
