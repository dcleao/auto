// loadtime: 
// runtime:  A.fun.is
A.string = A.type.predicate(function(_) {
	// nully or empty
    var SE = _.empty = {
    	is: function(v) { return v == N || v === E; }
    };

    /**
	 * Formats a string by replacing 
	 * place-holder markers, of the form "{foo}",
	 * with the value of corresponding properties
	 * of the specified scope argument.
	 * 
	 * @param {string} mask the string to format.
	 * @param {object|function} [scope] the scope object or function.
	 * @param {object} [x] the context object for a scope function.
	 * 
	 * @example
	 * <pre>
	 * A.format("The name '{0}' is undefined.", ['foo']);
	 * // == "The name 'foo' is undefined."
	 * 
	 * A.format("The name '{foo}' is undefined, and so is '{what}'.", {foo: 'bar'});
	 * // == "The name 'bar' is undefined, and so is ''."
	 * 
	 * A.format("The name '{{foo}}' is undefined.", {foo: 'bar'});
	 * // == "The name '{{foo}}' is undefined."
	 * </pre>
	 * 
	 * @returns {string} The formatted string.
	 */
	A.format = 
	_.format = function(mask, scope, x) {
	    if(SE.is(mask)) { return E; }
	    
	    var isScopeFun = A.fun.is(scope);
	    
	    return mask.replace(/(^|[^{])\{([^{}]+)\}/g, function($0, before, prop) {
	        var value = !scope     ? N :
	                    isScopeFun ? scope.call(x, prop) :
	                    scope[prop];

	        return before + _(value);
	    });
	};

	// A.string.join
	_.join = function(sep) {
		var S = String;
	    var a = arguments;
	    var L = a.length;
	    var v, v2;
	    
	    sep = _.to(sep);
	    
	    if(L < 4) {
	        if(L === 3) {
	            v  = a[1];
	            v2 = a[2];
	            return SE.is(v ) ? _.to(v2) :
	                   SE.is(v2) ? _.to(v ) :
	                   (S(v) + sep + S(v2));
	        }
	        
	        return L === 2 ? _.to(a[1]) : E;
	    }
	    
	    // general case
	    
	    var args = [];
	    for(var i = 1 ; i < L ; i++) {
	        v = a[i];
	        if(!SE.is(v)) { args.push(S(v)); }
	    }

	    return args.join(sep);
	};

	return {
		to: function(v, ds) {
	    	// NOTE: when value is an object, that contains a valueOf method,
	        // with the + operator, valueOf is called instead of toString, 
	        // and toString is called on that result only.
	        // Using String(value) ensures toString() is called on the object itself.
	        return v != N ? String(v) : (ds || E);
	    },
    
    	is: function(v) { return typeof v === 'string'; }
    };
});