
// no arguments, null or undefined are converted to [null] or [undefined]
var AL = A.type.predicate(function(_) {
	return {
		to: function(v) { return _.is(v) ? v : [v]; },
    	is: function(v) { return v != N && v.length != N && typeof v !== 'string'; }
    };
});

// A.array is defined later, in array.js.
// Only then is «A.array.like = AL» set.