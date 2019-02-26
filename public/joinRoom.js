function joinRoom(roomName) {
     // Send this room name to the server so that server can join
    nsSocket.emit("joinRoom", roomName, (newNumberOfMembers) => {
        // we want to update the room member total now that we have join
        document.querySelector(".curr-room-num-users").innerHTML = `${newNumberOfMembers} <span class="glyphicon glyphicon-user"></span>`
    });
    nsSocket.on('historyCatchup', (history) => {
       const messagesUl = document.querySelector('#messages')
        messagesUl.innerHTML = "";
        history.forEach((msg) => {
            const newMessage = buildHTML(msg);
            const currentMessages = messagesUl.innerHTML;
            messagesUl.innerHTML += currentMessages + newMessage
        });
        messagesUl.scrollTo(0, messagesUl.scrollHeight);

    });

    nsSocket.on('updateMembers', (numMembers) => {
        document.querySelector(".curr-room-num-users").innerHTML = `${numMembers} <span class="glyphicon glyphicon-user"></span>`
        document.querySelector(".curr-room-text").innerText = `${roomName}`
    });
}