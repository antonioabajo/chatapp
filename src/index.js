const path = require('path')
const express = require('express')
const http = require('http')
const hbs = require('hbs')
const socketio = require('socket.io')
const Filter = require('bad-words')

const publicPath = path.join(__dirname,'../public')
const viewsPath = path.join(__dirname,'../templates')
const partialsPath = path.join(__dirname,'../templates/partials')


const app = express()
const server = http.createServer(app)
const io = socketio(server)
http.createServer(app)

const port = process.env.PORT || 3000

app.set('view engine','hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)
app.use(express.static(publicPath))

app.get('', (req, res) => {
    res.render('index',{
        title: 'Chat App',
        name: 'Antonio Abajo'
    })
})


let count = 0;

io.on('connection', (socket) => {
    console.log('New Websocket connection')
    
    socket.emit('countUpdated', count)

    socket.on('increment',(callback)=>{
        count++

        const filter = new Filter()

        if(filter.isProfane(count)){
            return callback('Profanity is not allowed!')
        }
        //socket.emit('countUpdated', count) //Send only to this socket
        //io.emit('countUpdated', count) //Send all sockes included the current one
        socket.broadcast.emit('countUpdated',count) //Send all sockets except the current one
        callback('Delivered')
    })

    socket.on('disconnect', ()=> {
        io.emit('countUpdated', 'User Disconnected');
    })
})

server.listen(port,()=>{
    console.log('Server is up and port is ' + port)
})