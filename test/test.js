
// MODULES //

var // Expectation library:
	chai = require( 'chai' ),

	// Test utilities:
	utils = require('./utils'),

	// Module to be tested:
	flowFactory = require( './../lib' );


// VARIABLES //

var expect = chai.expect,
	assert = chai.assert;


// TESTS //

describe( 'flow-mhmean', function tests() {
	'use strict';

	it( 'should export a factory function', function test() {
		expect( flowFactory ).to.be.a( 'function' );
	});

// Test 2
    it('should provide a method to set/get the window size', function test() {
		var tStream = flowFactory();
		expect(tStream.window).to.be.a('function');
    });

    // Test 3
    it('should set the window size', function test() {
		var tStream = flowFactory();
		tStream.window(42);
		assert.strictEqual(tStream.window(),42);
    });

    // Test 4
    it('should not allow a non-numeric window size', function test() {
		var tStream = flowFactory();

		expect( badValue('5') ).to.throw(Error);
		expect( badValue([]) ).to.throw(Error);
		expect( badValue({}) ).to.throw(Error);
		expect( badValue(null) ).to.throw(Error);
		expect( badValue(undefined) ).to.throw(Error);
		expect( badValue(NaN) ).to.throw(Error);
		expect( badValue(false) ).to.throw(Error);
		expect( badValue(function(){}) ).to.throw(Error);

		function badValue(value) {
			return function() {
				tStream.window(value);
			};
		}
    }); //end non-numeric window

    // Test 5
    it('should calculate the harmonic mean of piped data in the window', function test(done) {
		var data, expected, tStream, WINDOW = 3;

		// Simulate some data
		data = [2,3,5,6,0,5,3,7,6,0,2,3,0,4,0,3];

		// Expected values of median in moving window
		expected = [2.90323,4.28571,0,0,0,4.43662,4.66667,0,0,0,0,0,0,0];

		// Create a new median stream
		tStream = flowFactory()
			.window(WINDOW)
			.stream();

		// Mock reading from the stream
		utils.readStream(tStream,onRead);

		// Mock piping to the stream
		utils.writeStream(data,tStream);

		return;

		/**
		 * FUNCTION: onRead(error, actual)
		 * Read event handler. Checks for errors. Compares streamed and expected data.
		 */
		function onRead(error,actual) {
			expect(error).to.not.exist;

			assert.lengthOf(actual,data.length-WINDOW+1);

			for ( var i = 0; i < expected.length; i++ ) {
				assert.closeTo( actual[i], expected[i], 0.0001 );
			}

			done();

		} // end FUNCTION onRead
    });

    // Test 6
    it('should handle a zero in the initial buffer', function test(done) {
		var data, expected, tStream, WINDOW = 4;

		// Simulate some data
		data = [1,0,3,4,6,7,8];

		// Expected values of median in moving window
		expected = [0,0,4.48000,5.84348];

		// Create a new median stream
		tStream = flowFactory()
			.window(WINDOW)
			.stream();

		// Mock reading from the stream
		utils.readStream(tStream,onRead);

		// Mock piping to the stream
		utils.writeStream(data,tStream);

		return;

		/**
		* FUNCTION: onRead(error, actual)
		* Read event handler. Check for errors. Compare streamed and expected data.
		*/
		function onRead(error,actual) {
			expect(error).to.not.exist;

			assert.lengthOf(actual,data.length-WINDOW+1);

			for ( var i = 0; i < expected.length; i++ ) {
				assert.closeTo( actual[i], expected[i], 0.0001 );
			}

			done();
		} // end FUNCTION onRead()
	});

});