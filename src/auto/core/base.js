
"use strict";

/*jshint expr:true */

var F_ident   = function(x) { return x; }
var Ap_slice  = Array .prototype.slice;
var Op_hasOwn = Object.prototype.hasOwnProperty;
var O_create  = Object.create;
var O_freeze  = Object.freeze || F_ident;

var F = false;
var T = true;
var N = null;
var U; // undefined
var E = "";
var Z = " ";
var EA = O_freeze([]); // Empty Array
var EO = O_freeze({}); // Empty Object

//var G = (function() { return this; }()); // TODO: obtain global scope and strict mode?

// Object property existence predicate methods
var Op_has = {
    own:         Op_hasOwn,
    notUndef:    function(p) { return this[p] !== U; },
    notNully:    function(p) { return this[p] !=  N; },
    ownNotUndef: function(p) { return Op_hasOwn.call(this, p) && this[p] !== U; },
    ownNotNully: function(p) { return Op_hasOwn.call(this, p) && this[p] !=  N; }
};

var O_copy = function(to, from, p) {
    if(!to) { to = {}; }
    
    // tolerates null and undefined
    for(var n in from) { if(!p || p.call(from, n, to)) { to[n] = from[n]; } }
    return to;
};

var O_each = function(o, f, x, p) {
    for(var n in o) { // tolerates null or undefined
        if((!p || p.call(o, n)) && f.call(x, o[n], n, o) === F) { return F; }
    }
    return T;
};

// var O_keys_each = function(o, f, x) {
//     for(var p in o) { if(f.call(x, p) === F) { return F } }
//     return T;
// };
    
// var O_values_each: function(o, f, x) {
//     for(var p in o) { if(f.call(x, o[p]) === F) { return F } }
//     return T;
// };

var O_lazyOwn = function(o, p, f, x) {
    return Op_hasOwn.call(o, p) ? o[p] : (o[p] = (f ? f.call(x, p) : {}));
};

var A_lazyOwn = function(o, p, f, x) {
    return Op_hasOwn.call(o, p) ? o[p] : (o[p] = (f ? f.call(x, p) : []));
};

var F_extend = function(fsup, fsub, props) {
    if(fsup) {
        var sub = fsub.prototype = O_create(fsup.prototype || fsup);
        // The following fix causes the undesirable side-effect that
        // `constructor` is inherited by all instances.
        // Setting it, apparently makes it enumerable... 
        // (Isn't this a bug from the JS engine? 
        //  Or, by the spec, setting the value of a non-enumerable, 
        //  but settable, property makes it loose the non-enumerable setting?)
        sub.constructor = fsub;
    }
    if(props) { O_copy(sub, props, Op_has.notUndef); }
    return fsub;
};

var F_is = function(v) { return typeof v === 'function'; };

var F_noop = function() {};

// ~~~~~~~~~~~~
// A.id
var Auto_nextId = 1;
var Auto_ID = '__auto_id';
var Auto_IS = '__auto_is';

var O_id = function(o) {
    return (Op_hasOwn.call(o, Auto_ID) && o[Auto_ID]) || (o[Auto_ID] = Auto_nextId++);
};

// ~~~~~~~~~~~~

var O_get = function(o, p, dv) { return o != N && (p in o) ? o[p] : dv; };

O_get.notNully = function(o, p, dv) { var v; return o != N && (v = o[p]) != N ? v : dv; };
O_get.notUndef = function(o, p, dv) { var v; return o != N && (v = o[p]) != U ? v : dv; };
O_get.own      = function(o, p, dv) { var v; return o != N && Op_hasOwn.call(o, p) ? v : dv; };

// ~~~~~~~~~~~~

// Root namespace - A, of Auto
var A = O_copy({}, {
    extend:  F_extend,
    id:      O_id,
    PROP_ID: Auto_ID,

    scope: function(f, x) { return f.call(x); },
    
    // Checks if some value is a non-null object and that 
    // it is an instance of a specified class or implements a specified interface.
    // If the value's type does not inherit from the given class/interface,
    // then the object's local type map is checked for explicit implementation.
    is: function(o, C)  { return (o instanceof C) || (!!C.is && C.is(o)); },
    as: function(o, C)  { return A.is(o, C) ? o : N; },

    // to: as/ or wrap/ or throw/
    // 
    //tryCast: function(o, C) { return A.as(o, C); },

    // Collides with A.type() - type system
    //type: { // TODO: is this needed? Already have A.fun.is, A.number.is, ...
    //  is: function(v, t) { return typeof v === t; }
    //},

    has: function(o, p) { return o != N && (p in o); },
    
    // get existing prop
    get: O_get,
    
    set: function(o) {
        if(!o) { o = {}; }
        var a = arguments;
        for(var i = 1, L = a.length - 1 ; i < L ; i += 2) { o[a[i]] = a[i+1]; }
        return o;
    },
    
    nully: {
        is: function(v)     { return v == N; },
        to: function(v, dv) { return v == N ? dv : v; }
    },

    truthy: {is: function(v) { return !!v; }},
    falsy:  {is: function(v) { return  !v; }},

    each: O_each,
    
    // A.copy(to, from, pred) -> to
    // A.copy(from, pred) -> to
    // A.copy(to, from) -> to
    // A.copy(from) -> to
    copy: function(a, b, c) {
        var to, from, p;
        var L = arguments.length;
        if(L >= 3) {
            to = a, from = b, p = c;
        } else if(L === 2) {
            if(A.fun.is(b)) {
                from = a, p = b;
            } else {
                to = a, from = b;
            }
        } else {
            from = a;
        }
        
        return O_copy(to, from, p);
    },

    keys: function(o, f, x) {
        var ks = []; 
        for(var p in o) {
            var k = f ? f.call(x, p) : p;
            ks.push(k);
        } 
        return ks;
    },
    
    values: function(o, f, x) {
        var vs = []; 
        for(var p in o) {
            var v = f ? f.call(x, o[p]) : o[p];
            vs.push(v);
        }
        return vs;
    },
    
    /* Identity is favored because, otherwise,
     * comparisons like: compare(NaN, 0) would return 0...
     * This isn't perfect either, because:
     * compare(NaN, 0) === compare(0, NaN) === -1
     * so sorting may end in an end or the other...
     */
    compare: function(a, b) { return (a === b) ? 0 : ((a > b) ? 1 : -1); },
    
    comparer: function(kas) {
        var comp = O_get(kas, 'comp') || A.compare;
        var by   = O_get(kas, 'by');
        if(by) {
            var kcomp = comp;
            comp = function(a, b) { return kcomp(by(a), by(b)); };
        }
        
        return comp;
    },
    
    methodCaller: function(n, x) {
        if(F_is(n)) { return x ? n.bind(x) : n; }
        return x ? 
            function() { return    x[n].apply(   x, arguments); }:
            function() { return this[n].apply(this, arguments); };
    },
    
    // This signature is quite strange
    getPath: function(o, path, dv, create) {
        if(!o) { return dv; }
        
        if(path != N) {
            var parts = A.array.is(path) ? path : path.split('.');
            var L = parts.length;
            if(L) {
                var i = 0;
                while(i < L) {
                    var part = parts[i++];
                    var value = o[part];
                    if(value == N) {
                        if(!create) { return dv; }
                        value = o[part] = (dv == N || isNaN(+dv)) ? {} : [];
                    }
                    
                    o = value;
                }
            }
        }
        
        return o;
    },
    
    setPath: function(o, path, v) {
        if(o && path != N) {
            var parts = A.array.is(path) ? path : path.split('.');
            if(parts.length) {
                var pLast = parts.pop();
                o = A.getPath(o, parts, pLast, T);
                if(o != N) { o[pLast] = v; }
            }
        }
        
        return o;
    }
});

A.keys.own = function(o, f, x) {
    var ks;
    if(o) {
        var ownKeys = Object.keys(o);
        ks = !f ? ownKeys : ownKeys.map(f, x);
    }
    return ks || [];
};

A.values.own = function(o, f, x) {
    var vs;
    if(o) {
        var fmap = f ?
            function(k) { return f.call(x, o[k], k); } :
            function(k) { return o[k]; };

        vs = A.keys.own(o).map(fmap);
    }
    return vs || [];
};

A.compare.reverse = function(a, b) { return (a === b) ? 0 : ((a > b) ? -1 : 1); };


O_each(Op_has, function(pred, n) {
    
    // A.has.???(o, p) -> boolean
    A.has[n] = function(o, p) { return o != N && pred.call(o, p); };

    // A.copy.???(to, from) -> to
    // A.copy.???(from) -> to
    A.copy[n] = function(a, b) {
        var to, from;
        if(arguments.length === 2) { to = a, from = b; } 
        else { from = a; }
        
        return O_copy(to, from, pred);
    };

    // A.each.???(o, f, x)
    A.each[n] = function(o, f, x) { return O_each(o, f, x, pred); };
},
Op_hasOwn);
