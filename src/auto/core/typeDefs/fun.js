// loadtime: base(typeDef, F_noop)
// runtime:  

var F_false;

A.fun = typeDef(function(_) {
    _.to = function(v) { return _.is(v) ? v : _.constant(v); };
    _.is = F_is;
    
    _.constant = function(v) { return function() { return v; }; };
    _.negate   = function(f) { return function() { return !f.apply(this, arguments); }; };
    _.identity = F_ident;
    
    _['undefined'] = _.undef = _.noop = F_noop;

    _['true' ] = function( ) { return T; };
    F_false = 
    _['false'] = function( ) { return F; };
    _['null' ] = function( ) { return N; };
});

/*
A.fun.typed = function(types, f) {
    return function() {
        var args = A.destructuringTypeBind(types, arguments);
        return f.apply(this, args);
    };
};
*/
