
// Entry point for creating queries is A.query(.)
var toQble = A.query = A.type.predicate(function(_) {
    return {
    	to: function(v) {
	        return v == N      ? NQble : 
	               A.fun.is(v) ? A.create(IQble, {enumerate: v}) : // adhoc Qble
	               new EbleQ(v);
	    },
    
    	// Has an "enumerate" method
    	is: function(v) { return !!v && A.fun.is(v.enumerate); } // TODO
    };
});