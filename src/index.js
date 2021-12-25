const path = require('path')
const http = require('http');
const express = require('express')
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express()
const server = http.createServer(app)
const io = socketio(server);

const { generateMessages, generateLocationMessages } = require('./utils/messages');
const { addUser, removerUser, getUser, getUserInRoom } = require("./utils/users");

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

//Server (emit) => client (receive) => countUpdated
//Client (emit) => Server (receive) => increment
//Socket.emit => To send to particular user
//Socket.braodcast.emit => Other than to particular user
//io.emit => To all user
//socket.join => Connecting to the room/group
//io.to.emit => To all user in particular room (needs to check)
//socket.braodcast.to.emit =>  To all user in particular room other than particualr user  (needs to check)

io.on('connection', (socket) => {
    console.log(`new websocket connection`)

    // socket.emit("message", generateMessages("Welcome!"));
    // socket.broadcast.emit("message", generateMessages("A new user joined"));

    socket.on('join', (options, callback) =>{
        let { error, user } = addUser({ id: socket.id, ...options});

        if(error){
            return callback(error);
        };

        socket.join(user.room);

        let name = user.username && user.username.toUpperCase();
        socket.emit("message", generateMessages('Admin', `Welcome ${name}!`));
        socket.broadcast.to(user.room).emit("message", generateMessages('Admin', `${name} joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        });
    })

    socket.on("sendMessage", (message, callback) => {
        let user = getUser(socket.id);
        let filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed');
        }
        io.to(user.room).emit("message", generateMessages(user.username, message));
        callback();
    });

    socket.on("sendLocation", (coords, callback) => {
        let user = getUser(socket.id);
        const { latitude, longitude } = coords;

        io.to(user.room).emit("locationMessage", generateLocationMessages(user.username, `https://google.com/maps?q=${latitude}&${longitude}`));
        callback();
    });

    socket.on("disconnect", () => {
        let user = removerUser(socket.id);

        if(user){
            io.to(user.room).emit("message", generateMessages(`${user.username} has left!`))
        }
    })

    // socket.emit("countUpdated", count);
    // socket.on("increment", () =>{
    //     // socket.emit("countUpdated", ++count);//To send to particular user
    //     // io.emit("countUpdated", ++count);//To send to all user

    //     io.emit("message", "Welcome!")
    // })

})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})