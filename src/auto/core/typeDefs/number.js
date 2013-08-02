
A.number = A.type.predicate(function(_) {
	_.to = function(d, dv) {
        var v = parseFloat(d);
        return isNaN(v) ? (dv || 0) : v;
    };
	_.is = function(v) { return typeof v === 'number'; };
});
