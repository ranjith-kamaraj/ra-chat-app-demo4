let users = [];

const addUser = ({id, username, room}) => {

    username = username && username.trim().toUpperCase();
    room = room &&  room.trim().toUpperCase()

    if(!username || !room){
        return {
            error: 'Username and room are required!'
        }
    }

    let existingUser = users.find((user) =>{
        return user.room === room && user.username === username
    })

    if(existingUser){
        return {
            error: 'Username in use'
        }
    }

    const user = { id, username, room };
    users.push(user);
    return { user };
}

const removerUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
  return users.find((user) => user.id === id);
}

const getUserInRoom = (room) =>{
    return users.filter(user => user.room === room);
}

module.exports = {
    addUser,
    removerUser,
    getUser,
    getUserInRoom
}