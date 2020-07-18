const users = [];
//add user, remove user,get user, getUserInRoom
const addUser = ({id,username,room})=>{
    //Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Validate the data
    if(!username || !room){
        return {
            error:"Username and room are required"
        }
    }
    //Check for existing username
    const existingUser = users.find((user)=>user.username === username && user.room === room)
    if(existingUser){
        return {
            error:"Username is already in use"
        }
    }
    const user = {id,username,room}
    users.push(user)
    return {
        user
    }
}
const removeUser = (id)=>{
   const index = users.findIndex((item)=>{
       return item.id === id
   })
   if(index!=-1){
       return users.splice(index,1)[0]
   }
}
const getUser = (id)=>{
    return users.find((user)=>user.id === id)
}
const getUsersInRoom = (roomName)=>{
    return users.filter((user)=>user.room === roomName)
}
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}