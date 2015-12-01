var assert = require('assert');
var express = require('express');
var wagner = require('wagner-core');
var superagent = require('superagent');

var URL_ROOT = 'http://localhost:3000';

describe('API', function() {

    var server;
    var Category;
    var Product;
    
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
        Product = models.Product;
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
        Product.remove({}, function(error) {
            assert.ifError(error);
            done();
        });
    });
    
    /*
     * Category Tests
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
       });
       done();
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
            });
       });
       done();
    });


    /* 
     * Product Tests
     */
    it('Can load a product by its id', function(done) {
        //Create product
        var PRODUCT_ID = '000000000000000000000001';
        var prod = {
            name: 'LG G2 Mini',
            _id: PRODUCT_ID,
            price: {
                amount: 150,
                currency: 'EUR'
            }
        };
        Product.create(prod, function(error, doc) {
            assert.ifError(error);
            var url = URL_ROOT + '/product/id/' + PRODUCT_ID;
            var result;
            superagent.get(url, function(error, res) {
                assert.ifError(error);
                assert.doesNotThrow(function() {
                    result = JSON.parse(res.text);
                });
                assert.ok(result.product);
                assert.equal(result.product._id, PRODUCT_ID);
            });
       });
       done();
    });
    
    it('Can load a product by in a category with sub-categories', function(done) {
        //Create products/categories
        var categories = [
            { _id: 'Electornics' },
            { _id: 'Phones', parent: 'Electronics' },
            { _id: 'Laptops', parent: 'Electronics' },
            { _id: 'Bacon' }
        ];
        var products = [
            {
                name: 'LG G2 Mini',
                category: { _id: 'Phones', ancestors: ['Electronics', 'Phones'] },
                price: {
                    amount: 300,
                    currency: 'USD'
                }
            },
            {
                name: 'Asus Zenbook Prime',
                category: { _id: 'Laptops', ancestors: ['Electronics', 'Laptops'] },
                price: {
                    amount: 1500,
                    currency: 'EUR'
                }
            },
            {
                name: 'Pig 3000',
                category: { _id: 'Bacon', ancestors: ['Bacon'] },
                price: {
                    amount: 150,
                    currency: 'GBP'
                }
            }
        ];

        //Create the categories
        Category.create(categories, function(error, categories) {
            assert.ifError(error);
            //Create the products
            Product.create(products, function(error, products) {
                assert.ifError(error);
                var url = URL_ROOT + '/product/category/Electronics';
                superagent.get(url, function(error, res) {
                    assert.ifError(error);
                    var result;
                    assert.doesNotThrow(function() {
                        result = JSON.parse(res.text);
                    });
                    assert.equal(result.products.length, 2);
                    assert.equal(result.products[0].name, 'Asus Zenbook Prime');
                    assert.equal(result.products[1].name, 'LG G2 Mini');
                });
            }); 
        });
       done();
    });
    
});