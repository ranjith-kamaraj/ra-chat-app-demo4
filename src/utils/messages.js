const generateMessages = (username, text) =>{
    return{
        username,
        text,
        createdAt: new Date()
    }
};

const generateLocationMessages = (username, url) =>{
    return {
        username,
        locationUrl: url,
        createdAt: new Date()
    }
};

module.exports = {
    generateMessages,
    generateLocationMessages
}