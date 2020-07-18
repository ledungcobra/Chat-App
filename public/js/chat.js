const socket = io()

const $messageFormInput = document.querySelector('#input')
const $sendLocationButton = document.querySelector('#send-location')
const $messageForm = document.querySelector('#message-form')
const $messageFormButton = document.querySelector('#button')
const $messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const $locationUrl = document.querySelector('#location-url')
const $sideBar = document.querySelector('#activeUsers')
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML
const playSound = (filename)=>{
    var mp3Source = '<source src="' + filename + '.mp3" type="audio/mpeg">';
    var oggSource = '<source src="' + filename + '.ogg" type="audio/ogg">';
    var embedSource = '<embed hidden="true" autostart="true" loop="false" src="' + filename +'.mp3">';
    document.getElementById("sound").innerHTML='<audio autoplay="autoplay">' + mp3Source + oggSource + embedSource + '</audio>';
  }

  const autoScroll=()=>{
        const newMessage = $messages.lastElementChild
        const newMessageStyle = getComputedStyle(newMessage)
        const newMessageMargin = parseInt(newMessageStyle.marginBottom)
        const newMessageHeight = newMessage.offsetHeight + newMessageMargin
        console.log(newMessageHeight)
        const visibleHeight = $messages.offsetHeight
        const contentHeight = $messages.scrollHeight
        const scrollOffset = $messages.scrollTop + visibleHeight
        if(contentHeight-newMessageHeight<=scrollOffset){
            $messages.scrollTop = $messages.scrollHeight
        }
  }
//Options 
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix: true})

socket.on('message',({username,text,createdAt})=>{
   
    const html = Mustache.render(messageTemplate,{
        username,
        message:text,
        createdAt:moment(createdAt).format('hh:mm A')})
    $messages.insertAdjacentHTML('beforeend',html)
   // playSound('../sound/insight')
   autoScroll()
})



socket.on('locationMessage',({username,locationUrl,createdAt})=>{
    const html = Mustache.render(locationTemplate,{username,locationUrl,createdAt:moment(createdAt).format('hh:mm A')})
    $messages.insertAdjacentHTML('beforeend',html)   
   // playSound('../sound/insight')
   autoScroll()
})


$sendLocationButton.addEventListener('click',(event)=>{
    event.preventDefault()
    $sendLocationButton.setAttribute('disabled','disabled')
    if (!navigator.geolocation) {
        return alert('Your browser doesn\'t support geolocation')
    }
    navigator.geolocation.getCurrentPosition(({coords})=>{
        const {longitude,latitude} = coords
        socket.emit('sendLocation',{
            longitude,latitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
        })

            
    });
    
})
$messageForm.addEventListener('submit',(event)=>{
    event.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message = $messageFormInput.value
    socket.emit('sendMessage',message,(receivedMessage)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ""
        $messageFormInput.focus()
        console.log(receivedMessage)
    })

})

socket.emit('join',{
    username,room
},(error)=>{
    
    if(error){
        console.log('Call')
        alert(error)
        location.href = '/'
    }
})
socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sideBarTemplate,{room,users})
    $sideBar.innerHTML = html
})