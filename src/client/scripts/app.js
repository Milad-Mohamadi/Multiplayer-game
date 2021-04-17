import Client from './client';
import Handlebars from 'handlebars';
import { formatTime } from './utils';
import { messageTemplate } from './templates';

const prefixType = {
    joined: 'joined',
    left: 'left'
}
export default class App {
    constructor() {
        this.startupSection = $('#startupSection');
        this.startUpForm = $('#startupForm');
        this.usernameInput = $('#usernameInput');
        this.messageBoxSection = $('#messageBoxSection');
        this.messageList = $('#messageList');
        this.usersList = $('#usersList');
        this.headerTitle = $('#headerTitle');
        this.message = $('#message');
        this.pointsBox = $('#pointsBox');
        this.pointslist = $('#pointslist');
        this.counter = $('#counter');
        this.messageForm = $('#messageForm');
        this.canvas = $('#draw');
        this.messageInput = $('#messageInput');
        this.client = null;
    }

    init() {
        this.startUpForm.bind('submit', event => {
            event.preventDefault();
            this.startupSection.fadeOut(500, () => {
                this.messageBoxSection.fadeIn();
                this.client = new Client(this.usernameInput.val());
                this.headerTitle.text(this.client.username);
                this.messageInput.focus();
                this.handleSocketEvents();
            });
        });

        this.messageForm.bind('submit', event => {
            event.preventDefault();
            const value = this.messageInput.val();
            this.messageInput.val('');
            this.sendMessage(value);
        });

        this.pointsBox.bind('submit', event => {
            event.preventDefault();
            this.pointsBox.fadeOut(500, () => {
                this.client.nextTurn()
            });
        });
    }

    handleSocketEvents() {
        this.client.onConnect = data => {
            this.log({
                ...data,
                prefix: 'Connected to the application',
            });
        };

        this.client.onClientJoin = data => {
            this.updateUsersList(data);
            this.log({
                ...data,
                prefix: 'joined',
            });
        };

        this.client.getDuration = data => {
            if (data.duration < 0) data.duration = 0
            this.counter.text(`time: ${data.duration}`);
            if (data.duration === 0) {
                this.message.text('finished');
                this.pointslist.empty();
                this.pointsBox.fadeIn();
                data.clientsInfo.forEach(client => {
                    let userPoint = `<div  class="d-flex justify-content-between"><strong>${client.username}</strong> <strong>${client.point}</strong></div>`
                    this.pointslist.append(userPoint);
                })
            }
        };

        this.client.getTurn = data => {
            if (this.client.username === data.user.username) {
                this.message.text(`your word: ${data.subject}`);
            }
            this.client.onDrawing(this.client.socket);
        };

        this.client.getState = data => {
            if (data.state === 0) {
                this.message.text('waiting for one person...');
            }
            if (data.state === 1) {
                this.message.text('guess the word');
            }
        };

        this.client.onServerMessage = this.client.onClientMessage = data => {
            this.log({
                ...data,
                me: this.client.username === data.username,
            });
        };

        this.client.onClientDisconnect = data => {
            this.updateUsersList(data);
            this.log({
                ...data,
                prefix: 'left',
            });
        };
        this.client.connect();
    }

    sendMessage(message) {
        this.client.sendMessage(message);
    }

    log(data) {
        const model = {
            ...data,
            date: formatTime(data.date),
            content: data.message,
            username: data.username,
        };
        const template = Handlebars.compile(messageTemplate)(model);
        this.messageList.append(template);
        this.messageList.scrollTop(this.messageList.height());
    }

    updateUsersList(data) {
        $('#usersList').empty();
        data.clientsInfo.forEach((client, index) => {
            if (!client.username) return
            let user = `<div id="${client.id}" class="text-right align-middle"><strong>${client.username}-${index+1}</strong></div>`
            this.usersList.append(user);
        });

    }
}