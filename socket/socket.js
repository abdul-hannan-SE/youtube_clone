const socketio = require("socket.io");

class SocketManager {
  static io = null;
  static socket = null;
  static users = [];
  // Initialize socket.io (Static method)
  static init(httpServer) {
    console.log("Initiated socket connection");

    SocketManager.io = socketio(httpServer, {
      cors: {
        origin: true,
      },
    });

    SocketManager.io.on("connection", (socketIO) => {
      SocketManager.socket = socketIO;
      console.log("Client connected with socket id: ", socketIO.id);

      // Event for adding users
      socketIO.on("addUser", (userId) => {
        SocketManager.addUser(userId, socketIO.id);
        socketIO.emit("getUsers", SocketManager.users);
      });

      // Handle socket disconnection
      socketIO.on("disconnect", () => {
        console.log("User disconnected: ", socketIO.id);
        SocketManager.users = SocketManager.users.filter(
          (user) => user.socketId !== socketIO.id
        );
      });
    });

    return SocketManager.io;
  }

  // Add user to the list (Static method)
  static addUser(userId, socketId) {
    if (!SocketManager.users.some((user) => user.userId === userId)) {
      SocketManager.users.push({ userId, socketId });
    }
  }

  // Get user by userId (Static method)
  static getCurrentUser(userId) {
    return SocketManager.users.find((user) => user.userId === userId);
  }

  // Get io instance (Static method)
  static getIO() {
    if (!SocketManager.io) {
      throw new Error("Socket.io not initialized!");
    }
    return SocketManager.io;
  }

  // Get current socket instance (Static method)
  static getSocket() {
    if (!SocketManager.socket) {
      throw new Error("Socket.io not initialized!");
    }
    return SocketManager.socket;
  }
}

module.exports = SocketManager;
