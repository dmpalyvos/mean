var express = require('express');
var status = require('http-status');

module.exports = function(wagner) {
    
    var api = express.Router();
    
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
      
    
    return api;
};