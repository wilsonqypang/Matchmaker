const assert = require('chai').assert
const sinon = require('sinon');
const fs = require('fs');
const io = require('socket.io-client');
const socket = require('../modules/socket');
const db = require('../modules/database').db;
const Player = require('../models/player').Player;
const config = require('../config');

const socketURL = `http://localhost:${config.port}`;

const options = {
    transports: ['websocket'],
    'force new connection': true
};

let playerIndex = null;

// Test socket
describe('socket', function() {
    before(function(done) {
        sinon.stub(console, 'log');
        socket.init();
        done();
    });

    after(function(done) {
        socket.close();
        fs.copyFileSync(__dirname + '/../data-backup.json', __dirname + '/../data.json');
        fs.unlinkSync(__dirname + '/../data-backup.json');
        console.log.restore();
        done();
    });

    it('should connect to server', function(done) {
        let client = io.connect(socketURL, options);
        
        client.on('connect', function() {
            client.disconnect();
            done();
        });
    });

    it('should receive data', function(done) {
        let client = io.connect(socketURL, options);

        client.on('player_data', function(data) {
            assert.isNumber(data.index);
            assert.isObject(data.data);
            playerIndex = data.index;

            client.disconnect();
            done();
        });

        client.emit('player_data', {
            name: "test"
        });
    });

    it('should create new player', function(done) {
        index = Player.getPlayerIndex('test');
        db.delete(`/players[${index}]`);
        
        let client = io.connect(socketURL, options);

        client.on('player_data', function(data) {
            assert.isNumber(data.index);
            assert.isObject(data.data);
            playerIndex = data.index;

            client.disconnect();
            done();
        });

        client.emit('player_data', {
            name: "test"
        });
    });
});
