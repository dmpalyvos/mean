var assert = require('assert');
var express = require('express');
var wagner = require('wagner-core');
var superagent = require('superagent');

var URL_ROOT = 'http://localhost:3000';

describe('API', function() {

    var server;
    var Category;
    var Product;
    var User;

    var PRODUCT_ID = '0000000000000001';

    /*
     * Initialize Server before tests
     */
    before(function() {
        var app = express();
        var models = require('./models')(wagner);
        var api = require('./api')(wagner);


        Category = models.Category;
        Product = models.Product;
        User = models.User;

        app.use(function(req, res, next) {
            User.findOne({}, function(error, user) {
                assert.ifError(error);
                req.user(user);
                next();
            });
        });
        app.use(api);
        server = app.listen(3000);
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
        });

        Product.remove({}, function(error) {
            assert.ifError(error);
        });

        //Set Categories
        var categories = [{
            _id: 'Electornics'
        }, {
            _id: 'Phones',
            parent: 'Electronics'
        }, {
            _id: 'Laptops',
            parent: 'Electronics'
        }, {
            _id: 'Bacon'
        }];

        //Set Products
        var products = [{
            _id: PRODUCT_ID,
            name: 'LG G2 Mini',
            category: {
                _id: 'Phones',
                ancestors: ['Electronics', 'Phones']
            },
            price: {
                amount: 300,
                currency: 'USD'
            }
        }, {
            name: 'Asus Zenbook Prime',
            category: {
                _id: 'Laptops',
                ancestors: ['Electronics', 'Laptops']
            },
            price: {
                amount: 1500,
                currency: 'EUR'
            }
        }, {
            name: 'Pig 3000',
            category: {
                _id: 'Bacon',
                ancestors: ['Bacon']
            },
            price: {
                amount: 150,
                currency: 'GBP'
            }
        }];

        var users = [
            {
                profile: {
                    username: 'jim145',
                    picture: 'https://d37djvu3ytnwxt.cloudfront.net/static/images/edx-theme/edx-logo-77x36.4a732c424bb8.png'
                },
                data: {
                    oauth: 'invalid',
                    cart: []
                }
            }
        ];
        //Create the categories
        Category.create(categories, function(error, categories) {
            assert.ifError(error);
            //Create the products
            Product.create(products, function(error, products) {
                assert.ifError(error);
                User.create(users, function(error, users) {
                    assert.ifError(error);
                });
            });
        });
        done();

    });

    /*
     * Category Tests
     */
    it('Can load a category by its id', function(done) {
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

    it('Can load all categories that have a certain parent', function(done) {

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
        done();
    });


    /*
     * Product Tests
     */
    it('Can load a product by its id', function(done) {

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
        done();
    });

    it('Can load a product by in a category with sub-categories', function(done) {

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
        done();
    });

    /*
     * User/Cart Tests
     */
    it('Can save user cart', function(done) {
        var url = URL_ROOT + '/me/cart';
        superagent.
            put(url).
            send({
                data: {
                    cart: [ {product: PRODUCT_ID, quantity: 1} ]
                }
            }).
            end(function(error, res) {
                assert.ifError(error);
                assert.equal(res.status, status.OK);
                User.findOne({}, function(error, user) {
                    assert.ifError(error);
                    assert.equal(user.data.cart.length, 1);
                    assert.equal(usert.data.cart[0].product, PRODUCT_ID);
                    assert.equal(user.data.cart[0].quantity, 1);
                });
            });
            done();
    });

    it('Can load user cart', function(done) {
        var url = URL_ROOT + '/me';
        User.findOne({}, function(error, user) {
            assert.ifError(error);
            user.data.cart = [ { product: PRODUCT_ID, quantity: 1} ];
            user.save(function(error) {
                assert.ifError(error);
                superagent.
                    get(url, function(error, res) {
                        assert.ifError(error);

                        assert.equal(res.status, status.OK);
                        var result;
                        assert.doesNotThrow(function() {
                            result = JSON.parse(res.text).user;
                        });
                        assert.equal(result.data.cart.length, 1);
                        assert.equal(usert.data.cart[0].product, PRODUCT_ID);
                        assert.equal(user.data.cart[0].quantity, 1);
                    });
            });
        });
        done();
    });


});
