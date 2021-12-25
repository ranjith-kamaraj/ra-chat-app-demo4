let socket = io();

//Elements
let $messageForm = document.querySelector("#message-form");
let $messageFormInput = $messageForm.querySelector("input");
let $messageFormButton = $messageForm.querySelector("button");
let $sendLocationButton = document.querySelector("#send-location");
let $messages = document.querySelector("#messages");

//Templates
let messageTemplate = document.querySelector("#message-template").innerHTML;
let locationTemplate = document.querySelector("#location-template").innerHTML;
let sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
let { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

let autoScroll = () => {
    //New msg element
    const $newMessage = $messages.lastElementChild;

    //Height of new msg
    const newMsgStyles = getComputedStyle($newMessage);
    const newMsgMargin = parseInt(newMsgStyles.marginBottom);
    const newMsgHeight = $newMessage.offsetHeight +  newMsgMargin;

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of Msg container
    const containerHeight = $messages.scrollHeight;

    //How Far I have scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMsgHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message', (message) => {
    console.log(`${message}`);

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('locationMessage', (url) => {
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.locationUrl,
        createdAt: moment(url.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');

    // let message = document.querySelector("input").value;
    let message = e.target.elements.message.value;

    socket.emit("sendMessage", message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = "";
        $messageFormInput.focus();

        if (error) {
            console.log(error)
        }
        else {
            console.log('Message delivered!')
        }
    });
});

$sendLocationButton.addEventListener('click', (e) => {

    if (!navigator.geolocation) {
        return alert(`Geolocation not supported in the current browser!`)
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;

        socket.emit("sendLocation", {
            latitude,
            longitude
        }, () => {
            console.log('Location shared!')
        })
    })

    $sendLocationButton.removeAttribute('disabled')

})

socket.on('roomData', ({ room, users }) => {

    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector("#sidebar").innerHTML = html;
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});


// socket.on('countUpdated', (count) => {
//     console.log(`Count passed: ${count}`)
// });

// document.querySelector('#increment').addEventListener('click', () =>{
//     socket.emit("increment");
// })