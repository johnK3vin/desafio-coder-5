const socket = io()
const form = document.getElementById('idForm')

form.addEventListener('submit', (e)=>{
    e.preventDefault()

    const datForm = new FormData(e.target)
    const prod = Object.fromEntries(datForm)

    socket.emit('nuevoProd', prod)
    e.target.reset()
})