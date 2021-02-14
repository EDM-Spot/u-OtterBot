const axios = require('axios');
const WebSocket = require('ws');
const Discord = require("discord.js");

const once = require("once");
const EventEmitter = require('events');

const API_URL = 'https://edmspot.ml/api';
const SOCKET_URL = 'wss://edmspot.ml';

const AUTH_LOGIN = 'auth/login';
const AUTH_SOCKET = 'auth/socket';

class Bot extends Discord.Client {
    constructor(options) {
        super(options);

        this.token;
        this.socket;

        this.users = [];

        this.socketEvents = new EventEmitter();
    }

    async getSocketAuth() {
        const body = await axios.get(`${API_URL}/${AUTH_SOCKET}`);
        console.log(body[0]);
        return body.data.socketToken
    }

    async connectSocket() {
        await axios.get(`${API_URL}/${AUTH_SOCKET}`)
            .then(async response => {
                console.log(response.data.data.socketToken);

                await new Promise((resolve, reject) => {
                    let sent = false

                    console.log('connecting socket', response.data.data.socketToken)

                    this.socket = new WebSocket(SOCKET_URL)

                    this.socket.on('open', () => {
                        sent = true
                        console.log('send', response.data.data.socketToken);
                        this.socket.send(response.data.data.socketToken);
                        resolve();
                    });

                    this.socket.on('message', this.onSocketMessage);

                    const reconnect = once(() => {
                        console.log('reconnecting in 1000ms')
                        setTimeout(() => {
                            this.connect()
                        }, 1000)
                    });

                    this.socket.on('error', (err) => {
                        console.log(err)
                        if (!sent) reject(err)
                        else reconnect()
                    });

                    this.socket.on('close', () => {
                        console.log('closed')
                        if (!shouldClose && sent) reconnect()
                    });
                });
            }).catch(error => console.log('Error', error));
    }

    socketHandlers = {

    }

    onSocketMessage = (message) => {
        if (message === '-') {
            return;
        }

        let command;
        let data;

        try {
            ({ command, data } = JSON.parse(message));
        } catch (e) {
            console.error(e.stack || e);
            return;
        }

        this.socketEvents.emit(command, data);

        if (command in this.socketHandlers) {
            this.socketHandlers[command].call(this, data);
        }
    }

    send(text) {
        this.socket.send(JSON.stringify({ command: 'sendChat', data: text }), (err) => console.log(err));
    }
}

const client = new Bot();

const init = async () => {
    await axios.post(`${API_URL}/${AUTH_LOGIN}`, {
        email: '',
        password: ''
    }).then(async response => {
        console.log();
        if (response.data && response.data.meta && response.data.meta.jwt) {
            client.token = response.data.meta.jwt;
            axios.defaults.headers.common['authorization'] = `JWT ${response.data.meta.jwt}`;

            await client.connectSocket();
        } else {
            throw new Error('Could not log in.')
        }
    }).catch(error => console.log('Error', error));
}

init();
