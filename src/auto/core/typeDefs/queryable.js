
// Entry point for creating queries is A.query(.)
var toQble = A.query = A.type.predicate(function(_) {
    _.to = function(v) {
        return v == N      ? NQble : 
               A.fun.is(v) ? A.create(IQble, {enumerate: v}) : // adhoc Qble
               new EbleQ(v);
    };
    
    // Has an "enumerate" method
    _.is = function(v) { return !!v && A.fun.is(v.enumerate); }; // TODO
});