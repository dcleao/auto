// loadtime: base(A.scope, A.each.own)
// runtime:  base(A.is), string(A.format, A.string.join)

// A.error(e)
// A.error(m, scope)
A.error = A.type.predicate(function(_) {
    _.types = {};
    _.oper = _.types.oper = {
        invalid: function(m, scope) {
            return _.to(A.string.join(Z, "Operation is invalid.", m), scope);
        },
        
        notImplemented: function(m, scope) { 
            return _.to(A.string.join(Z, "Operation is not implemented.", m), scope); 
        }
    };
    
    _.arg = _.types.arg = {
        required: function(name, m, scope) {
            var m1 = A.format("Argument '{0}' is required.", [name]);
            return _.to(A.string.join(Z, m1, m), scope);
        },

        invalid: function(name, m, scope) {
            var m1 = A.format("Argument '{0}' is invalid.", [name]);
            return _.to(A.string.join(Z, m1, m), scope);
        },
        
        type: function(name, type, m, scope) {
            var m1 = A.format("Argument '{0}' is not of type '{1}'.", [name, type]);
            return _.to(A.string.join(Z, m1, m), scope);
        }
    };

    return {
        to: function(m, scope) { return _.as(m) || new Error(A.format(m, scope));  },
        is: function(v) { return A.is(v, Error); }
    };
});


// A.fail(e)
// A.fail(m, scope)
A.fail = function(m, scope) { throw A.error(m, scope); };

// A.assert(m, scope)
A.assert = function(m, scope) { throw A.error(A.string.join(Z, "Assertion failed.", m), scope); };

// Create direct `fail` versions of error constructor functions
A.scope(function() {
    var createFail = function(errorMaker) { 
    	return function() { throw errorMaker.apply(U, arguments); }; 
    };
    
    A.each.own(A.error.types, function(categ, categName) {
    	// It would be nice to have some kind of object copy/map utility here. 
    	// Something like: 
    	//  A.fail[categName] = A.map(categ, createFail);

        // Create fail version for error type
        var fcateg = A.fail[categName] = {};
        A.each.own(categ, function(errorMaker, name) { fcateg[name] = createFail(errorMaker); });
    });

    delete A.error.types;
});