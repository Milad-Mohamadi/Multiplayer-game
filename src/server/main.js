const express = require('express');
const compression = require('compression');
const { upperFirst } = require('lodash');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 8080;
let clientsInfo = [];
const clients = {};
let clientsId = [];
let remainClient = []
let isStarted = false;
let gameDuration = 60;
let turnOfUser = 0;
var line_history = [];

app.use(compression({}));
app.use(express.static(__dirname));
app.get('/', (req, res) => res.sendFile(__dirname, 'index.html'));

server.listen(port, () => console.log(`[INFO] Listening on http://localhost:${port}`.magenta));

const words = ['ball', 'lamp', 'chair', 'man'];
let subject = words[getRandomInteger(0, words.length)];
console.log(`subject: ${subject}`);

io.on('connection', (socket) => {
    const client = {
        id: socket.id,
        username: socket.handshake.query.username,
        color: getRandomColor(),
        point: 0,
    };

    for (var i in line_history) {
        socket.broadcast.emit('draw_line', { line: line_history[i] });
    }
    clients[socket.id] = client;
    clientsInfo.push(client);
    remainClient.push(client);
    clientsId.push(socket.id);

    console.log(`[INFO] Client '${client.username}' connected!`.blue);
    if (clientsInfo.length > 1) {
        console.log('start')
        io.sockets.emit('getState', { state: 1 });
        chooseSubject(subject);
        chooseTurn(clientsInfo)
    } else {
        io.sockets.emit('getState', { state: 0 });
    }
    io.sockets.emit('clientJoin', { username: client.username, date: new Date(), type: 'info', id: client.id, clientsInfo: clientsInfo });

    socket.on('disconnect', () => {
        delete clients[socket.id];
        if (!clientsInfo) return
        clientsInfo = clientsInfo.filter(client => {
            return client.id !== socket.id;
        });
        clientsId.splice(clientsId.indexOf(socket.id), 1);
        console.log(`[INFO] Client '${client.username}' disconnected!`.yellow);
        socket.broadcast.emit('clientDisconnect', {
            username: client.username,
            date: new Date(),
            type: 'info',
            id: client.id,
            clientsInfo: clientsInfo
        });
    });

    socket.on('draw_line', function(data) {
        line_history.push(data.line);
        socket.broadcast.emit('draw_line', { line: data.line });
    });

    socket.on('clientMessage', (data) => {
        if (isStarted && data.message === subject) {
            console.log(`${data.username} gussed the word`)
            clientsInfo.forEach(client => {
                if (client.username === data.username) {
                    client.point++;
                }
                console.log(client.point);
            })
        } else {
            console.log(`${data.username}: ${data.message}`)
        }
        const now = new Date();
        console.log(`[MESSAGE] [${formatTime(now)}] ${data.username}: ${data.message}`.blue);
        socket.broadcast.emit('serverMessage', {
            username: data.username,
            message: data.message,
            date: now,
            type: 'message',
        });
    });

    socket.on('nextTurn', (data) => {
        if (clientsInfo.length > 1) {
            console.log('nex turn')
            io.sockets.emit('getState', { state: 1 });
            chooseSubject(subject);
            chooseTurn(clientsInfo)
        } else {
            io.sockets.emit('getState', { state: 0 });
        }
    });
});

function chooseSubject(subject) {
    gameDuration = 60;
    console.log(`${clients[clientsId[0]].username} subject: ${subject}`);
    isStarted = true;
    let countdown = setInterval(function() {
        gameDuration--;
        io.sockets.emit('gameDuration', { duration: gameDuration, clientsInfo });
        if (gameDuration <= 0) {
            isStarted = false;
            clearInterval(countdown);
        }
    }, 1000);
}

function chooseTurn(clientsInfo) {
    if (turnOfUser === clientsInfo.length) {
        turnOfUser = 0;
    }
    turn = clientsInfo[turnOfUser];
    io.sockets.emit('getTurn', { user: turn, subject: subject });
    turnOfUser++;
}

function formatTime(input) {
    const date = new Date(input);
    const hours = date.getHours();
    const period = hours >= 12 ? 'PM' : 'AM';
    const newHours = hours > 12 ? hours - 12 : hours;
    return `${newHours}:${('0' + date.getMinutes()).slice(-2)} ${period}`;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}