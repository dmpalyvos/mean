var mongoose = require('mongoose');
var categorySchema = require('./category');

module.exports = function(wagner) {
    
    mongoose.connect('mongodb://localhost:27017/test');
    
    var Category =  mongoose.model('Category', categorySchema, 'categories');
    
    wagner.factory('Category', function() {
        return Category;
    });
    
    return {
        Category: Category
    };
    
};