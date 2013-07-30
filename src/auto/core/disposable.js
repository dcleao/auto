var ID = A.IDisposable = {dispose: F_noop};

var isID = function(v) { return v != N && A.fun.is(v.dispose); };

A.disposable = {
    is: isID,
    as: typeDef_makeAs(isID)
};

// A.IDisposable*
A.using = function(ds, f, x) {
    try { return f.call(x); } finally { A.enumerator(ds).call('dispose'); }
};
