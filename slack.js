const express = require('express');
const app = express();
const socket = require('socket.io');

let namespaces = require('./data/namespaces');


const expressServer = app.listen(3000, () => {
    console.log('Server has started on port 3000');
});

app.use(express.static(__dirname + '/public'));


const io = socket(expressServer);
io.on('connection', (socket) => {
    // console.log(socket.handshake);
    // build an array to send back with the img and endpoint for each ns
    let nsData = namespaces.map((ns) => {
        return {
            img: ns.img,
            endpoint: ns.endpoint
        }
    });
    // console.log(nsData)
    // Send the nsData back to client, we need to use socket not IO
    // because we want it to go to just this client
    socket.emit('nsList', nsData);
});

// Loop through each namespace and listen for a connection
namespaces.forEach((namespace) => {
    io.of(namespace.endpoint).on('connection', (nsSocket) => {
        const userName = nsSocket.handshake.query.userName;
        // console.log(`${nsSocket.id} has join ${namespace.endpoint}`);
        // a Socket has connected to one of the chat group namespaces
        // send that ns info back
        nsSocket.emit('nsRoomLoad', namespace.rooms);
        nsSocket.on('joinRoom', (roomToJoin, numberOfUsersCallback) => {
            // deal with history once we have it
            console.log(nsSocket.rooms);
            const roomToLeave = Object.keys(nsSocket.rooms)[1];
            nsSocket.leave(roomToLeave);
            updateUsersInRoom(namespace, roomToLeave);
            nsSocket.join(roomToJoin);
            // io.of('/wiki').in(roomToJoin).clients((error, clients) => {
            //     console.log(clients.length);
            //     numberOfUsersCallback(clients.length);
            // });
            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomToJoin
            });
            // console.log(nsRoom);
            nsSocket.emit('historyCatchup', nsRoom.history);
            updateUsersInRoom(namespace, roomToJoin)
        });
        nsSocket.on('newMessageToServer', (msg) => {
            const fullMsg = {
                text : msg.text,
                time : Date.now(),
                userName : userName,
                avatar : 'http://via.placeholder.com/30'
            };

            // Send this message to All the sockets that are in the room that THIS socket is in
            // How can we find what rooms THIS socket is in
            // console.log(nsSocket.rooms);
            // the user will be in the 2nd room of the object
            // this is because the socket ALWAYS join its own room on connection
            const roomTitle = Object.keys(nsSocket.rooms)[1];
            // we need to find the Room object for this room
            const nsRoom = namespace.rooms.find((room) => {
               return room.roomTitle === roomTitle
            });
            console.log(nsRoom);
            nsRoom.addMessage(fullMsg);
            io.of(namespace.endpoint).to(roomTitle).emit('messageToClients', fullMsg);
        })

    })
});

function updateUsersInRoom(namespace, roomToJoin) {
    // Send back the number of users in this room to all socket connected
    // to this room
    io.of(namespace.endpoint).in(roomToJoin).clients((error, clients) => {
        // console.log(clients.length);
        io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers', clients.length)
    })
}

