var express = require('express');
var status = require('http-status');
var bodyparser = require('body-parser');
var _ = require('underscore');

module.exports = function(wagner) {

    var api = express.Router();
    api.use(bodyparser.json());

    //Helper Functions
    function handleOne(property, resp, error, result) {
        if (error) {
            return resp.
                status(status.INTERNAL_SERVER_ERROR).
                json( {error: error.toString() });
        }
        if (!result) {
            return resp.
                status(status.NOT_FOUND).
                json( { error: 'Not Found' } );
        }
        var json = {};
        json[property] = result;
        resp.json(json);
    }

    function handleMany(properties, resp, error, result) {
         if (error) {
            return resp.
                status(status.INTERNAL_SERVER_ERROR).
                json( { error: error.toString() } );
         }
         var json = {};
         json[properties] = result;
         resp.json(json);

    }

    /*
     * Retrieve category by id
     */
    api.get('/category/id/:id', wagner.invoke(function(Category) {
        return function(req, res) {
            Category.findOne( { _id: req.params.id },
                handleOne.bind(null, 'category', res) );
        };
    }));

    /*
     * Retrieve category by parent
     */
    api.get('/category/parent/:id', wagner.invoke(function(Category) {
        return function(req, res) {
            Category.find( { parent: req.params.id }).
                sort( { _id: 1 } ).
                exec(handleMany.bind(null, 'categories', res));
        };
    }));

    /*
     * Retrieve product by id
     */
    api.get('/product/id/:id', wagner.invoke(function(Product) {
        return function(req, res) {
            Product.findOne( { _id: req.params.id },
                handleOne.bind(null, 'product', res) );
        };
    }));

    /*
     * Retrieve product by category in which it belongs
     */
    api.get('/product/category/:id', wagner.invoke(function(Product) {
        return function(req, res) {
            //Default sort by name
            var sort = { 'name' : 1 };
            //Allow the user to specify sort by price
            if (req.query.price === '-1') {
                sort = { 'internal.approximatePriceUSD': 1 };
            }
            else if (req.query.price === '-1') {
                sort = { 'internal.approximatePriceUSD': -1 };
            }

            Product.find( { 'category.ancestors': req.params.id } ).
                sort(sort).
                exec(handleMany.bind(null, 'products', res));
        };
    }));

    /*
     * Update user cart
     */
    api.put('/me/cart', wagner.invoke(function(User) {
        return function(req, res) {
            try {
                var cart = req.body.data.cart;
            }
            catch (ex) {
                return res.
                    status(status.BAD_REQUEST).
                    json( { error: 'No cart specified' } );
            }
            req.user.data.cart = cart;
            req.user.save(function(error, user) {
                if (error) {
                    return res.
                        status(status.INTERNAL_SERVER_ERROR).
                        json( { error: error.toString() } );
                }
                return res.json( { user: user} );
            });
        };
    }));

    api.get('/me', function(req, res) {
        if (!req.user) {
            return res.
                status(status.UNAUTHORIZED).
                json( { error: 'Not logged in' } );
        }

        req.user.populate(
            { path: 'data.cart.product', model: 'Product' },
            handleOne.bind(null, 'user', res));

    });

    /*
     * Pay for products
     */
    api.post('/checkout', wagner.invoke(function(User) {
        return function(req, res) {
            if (!req.user) {
                return res.
                    status(status.UNAUTHORIZED).
                    json( {error: 'Not logged in' } );
            }

            req.user.populate(
                { path: 'data.cart.product', model: 'Product' },
                function(error, user) {
                    var totalCostUSD = 0;
                    _.each(user.data.cart, function(item) {
                        totalCostUSD += item.product.internal.approximatePriceUSD *
                        item.quantity;
                    });
            });
            //Stripe code would go here
            console.log('Payment complete');

            req.user.data.cart = [];
            req.user.save(function() {
                //Ignore errors
                return res.json({ id: 'CHARGE_ID_123' });
            });
        };
    }));

    return api;
};
