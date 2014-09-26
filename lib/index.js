/**
*
*   STREAM: mhmean
*
*
*   DESCRIPTION:
*       - Transform stream factory which finds the harmonic mean of data values in a moving window.
*
*
*   NOTES:
*       [1] 
*
*
*   TODO:
*       [1] 
*
*
*   LICENSE:
*       MIT
*
*   Copyright (c) 2014. Rebekah Smith.
*
*
*   AUTHOR:
*       Rebekah Smith. rebekahjs17@gmail.com. 2014.
*
*/


(function() {
	'use strict';

	// MODULES //

	var through2 = require( 'through2' );


	// FUNCTIONS //

	/**
	* FUNCTION: getBuffer(W)
	*   Returns a buffer array pre-initialized to 0.
	* 
	* @private
	* @param {Number} W - buffer size
	* @returns {Array} buffer
	*/
	function getBuffer(W) {
		var buffer = new Array(W);
		for (var i = 0; i < W; i++) {
			buffer[i] = 0;
		}
		return buffer;
	} // end FUNCTION getBuffer()


    /**
    * FUNCTION: onData(W)
    *   Returns a callback which calculates a moving harmonic mean.
    *
    * @private
    * @param {Number} W - window size
    * @returns {Function} callback
    */
    function onData(W) {
        var buffer = getBuffer(W),
            full = false,
            dropVal,
            N = 0,
            buffDenom = 0,
            zeroPos = -1,
            hmean = 0;

        /**
        * FUNCTION: onData(newVal, encoding, clbk)
        *   Data event handler. Calculates the moving harmonic mean.
        *
        * @private
        * @param {Number} newVal - streamed data value
        * @param {String} encoding
        * @param {Function} clbk - callback to invoke. Function accepts two arguments: [ error, chunk ].
        */
        return function onData(newVal,  encoding, clbk) {
            // Fill buffer of size W and find initial harmonic mean:
            if (!full) {
                buffer[N] = newVal;

                if (newVal === 0) { 
                    zeroPos = N;
                    buffDenom = 0;
                }
                else {
                buffDenom += 1 / newVal;
                }

                N++;

                if (N===W) {
                    full = true;

                    if (zeroPos >= N-W) {
                        hmean = 0;
                    }

                    else {
                    hmean = W / buffDenom;
                    }

                    this.push(hmean);
                }
                clbk();
                return;
            }

            // Update buffer: (drop old value, add new)
            dropVal = buffer.shift();
            buffer.push(newVal);

            // If newVal is zero, reset counter and buffdenom
            if (newVal === 0) {
                zeroPos = N;
                buffDenom = 0;
            }
        
            if ( zeroPos > N-W ) {
                // zero still in buffer
                if (newVal !== 0) {
                buffDenom += 1 / newVal; // start accumulating denom again
                }

                hmean = 0;
            }   
            else if (zeroPos === N-W) { 
            //i.e. dropVal is the exiting zero
                buffDenom += 1 / newVal ;
                hmean = W / buffDenom; 

                } 
            else { 
                // no zero in buffer or leaving buffer
                buffDenom = buffDenom - (1 / dropVal) + (1 / newVal);
                hmean = W / buffDenom;
            }    

            N++
            clbk(null, hmean);
        }; // end FUNCTION onData()
    } // end FUNCTION onData()


	// STREAM //

	/**
	* FUNCTION: Stream()
	*	Stream constructor.
	*
	* @constructor
	* @returns {Stream} Stream instance
	*/
	function Stream() {
		this._window = 5; //default window size
		return this;
	} // end FUNCTION Stream()

    /**
    * METHOD: window(value)
    *   Window size setter/getter. If a value is provided, sets the window size. If no value is provided, returns the window size.
    *
    * @param {Number} value - window size
    * @returns {Stream|Number} stream instance or window size
    */
    Stream.prototype.window = function(value) {
        if (!arguments.length) {
            return this._window;
        }
        if(typeof value !== 'number' || value !== value) {
            throw new Error('window()::invalid input argument. Window must be numeric.');
        }
            this._window = value;
        return this;
    }; // end METHOD window()


	/**
	* METHOD: stream()
	*	Returns a through stream which finds the sliding window harmonic mean
	*
	* @returns {object} through stream
	*/
	Stream.prototype.stream = function() {
		return through2({'objectMode': true}, onData(this._window));
	}; // end METHOD stream()


	// EXPORTS //

	module.exports = function createStream() {
		return new Stream();
	};

})();