
// "is" and "as" functions should be passed.
var typeDef = function(fun) {
    // Main function simply dispatches to the 'to' function
    var _ = function() { return _.to.apply(_, arguments); };
    fun(_);
    if(!_.as && _.is) { _.as = typeDef_makeAs(_.is); }
    return _;
};

var typeDef_makeAs = function(is) {
    return function(v) { return is(v) ? v : N; };
};