// in practice, 
// almost all "runtime" is also "loadtime", because of the creation of A.Base
//
// loadtime: base(F_extend, O_copy, O_create, F_noop)
// runtime:  fun(A.fun.as)
//           error(A.fail.arg.type, A.error.arg.invalid, A.error.oper.invalid, A.assert)
//           base(Op_hasOwn, Ap_slice, 
//                F_ident, O_id, O_lazyOwn, A_lazyOwn, 
//                A.copy, A.copy.own)
//           merge(Merge_prop, A.merge.inherit)
//           object(A.object.is, A.object.as, A.object.native.as)

// ComplexType - CType

// ~~~~ CType (Private) ~~~~

function CTypePrivate(pub, basePriv) {
    ATypePrivate.call(this, pub, basePriv);
}

F_extend(ATypePrivate, CTypePrivate, {
    isBuilt:     F, // Indicates if the type has been built and is not editable anymore.

    _init:       N, // Local init method.
    _post:       N, // Local post method.
    _stepsInit:  N, // Constructor/init steps.
    _stepsPost:  N, // Constructor/post steps.

    // Set only
    init: function(_) {
        !this.isBuilt || CType_failBuilt();

        this._init = (_ == N) ? N :
                     (A.fun.as(_) || A.fail.arg.type('init', 'function'));
        return this.pub;
    },

    // Set only
    post: function(_) {
        !this.isBuilt || CType_failBuilt();

        this._post = (_ == N) ? N :
                     (A.fun.as(_) || A.fail.arg.type('post', 'function'));
        return this.pub;
    },

    get: function(p, dv) {
        var Pub_proto = this.pub.prototype;
        return (p in Pub_proto) ? Pub_proto[p] : dv;
    },

    getShared: function(p, dv) {
        var priv = this;
        do {
            var Pub = priv.pub;
            if(Op_hasOwn.call(Pub, p)) { return Pub[p]; }
        } while((priv = priv._proto));
        return dv;
    },

    add: function() {
        Ap_slice.call(arguments).forEach(this._add, this);
        return this.pub;
    },

    addShared: function() {
        !this.isBuilt || CType_failBuilt();
        Ap_slice.call(arguments).forEach(this._addShared, this);
        return this.pub;
    },
    
    _add: function(arg) {
        if(A.object.is(arg))   { this._props(arg); }
        else if(A.fun.is(arg)) { this._mix  (arg); }
        else { throw A.error.arg.invalid('arg');   }
    },

    _addShared: function(arg) {
        if(A.object.is(arg))   { this._propsShared(arg          ); }
        else if(A.fun.is(arg)) { this._propsShared(arg.prototype); } 
        else { throw A.error.arg.invalid('arg'); }
    },

    // Called from first instance being newed up.
    initCtor: function() {
        this.build();

        // Join constructor steps and return them.
        var sis = this._stepsInit, sps = this._stepsPost;

        // As steps are reversed, post must be put before init.
        return (!sis ? sps : !sps ? sis : sps.concat(sis)) || EA;
    },
    
    build: function() {
        if(!this.isBuilt) {
            this._buildCore();
            this.isBuilt = T;
        }
        return this;
    },

    // Only valid AFTER build
    _initFinal: function() {
        return this._stepsInit && CType_createStepped(this._stepsInit);
    },

    // Only valid AFTER build
    _postFinal: function() {
        return this._stepsPost && CType_createStepped(this._stepsPost);
    },

    // Called by add - only valid BEFORE build
    _props: function(map) {
        !this.isBuilt || CType_failBuilt();

        var Base = this.proto();
        var Base_proto = Base && A.is(map, Base) ? Base.prototype : N;
        var This_proto = this.pub.prototype;
        var isRootProto = (This_proto === A_Base_proto)

        for(var p in map) {
            // Letting these pass-through could mess-up the type system.
            // The exception is that `base` must be let pass-trough to the Abstract class.
            if(p === 'constructor' || 
               p === Auto_ID       ||
               (!isRootProto && p === 'base')) { continue; }
            
            var value = map[p];
            if(value !== U) {
               // Skip properties that have the same value as that inherited from Base_proto
                if(Base_proto && (p in Base_proto) && Base_proto[p] === value) { continue; }

                var method = value && A.fun.as(value);
                if(method) {
                    // Is there a local/base/mixed previous method?
                    var baseMethod = A.fun.as(This_proto[p]);

                    This_proto[p] = CType_override(method, baseMethod);
                } else {
                    // NOTE: Merge_prop accepts value === N
                    Merge_prop(This_proto, p, value, /*protectNativeValue*/F_ident); // Can use native object value directly
                    //This_proto[p] = value;
                }
            }
        }
    },

    _propsShared: function(map) {
        var This = this.pub;
        for(var p in map) {
            var v2 = map[p];
            if(v2 !== U && p !== 'prototype' && p !== 'constructor') {
                // Merge_prop cannot be directly used here,
                // because inherited values must be obtained through getShared...
                var o2 = A.object.as(v2);
                if(o2) {
                    // Current local or inherited value is a native object?
                    var v1 = this.getShared(p);
                    var o1 = A.object.native.as(v1);
                    if(o1) {
                        if(!Op_hasOwn.call(This, p)) {
                            // Localize o1, before merging into
                            This[p] = o1 = O_create(o1);
                        }
                        
                        // TODO: protectNativeValue = O_create... Why different from non-shared?
                        A.merge.inherit(o1, o2);
                        continue;
                    }
                }

                // else v2 smashes anything in This[p]
                This[p] = v2;
            }
        }
    },

    // Called by add - if x is a complex type, then only valid BEFORE build
    _mix: function(x) {
        this._mixPriv(AType_key(x));
    },

    _mixPriv: function(xpriv) {
        var isCType = (xpriv instanceof CTypePrivate);
        !this.isBuilt || !isCType || CType_failBuilt();

        // If x is already mixed, return.
        if(xpriv && !this._addBase(xpriv))  { return; }

        // Mix x's ctype prototype into this one's.
        if(isCType) { this._props(xpriv.pub.prototype); }
    },

    /*
        We make sure that, locally, a mixin is only used once, in #_mix.
        What about base mixins and mixins' bases and mixins...?
        For now, we assume that a class can only appear once, in the type relation graph...

        A
        .base B
            .base C
                .mixin X
                .mixin Y
            .mixin Z
        .mixin W (invalid ? --v)      W inherits from one of A's bases -- C
            .base D (invalid ? --v)
                .base C  (invalid ? )
        .mixin V
            .base E (valid)
            .mixin X (excluded)
        .mixin U
            .base E (valid)
        
        .mixin C ????????
    */
    _buildCore: function() {
        // Make sure proto is built
        var proto = this._proto;
        proto && proto.build();

        var addStep = function(steps, step) { step && steps.push(step); };

        var stepsInit = [],
            stepsPost = [];

        // Init/Post Local And Proto
        addStep(stepsInit, CType_override(this._init, proto && proto._initFinal(), true/*forceBase*/));
        addStep(stepsPost, CType_override(this._post, proto && proto._postFinal(), true/*forceBase*/));

        // Init/Post of mixins
        var bases = this._bases;
        bases && bases.forEach(function(base) {
            if(base instanceof CTypePrivate) {
                // A mixin.

                // Make sure mixin is built
                base.build();

                addStep(stepsInit, base._initFinal());
                addStep(stepsPost, base._postFinal());
            }
        });

        // Steps are stored in reverse order
        if(stepsInit.length) { this._stepsInit = stepsInit.reverse(); }
        if(stepsPost.length) { this._stepsPost = stepsPost.reverse(); }
    }
});

// ~~~~ CType (Public) ~~~~

var CType_proto = O_copy(O_create(AType_proto), {
    // Indicates if a given value is an instance of, 
    // or has mixed-in this, type.
    is: function(o) {
        return (o instanceof Object) && this.inheritedBy(o.constructor);
    },

    // Create a sub-CType of this one
    extend: function() { return CType_create(this); },

    shared: function() {
        var priv = AType_key(this);
        return {
            instance: A.fun.constant(this), // go back to instance mode
            add: function() { return priv.addShared.apply(priv, arguments); },
            get: function() { return priv.getShared.apply(priv, arguments); }
        };
    }
}, Op_hasOwn);

// These are dispatched directly to the private versions
['init','post','add','get','build']
.forEach(function(n) { CType_proto[n] = AType_dispatch(n); });

function CType_createCtor(BaseCtor, initType) {
    var rsteps; // reversed steps

    function Ctor() {
        var i = (rsteps || (rsteps = initType())).length;

        while(i) { rsteps[--i].apply(this, arguments); }
    }

    return F_extend(BaseCtor, Ctor);
}

function CType_createStepped(rsteps) {
    var L = rsteps.length;
    
    function stepped() {
        var i = L;

        while(i) { rsteps[--i].apply(this, arguments); }
    }

    return stepped;
}

function CType_create(base) {
    base = base == N ? N :
          (A.fun.as(base) || A.fail.arg.type('base', 'function'));
    
    var basePriv = base && (AType_key(base) || A.fail.arg.type('base', 'A.Type'));

    // Private me
    var priv;

    // Public me is Ctor itself
    var Ctor = CType_createCtor(base, function() { return priv.initCtor(); });

    // Force id assignment (stored publicly).
    O_id(Ctor);

    priv = new CTypePrivate(Ctor, basePriv);
    
    // Store private me, in public me
    AType_key.init(Ctor, priv);

    // Extend the Ctor with a CType's methods
    A.copy.notUndef(Ctor, CType_proto);

    Ctor.to = Ctor;

    return Ctor;
}

// ~~~~ Base ~~~~
// Create Root Class of Complex Types

var A_Base = A.Base = CType_create(N);

var A_Base_proto = A_Base.prototype;

A_Base
// An A.Base instance is also an A.object.
.add(A.object)
.add({
    // The default implementation, does nothing when called
    base: F_noop
})
.build(); // Close the type

// The predicate type of Complex types.
A.type.complex = A.type.predicate(function(_) {
    return {
        is: function(Pub) { return getOwnTypePriv(Pub) instanceof CTypePrivate; },

        //  a. No arguments or 1-Undefined -> Create a type
        //  b. 1-!Undefined argument -> Obtain (creating it if necessary) an instance's own type.
        to: function(o) {
            if(o === U) {
                return A_Base.extend(); 
            }
            if(A.object.is(o)) {
                // Obtain (creating if necessary) the instance's own complex type
                var C = o.constructor || A.assert("Has no constructor!");

                // Already a prototype with an associated class?
                if(C.prototype === o) { return C; }

                // Make sure it's a proper CType
                _.is(C) || A.fail.arg.invalid('o', "Not an instance of a A.Base");

                // Create a sub-type of C.
                var C2 = C.extend();

                // Re-wire C2 and o.
                C2.prototype  = o;
                o.constructor = C2;

                return C2;
            }
        }
    };
});

// ~~~~ OVERRIDE ~~~~
// When `forceBase` is truthy, 
// we want to ensure that `b`, if any, is called.
// If `m` doesn't have ".base" in its code, 
// then `b` is automatically called and only then `m` is called.
// `base` will not be defined in that case.
// It is too costly to wrap `b` in a function that
// ensures that `b` is actually called by `m`.
// We consider it sufficient that ".base" can be found
// in `m`'s code. If the user has this text in a comment, 
// or a conditional statement that isn't executed, or in a string,

// and `b` isn't actually called, well, it's his problem.
function CType_override(m, b, forceBase) {
    // TODO: do not override abstract b methods: treat them as non-existing.

    if(!m) { return b; } // no override, afterall
    if(!b) { return m; }

    // b and m
    if(!/\.base\b/.test(m)) {
        // m does NOT call b.
        return forceBase ? CType_forcedOverride(m, b) : m;
    }

    // In this case, `forceBase` is not enforced (see note above).
    return CType_uncheckedOverride(m, b);
}

function CType_forcedOverride(m, b) {

    function override() {
        b.apply(this, arguments);
        m.apply(this, arguments);
    }

    return override;
}

function CType_uncheckedOverride(m, b) {

    function override() {
        var _ = A_Base_proto, prev = _.base; _.base = b; // push
        try     { return m.apply(this, arguments); } 
        finally { _.base = prev; } // pop
    }

    return override;
}

// ~~~~ UTIL ~~~~

function CType_failBuilt() {
    throw A.error.oper.invalid("Type is already built and cannot be changed.");
}