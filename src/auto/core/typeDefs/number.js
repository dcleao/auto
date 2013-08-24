
A.number = A.type.predicate(function(_) {
	return {
		to: function(d, dv) {
	        var v = parseFloat(d);
	        return isNaN(v) ? (dv || 0) : v;
	    },
		is: function(v) { return typeof v === 'number'; }
	};
});
