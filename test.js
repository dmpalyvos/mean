var assert = require('assert');
var express = require('express');
var wagner = require('wagner-core');
var superagent = require('superagent');

var URL_ROOT = 'http://localhost:3000';

describe('Category API', function() {

    var server;
    var Category;
    
    /* 
     * Initialize Server before tests
     */
    before(function() {
        var app = express();
        var models= require('./models')(wagner);
        var api = require('./api')(wagner);
       
        app.use(api);
        server = app.listen(3000);
        
        Category = models.Category; 
        
    });
    
    /*
     * Shutdown server after tests
     */
    after(function() {
        server.close();
    });
    
    
    /* 
     * Start each test with a clean database
     */
    beforeEach(function(done) {
        Category.remove({}, function(error) {
            assert.ifError(error);
            done();
        });
    });
    
    /*
     * Tests 
     */
    it('Can load a category by its id', function(done) {
        Category.create( {_id: 'Electronics' }, function(error, doc) {
            assert.ifError(error);
            var url = URL_ROOT + '/category/id/Electronics';
            var result;
            superagent.get(url, function(error, res) {
                assert.ifError(error);
                assert.doesNotThrow(function() {
                    result = JSON.parse(res.text);
                });
                assert.ok(result.category);
                assert.equal(result.category._id, 'Electronics');
            });
            done();
       });
       
    }); 
    
    it('Can load all categories that have a certain parent', function(done) {
        
       var categories = [
           { _id: 'Electronics' },
           { _id: 'Phones', parent: 'Electronics' },
           { _id: 'Laptops', parent: 'Electronics' },
           { _id: 'Bacon' }
       ];
       
       Category.create(categories, function(error,  docs) {
            var url = URL_ROOT + '/category/parent/Electronics';
            var result;
            
            superagent.get(url, function(error, res) {
                assert.ifError(error);
                assert.doesNotThrow(function() {
                    result = JSON.parse(res.text);
                });
                assert.equal(result.categories.length, 2);
                assert.equal(result.categories[0]._id, 'Laptops');
                assert.equal(result.categories[1]._id, 'Phones');
                done();
            })
       })
       
    });

});
