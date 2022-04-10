const assert = require('chai').assert
const sinon = require('sinon');
const fs = require('fs');
const db = require('../modules/database');

// Test database
describe('database', function() {
    before(function(done) {
        sinon.stub(console, 'log');
        fs.copyFileSync(__dirname + '/../data.json', __dirname + '/../data-backup.json');
        done();
    });

    after(function(done) {
        console.log.restore();
        done();
    });

    it('should exists on filesystem', function(done) {
        assert.isTrue(fs.existsSync(__dirname + '/../data.json'));
        done();
    });

    it('should be able to init', function(done) {
        db.init();
        done();
    });

    it('should be able to init new db', function(done) {
        db.db.delete('/');
        db.init();
        done();
    });

    it('should write to db', function(done) {
        db.db.push('/test/write', true);
        assert.isTrue(db.db.getData('/test/write'));
        done();
    });

    it('should delete from db', function(done) {
        db.db.delete('/test');
        assert.isFalse(db.db.exists('/test'));
        done();
    });
});
