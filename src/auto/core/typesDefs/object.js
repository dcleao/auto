// loadtime: base(typeDef, O_lazyOwn, typeDef_makeAs)
// runtime:  base(O_create, A.copy.notUndef)

A.object = typeDef(function(_) {
    _.to = Object;

    // Is (v instanceof Object) faster?
    _.is = function(v) { return !!v && typeof v === 'object'; };

    _.lazy = function(o, p, f, x) { return o[p] || (o[p] = (f ? f.call(x, p) : {})); };
    _.lazy.own = O_lazyOwn; // defined in base

    _.native = {
        // Sightly faster than (typeof v === 'object') but may cause boxing?
        is: function(v) { return !!v && v.constructor === Object; }
    };

    _.native.as = typeDef_makeAs(_.native.is);

    A.create = _.create = function(sup) {
        var sub = sup ? O_create(sup.prototype || sup) : {};
        var args = arguments, L = args.length, i = 1;
        while(i < L) {
            var arg = args[i++];
            if(arg) { A.copy.notUndef(sub, arg.prototype || arg); }
        }
        return sub;
    };
    
    // How to call a constructor dynamically? 
    // ->  new Class.apply(null, args) is not valid
    A.make = _.make = function(Class, args) {
        var o = O_create(Class.prototype);
        Class.apply(o, args || EA);
        return o;
    };
});