var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function(wagner) {
    var categorySchema = require('./category');
    var productSchema = require('./product');
    
    mongoose.connect('mongodb://localhost:27017/test');
    
    var Category =  mongoose.model('Category', categorySchema, 'categories');
    var Product = mongoose.model('Product', productSchema, 'products');
    
    var models = {
        Category: Category,
        Product: Product
    };
    
    _.each(models, function(value, key) {
        wagner.factory(key, function() {
            return value;
        });
    });
    
    return models;
    
};