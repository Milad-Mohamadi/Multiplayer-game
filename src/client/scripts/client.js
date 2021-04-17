import io from 'socket.io-client';
import { logType } from './utils';

export default class Client {
    constructor(username, id) {
        this.username = username;
    }

    connect() {
        this.socket = io({ query: 'username=' + this.username });
        this.subscribeSocket();
    }

    subscribeSocket() {
        this.socket.on('clientDisconnect', data => this.onClientDisconnect(data));
        this.socket.on('clientJoin', data => this.onClientJoin(data));
        this.socket.on('serverMessage', data => this.onServerMessage(data));
        this.socket.on('gameDuration', data => this.getDuration(data));
        this.socket.on('getState', data => this.getState(data));
        this.socket.on('getTurn', data => this.getTurn(data));
    }

    onDrawing(socket) {
        var mouse = {
            click: false,
            move: false,
            pos: { x: 0, y: 0 },
            pos_prev: false
        };
        var canvas = document.getElementById('draw');
        var context = canvas.getContext('2d');
        var width = window.innerWidth;
        var height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        canvas.onmousedown = function(e) { mouse.click = true; };
        canvas.onmouseup = function(e) { mouse.click = false; };

        canvas.onmousemove = function(e) {
            mouse.pos.x = e.clientX / width;
            mouse.pos.y = e.clientY / height;
            mouse.move = true;
        };

        socket.on('draw_line', function(data) {
            var line = data.line;
            draw(line)
        });

        function mainLoop() {
            if (mouse.click && mouse.move && mouse.pos_prev) {
                let line = [mouse.pos, mouse.pos_prev]
                socket.emit('draw_line', { line: line });
                draw(line)
                mouse.move = false;
            }
            mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
            setTimeout(mainLoop, 25);
        }

        function draw(line) {
            context.lineWidth = 10
            context.lineCap = "round"
            context.beginPath();
            context.moveTo(line[0].x * width, line[0].y * height);
            context.lineTo(line[1].x * width, line[1].y * height);
            context.stroke();
        }
        mainLoop();
    }

    nextTurn() {
        this.socket.emit('nextTurn', {});
    }

    sendMessage(message) {
        const data = { username: this.username, message, date: new Date(), type: logType.message };
        this.socket.emit('clientMessage', data);
        this.onClientMessage(data);
    }

    onConnect() {}
    onClientDisconnect() {}
    onClientJoin() {}
    onClientMessage() {}
    onServerMessage() {}
    getDuration() {}
    getState() {}
    getTurn() {}
}