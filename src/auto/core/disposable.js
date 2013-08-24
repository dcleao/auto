
var ID = A.IDisposable = {
	// Default implementation does nothing.
	dispose: F_noop
};

A.disposable = A.type.predicate(function(_) {
    return {
    	is: function(v) { return v != N && A.fun.is(v.dispose); }
    };
});

// A.IDisposable*
A.using = function(ds, f, x) {
    try { return f.call(x); } finally { A.enumerator(ds).call('dispose'); }
};
