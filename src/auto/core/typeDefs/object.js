// loadtime: base(O_lazyOwn)
// runtime:  base(O_create, A.copy.notUndef)

A.object = A.type.predicate(function(_) {
    _.lazy = function(o, p, f, x) { return o[p] || (o[p] = (f ? f.call(x, p) : {})); };
    _.lazy.own = O_lazyOwn; // defined in base

    // Slightly faster than (typeof v === 'object') but may cause boxing?
    var _nat = _.native = {
        is: function(v) { return !!v && v.constructor === Object; },
        as: function(v) { return _nat.is(v) ? v : N; }
    };

    A.create = _.create = function(/*[deep,] sup, merge1, merge2, ...*/) {
        var merges = Ap_slice.call(arguments);
        var deep = true;
        var sup  = merges.shift();
        if(typeof sup === 'boolean') {
            deep = sup;
            sup  = merges.shift();
        }

        var sub;
        if(sup) {
            sub = O_create(sup.prototype || sup);
            if(deep) { createRecursive(sub); }
        } else {
            sub = {};
        }
        
        if(merges.length) { Merge_many(sub, merges, O_create/*protectNativeObj*/); }
        
        return sub;
    };
    
    // Cycles will make this crash with stack-overflow...
    function createRecursive(o) {
        for(var p in o) {
            var no = _nat.is(o[p]);
            if(no) { createRecursive((o[p] = O_create(no))); }
        }
    }

    // How to call a constructor dynamically? 
    // ->  new Class.apply(null, args) is not valid
    A.make = _.make = function(Class, args) {
        var o = O_create(Class.prototype);
        Class.apply(o, args || EA);
        return o;
    };

    return {
        to: Object,

        // Is (v instanceof Object) faster?
        is: function(v) { return !!v && typeof v === 'object'; }
    };
});