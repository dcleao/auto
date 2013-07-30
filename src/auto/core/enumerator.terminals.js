
// Used below
var _minAcc = function(min, v, i) { 
    return (min == N || !i) ? v :
           (v   == N)       ? min :
           v < min ? v : min; 
};

var _maxAcc = function(max, v, i) { 
    return (max == N || !i) ? v :
           (v   == N)       ? max : 
           v > max ? v : max; 
};

IEtor.terminals = {
    
    // TRAVERSAL (for side-effects)
    each: function(f, x) {
        var etor = this;
        try {
            while(etor.next()) {
                if(f.call(x, etor.item, etor.index) === F) { 
                    return T; 
                }
            }
            return F;
        } finally { etor.dispose(); }
    },
    
    call: function(n) { return this.apply(n, Ap_slice.call(arguments, 1)); },
    
    apply: function(n, args) {
        var etor = this;
        try {
            var e, m;
            while(etor.next()) {
                if((e = etor.item) && (m = e[n])) { m.apply(e, args || EA); }
            } 
        } finally { etor.dispose(); }
    },
    
    // REDUCE methods
    reduce: function(acc/*, [initialValue]*/) {
        var r;
        var etor = this;
        try {
            if(arguments.length < 2) {
                if(!etor.next()) {
                    throw A.error.operationInvalid("Length is 0 and no second argument"); 
                }
                
                r = etor.item;
            } else {
                r = arguments[1];
            }
            
            while(etor.next()) { r = acc(r, etor.item, etor.index); }
            
        } finally { etor.dispose(); }
        
        return r;
    },
    
    // Could be written using reduce, but preferred performance on this one
    array: function() {
        var etor = this;
        try { 
            var r = [];
            while(etor.next()) { r.push(etor.item); } 
            return r;
         } finally { etor.dispose(); }
    },
    
    // Could be written using reduce, but preferred performance on this one
    count: function() {
        var etor = this;
        try {
            var c = 0;
            while(etor.next()) { c++; } 
            return c;
        } finally { etor.dispose(); }
    },
    
    // Returns null if Etor has no elements.
    // Works because, now, "add" ignores 3rd argument.
    // Also, null + 1 = 1;  +null === 0
    sum: function() { return this.reduce(M.add, N); },
    
    // TEST methods
    // A.Enumerator -> boolean
    any: function(p, x) {
        var etor = this;
        try {
            while(etor.next()) {
                if(!p || p.call(x, etor.item, etor.index)) {
                    return T; 
                }
            }
            return F;
        } finally { etor.dispose(); }
    },
    
    all: function(p, x) {
        if(!p) { return T; }
        var etor = this;
        try {
            while(etor.next()) {
                if(!p.call(x, etor.item, etor.index)) {
                    return F; 
                }
            }
            return T;
        } finally { etor.dispose(); }
    },
    
    // EXTRACTION methods
    // A.Enumerator -> value
    first: function(p, item, x) {
        var etor = this;
        try {
            while(etor.next()) {
                if(!p || p.call(x, etor.item, etor.index)) {
                    return etor.item;
                }
            }
            return item;
        } finally { etor.dispose(); }
    },
    
    last: function(p, item, x) {
        var etor = this;
        try {
            while(etor.next()) {
                if(!p || p.call(x, etor.item, etor.index)) {
                    item = etor.item;
                }
            }
            return item;
        } finally { etor.dispose(); }
    },
    
    min: function(comp, min0, x) {
        var acc = comp ?
            function(min, v, i) {
                return (min == N || !i) ? v   :
                       (v   == N)       ? min :
                       comp.call(x, v, min) < 0 ? v : min; 
            } :
            _minAcc;

        return this.reduce(acc, min0);
    },
    
    max: function(comp, max0, x) {
        var acc = comp ?
            function(max, v) {
                return (max == N || !i) ? v   :
                       (v   == N)       ? max :
                       comp.call(x, v, max) > 0 ? v : max; 
            } :
            _maxAcc;
            
        return this.reduce(acc, max0);
    },
    
    extent: function(comp, x) {
        var etor = this;
        try {
            var any, min, max;
            while(etor.next()) {
                var item = etor.item;
                if(item != N) {
                    if(!etor.index) {
                        any = 1;
                        min = max = item;
                    } else if(comp) {
                        if(comp.call(x, item, min) < 0) { min = item; }
                        if(comp.call(x, item, max) > 0) { max = item; }
                    } else {
                        if(item < min) { min = item; }
                        if(item > max) { max = item; }
                    }
                }
            }
            
            return any && {min: min, max: max};
        } finally { etor.dispose(); }
    }
    
    // Not sure if these should be to Query lifters instead
    //sort:    function(comp) { return this.array().sort(comp || A.compare); },
    //reverse: function(    ) { return this.array().reverse(); }
};

A.copy.own(IEtor, IEtor.terminals);
