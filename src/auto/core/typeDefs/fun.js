// loadtime: base(F_noop)
// runtime:  

var F_false;

A.fun = A.type.predicate(function(_) {
    _.constant = function(v) { return function() { return v; }; };
    _.negate   = function(f) { return function() { return !f.apply(this, arguments); }; };
    _.identity = F_ident;
    
    _['undefined'] = _.undef = _.noop = F_noop;

    _['true' ] = function( ) { return T; };
    F_false = 
    _['false'] = function( ) { return F; };
    _['null' ] = function( ) { return N; };

    return {
        to: function(v) { return _.is(v) ? v : _.constant(v); },
        is:  F_is
    };
});

/*
A.fun.typed = function(types, f) {
    return function() {
        var args = A.destructuringTypeBind(types, arguments);
        return f.apply(this, args);
    };
};
*/
