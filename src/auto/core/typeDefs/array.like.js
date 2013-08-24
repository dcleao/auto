
// no arguments, null or undefined are converted to [null] or [undefined]
var AL = A.array.like = A.type.predicate(function(_) {
	return {
		to: function(v) { return AL.is(v) ? v : [v]; },
    	is: function(v) { return v != N && v.length != N && typeof v !== 'string'; }
    };
});