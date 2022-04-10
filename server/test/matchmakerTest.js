const assert = require('chai').assert
const sinon = require('sinon');
const io = require('socket.io-client');
const socket = require('../modules/socket');
const matchmaker = require('../modules/matchmaker');
const Player = require('../models/player').Player;
const config = require('../config');

const socketURL = `http://localhost:${config.port}`;

const options = {
    transports: ['websocket'],
    'force new connection': true
};

let playerIndex = null;

// Test matchmaker
describe('matchmaker', function() {
    before(function(done) {
        sinon.stub(console, 'log');
        socket.init();
        done();
    });

    after(function(done) {
        socket.close();
        console.log.restore();
        done();
    });

    it('should contain our player', function(done) {
        const client = io.connect(socketURL, options);

        client.on('player_data', function(data) {
            playerIndex = data.index;

            client.emit('player_ready', {index: playerIndex}, function() {
                const players = Player.getReadyPlayers();
                assert.isArray(players);
                assert.isAbove(players.length, 0)

                client.disconnect();
                done();
            });
        });

        client.emit('player_data', {
            name: "test",
        });
    });

    it('should create a match', function(done) {
        const client1 = io.connect(socketURL, options);
        const client2 = io.connect(socketURL, options);

        client1.on('player_data', function(data) {
            playerIndex = data.index;

            client1.emit('player_ready', {index: playerIndex});
        });

        client1.on('match_ready', function(data) {
            client1.emit('end_game', {index: data.index});
        });

        client1.on('end_game', function() {
            client1.disconnect();
        });

        client1.emit('player_data', {
            name: "test1",
        });

        client2.on('player_data', function(data) {
            playerIndex = data.index;

            client2.emit('player_ready', {index: playerIndex}, function() {
                const players = Player.getReadyPlayers();
                matchmaker.setPlayerAmount(2);
                const groups = matchmaker.createGroups(players);
                matchmaker.createMatches(groups);
                assert.isArray(players);
                assert.isArray(groups);
            });
        });

        client2.on('match_ready', function(data) {
            client2.emit('end_game', {index: data.index});
        });

        client2.on('end_game', function() {
            client2.disconnect();
            done();
        });

        client2.emit('player_data', {
            name: "test2",
        });
    });

    it('should be able to init', function(done) {
        matchmaker.init();
        setTimeout(function() {
            matchmaker.stop();
            done();
        }, 1500);
    });
});
