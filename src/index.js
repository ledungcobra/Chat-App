const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "../public");
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
app.use(express.static(publicPath));
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

io.on("connection", (socket) => {
  socket.emit("message", generateMessage('Admin',"Welcome you to the new world"));
  socket.broadcast.emit("newUserConnect", "One user connect");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      ...options,
    });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.to(user.room).emit("message", generateMessage('Admin',"Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage('Admin',`${user.username} has joined`));

    callback();
    io.to(user.room).emit('roomData',{
      room:user.room,
      users:getUsersInRoom(user.room)
    })
  });
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id)
    const filter = new Filter({ placeHolder: "@" });
    const cleanedMessage = filter.clean(message);
    io.to(user.room).emit("message", generateMessage(user.username,cleanedMessage));
    callback();
  });

  socket.on("sendLocation", ({ latitude, longitude }, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username,
        `https://www.google.com/maps/@${latitude},${longitude},20z`
      )
    );
    callback();
  });
  //A user is disconnected
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", generateMessage('Admin',"One user has left"));
      io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
      })
    }
  });
});

server.listen(port, () => {
  console.log("Chat app listen on port " + port);
});
