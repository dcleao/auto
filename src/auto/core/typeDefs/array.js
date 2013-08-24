// loadtime: base(A.type.predicate, A_lazyOwn)
// runtime:  base(Ap_slice)
A.array = A.type.predicate(function(_) {
	_.lazy = function(o, p, f, x) { return o[p] || (o[p] = (f ? f.call(x, p) : [])); };
    _.lazy.own = A_lazyOwn; // declared in base.js

    _.copy = function(al/*, start, end*/) {
        return Ap_slice.apply(al, Ap_slice.call(arguments, 1));
    };

    return {
    	is: function(v) { return v instanceof Array; },
    	to: function(v) { return v == N ? N : _.is(v) ? v : [v]; }
    };
});