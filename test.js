var assert = require('assert');

describe('Feature 1', function() {

	it('1 does not equal 2', function(done){
		assert.notEqual(1, 2, 'One does not equal 2');
		done();
	});

	it('1+1 equals 2', function(done) {
		assert.equal(1+1, 2);
		done();
	});

});
