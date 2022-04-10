const assert = require('chai').assert
const elo = require('../modules/elo');
const Player = require('../models/player').Player;

// Test ELO
describe('elo', function(){
    it('should calculate expected properly', function(done) {
        assert.approximately(elo.getExpected(1200, 1400), 0.24025, 0.1);
        done();
    });

    it('expect 50/50 chance for equal ranks', function(done) {
        assert.equal(elo.getExpected(1000, 1000), 0.5);
        done();
    });

    it('should be almost 100% chance for 0 rank', function(done) {
        assert.approximately(elo.getExpected(1000, 0), 0.99, 0.01);
        done();
    });

    it('should update rating properly', function(done) {
        elo.setKValue(32);
        let expectedA = elo.getExpected(1200, 1400);
        let expectedB = elo.getExpected(1400, 1200);
        assert.equal(Math.round(elo.getRatingChange(expectedA, 1, 1200)), 24);
        assert.equal(Math.round(elo.getRatingChange(expectedB, 0, 1400)), -24);
        done();
    });

    it('should update rating properly', function(done) {
        elo.setKValue(32);
        let expectedA = elo.getExpected(1802, 1186);
        let expectedB = elo.getExpected(1186, 1802);
        assert.equal(Math.round(elo.getRatingChange(expectedA, 1, 1802)), 1);
        assert.equal(Math.round(elo.getRatingChange(expectedB, 0, 1186)), -1);
        done();
    });

    it('should get average rating properly', function(done) {
        let team = [new Player(), new Player(), new Player()];
        assert.equal(elo.getTeamRating(team), 1500);
        done();
    });
});