var mongoose = require('mongoose');
var Category = require('./category');
var fx = require('./fx');

//Schema for products
var productSchema = {
    name: {
        type: String,
        required: true
    },
    pictures: [{
        type: String,
        match: /^http:\/\//i
    }],
    price: {
        amount: {
            type: Number,
            required: true,
            set: function(newAmt) {
                this.internal.approximatePriceUSD = newAmt / (fx()[this.price.currency] || 1);
                return newAmt;
            }
        },
        currency: {
            type: String,
            enum: ['USD', 'EUR', 'GBP'],
            required: true,
            set: function(newCurrency) {
                this.internal.approximatePriceUSD = 
                    this.internal.approximatePriceUSD / (fx()[newCurrency] || 1);
                    return newCurrency;
            }
        }
    },
    category: Category.categorySchema,
    internal: {
        approximatePriceUSD: Number
    }
};

var schema = new mongoose.Schema(productSchema);

/*
 * Combine currency symbol and price amount into
 * human readable format. For example 25 USD 
 * returns "$25"
 */

var currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£'   
};

schema.virtual('displayPrice').get(function() {
    return currencySymbols[this.price.currency] + '' + this.price.amount;
});

// Exports
module.exports = schema;
module.exports.productSchema = productSchema;
