var ID = A.IDisposable = {dispose: F_noop};

A.disposable = A.typeDef(function(_) {
    _.is = function(v) { return v != N && A.fun.is(v.dispose); };
});

// A.IDisposable*
A.using = function(ds, f, x) {
    try { return f.call(x); } finally { A.enumerator(ds).call('dispose'); }
};
