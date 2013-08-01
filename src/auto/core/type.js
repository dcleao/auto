// ~~~~ Type (Private) ~~~~

function TypePrivate(pub, basePriv) {
    this.pub = pub;
    var is;
    if(basePriv) {
        this._base = basePriv;
        is = O_create(basePriv._is);
    } else {
        is = {}; 
    }
    
    this._is = is;
    is[O_id(pub)] = 1;
}

var O_propStrictEqualTo1 = function(p) { return this[p] === 1; };

O_copy(TypePrivate.prototype, {
    isBuilt:    F, // Indicates if the type has been built and is not editable anymore.

    _base:      N, // Base type, private.
    _init:      N, // Local init method.
    _post:      N, // Local post method.
    _mixes:     N, // List of mixed-in types-private.
    _mixesById: N, // Map of mixed-in types-private, by their id.
    _mixesSub:  N, // List of types-private that have this one mixed-in.
    _stepsInit: N, // Constructor/init steps.
    _stepsPost: N, // Constructor/post steps.
    _is:        N, // Map of All, local or inherited, base/mixed/interface types: id -> 1.

    // Immutable info
    base: function() {
        var base = this._base;
        return base && base.pub;
    },

    // Always up to date info
    inherits: function(TypePub) { return this._is[O_id(TypePub)] === 1; },
    
    // Setting only valid BEFORE build
    init: function(_) {
        if(_ !== U) {
            !this.isBuilt || Type_failBuilt();

            this._init = (_ === N) ? N :
                         (A.fun.as(_) || A.fail.arg.type('init', 'function'));
            return this.pub;
        }
        return this._init;
    },

    // Setting only valid BEFORE build
    post: function(_) {
        if(_ !== U) {
            !this.isBuilt || Type_failBuilt();

            this._post = (_ === N) ? N :
                         (A.fun.as(_) || A.fail.arg.type('post', 'function'));
            return this.pub;
        }
        return this._post;
    },

    // Only valid BEFORE build
    add: function(args) {
        !this.isBuilt || Type_failBuilt();

        args.forEach(function(arg) { 
            if(A.object.is(arg))   { this._props(arg); }
            else if(A.fun.is(arg)) { this._mix  (arg); }
            else { throw A.error.arg.invalid('args');  }
        }, this);

        return this.pub;
    },

    // Only valid BEFORE build
    // Shared/Static
    addShared: function(args) {
        !this.isBuilt || Type_failBuilt();

        args.forEach(function(arg) { 
            if(A.object.is(arg))   { this._propsShared(arg); }
            else if(A.fun.is(arg)) { this._propsShared(arg.prototype); }
            else { throw A.error.arg.invalid('args');  }
        }, this);

        return this.pub;
    },

    getShared: function(p, dv) {
        var priv = this;
        do {
            var Pub = priv.pub;
            if(Op_hasOwn.call(Pub, p)) { return Pub[p]; }
        } while((priv = priv._base));

        return dv;
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
        return this._stepsInit && Type_createStepped(this._stepsInit);
    },

    // Only valid AFTER build
    _postFinal: function() {
        return this._stepsPost && Type_createStepped(this._stepsPost);
    },

    // Called by add - only valid BEFORE build
    _props: function(map) {
        var Base = this.base();
        var Base_proto = Base && A.is(map, Base) ? Base.prototype : N;
        var This_proto = this.pub.prototype;
        var isAbstractProto = (This_proto === Abstract_proto)

        for(var p in map) {
            // Letting these pass-through could mess-up the type system.
            // The exception is that `base` must be let pass-trough to the Abstract class.
            if(p === 'constructor' || 
               p === Auto_ID       ||
               (!isAbstractProto && p === 'base')) { continue; }
            
            var value = map[p];
            if(value !== U) {
               // Skip properties that have the same value as that inherited from Base_proto
                if(Base_proto && (p in Base_proto) && Base_proto[p] === value) { continue; }

                var method = value && A.fun.as(value);
                if(method) {
                    // Is there a local/base/mixed previous method?
                    var baseMethod = A.fun.as(This_proto[p]);

                    This_proto[p] = Type_override(method, baseMethod);
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

    // Called by add - only valid BEFORE build
    _mix: function(x) {
        var id   = O_id(x);
        var priv = Type_key(x); 
        if(priv) {
            var mixesById = O_lazyOwn(this, '_mixesById'); // could be "O_lazy"
            
            if(Op_hasOwn.call(mixesById, id)) { return; }

            mixesById[id] = priv;
            A_lazyOwn(this, '_mixes').push(priv);

            this._onNewMix(priv);

            // Tell `priv` it's being mixed into this
            priv._beingMixedTo(this);

            // If we are mixed in others, below, 
            // tell these that there's a new mix, 
            // that they should inherit from, as well
            this._mixesSub && this._mixesSub.forEach(function(mixSub) { mixSub._onNewMix(priv); });
        }

        this._props(x.prototype);
    },

    _onNewMix: function(xpriv) {
        A.copy(this._is, xpriv._is, O_propStrictEqualTo1);
    },

    _beingMixedTo: function(subPriv) {
        A_lazyOwn(this, '_mixesSub').push(subPriv);
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
        // Make sure base is built
        var base = this._base;
        base && base.build();

        var addStep = function(steps, step) { step && steps.push(step); };

        var stepsInit = [],
            stepsPost = [];

        // Init/Post Local And Base
        addStep(stepsInit, Type_override(this._init, base && base._initFinal(), true/*forceBase*/));
        addStep(stepsPost, Type_override(this._post, base && base._postFinal(), true/*forceBase*/));

        // Init/Post of mixins
        var mixes = this._mixes;
        mixes && mixes.forEach(function(x) {
            // Make sure mixin is built
            x.build();

            addStep(stepsInit, x._initFinal());
            addStep(stepsPost, x._postFinal());
        });

        // Steps are stored in reverse order
        if(stepsInit.length) { this._stepsInit = stepsInit.reverse(); }
        if(stepsPost.length) { this._stepsPost = stepsPost.reverse(); }
    },
});

// ~~~~ Type (Public) ~~~~

// Safe-Factory public-instance/private-property key
var Type_key = _safeFactory().newProp();

var Type_proto = {
    base: function( ) { return Type_key(this).base( ); },
    init: function(_) { return Type_key(this).init(_); },
    post: function(_) { return Type_key(this).post(_); },

    // {} -> instance methods, properties
    // Function -> Must be a class - Mixin
    add: function() { return Type_key(this).add(Ap_slice.call(arguments)); },

    // Not very efficient...but at least #add is usually a one time task, 
    // so caching might be unnecessary anyway
    shared: function() {
        var Pub = this;
        return {
            add: function() { return Type_key(Pub).addShared(Ap_slice.call(arguments)); },
            get: function(p, dv) { return Type_key(Pub).getShared(p,dv); },
            instance: function() {  return Pub; }
        };
    },
    
    // Create a sub-Type of this one
    type: function() { return Type_create(this); },

    // Compile, close
    build: function() { return Type_key(this).build(); },

    // Indicates if this type inherits from a given type.
    // inherits-from(.) <=> is-based-on(.) or has-mixed-in(.)
    inherits: function(BaseOrMixin) { return Type_key(this).inherits(BaseOrMixin); },

    // SuperClass.inheritedBy(SubClass)
    // inherited-by(.) <=> is-base-of(.) or is-mixed-in-by(.)
    inheritedBy: function(Sub) {
        var SubPriv = Sub && Type_key(Sub);
        return !!SubPriv && SubPriv.inherits(this);
    },

    // Indicates if a given value is an instance of, or has mixed-in this, type.
    // Foo.is(foo)
    // A.string.is(s)
    is: function(o) {
        return (o instanceof Object) && this.inheritedBy(o.constructor);
    },

    as: function(o) { return this.is(o) ? o : N; }
};

function Type_createCtor(BaseCtor, initType) {
    var rsteps; // reversed steps

    function Ctor() {
        var i = (rsteps || (rsteps = initType())).length;

        while(i) { rsteps[--i].apply(this, arguments); }
    }

    return F_extend(BaseCtor, Ctor);
}

function Type_createStepped(rsteps) {
    var L = rsteps.length;
    
    function stepped() {
        var i = L;

        while(i) { rsteps[--i].apply(this, arguments); }
    }

    return stepped;
}

function Type_create(base) {
    base = base == N ? N :
          (A.fun.as(base) || A.fail.arg.type('base', 'function'));
    
    var basePriv = base && (Type_key(base) || A.fail.arg.type('base', 'A.Type'));

    // Private me
    var _me;

    // Public me is Ctor itself
    var Ctor = Type_createCtor(base, function() { return _me.initCtor(); });

    // Force id assignment (stored publicly).
    O_id(Ctor);

    _me = new TypePrivate(Ctor, basePriv);
    
    // Store private me, in public me
    Type_key.init(Ctor, _me);

    // Extend the Ctor with a Type's methods
    A.copy.own(Ctor, Type_proto);

    Ctor.to = Ctor;

    return Ctor;
}

// ~~~~ Abstract ~~~~
// Create Root Class of the type system

var Abstract = A.Abstract = Type_create(N);

var Abstract_proto = Abstract.prototype;

Abstract.add({
    // The default implementation, does nothing when called
    base: F_noop
});

// The typeDef of an A."Type"
A.type = typeDef(function(_) {
    
    //  a. No arguments or 1-Undefined -> Create a type
    //  b. 1-!Undefined argument -> Obtain (creating it if necessary) an instance's own type.
    _.to = function(o) {
        if(o === U) { return A.Abstract.type(); }
        if(A.object.is(o)) {
            // Obtain the instance's own type
            var C = o.constructor || A.assert("Has no constructor!");

            // Already a prototype with an associated class?
            if(C.prototype === o) { return C; }

            // Make sure it's an A.type.
            Type_key(C) || A.fail.arg.invalid('o', "Not an instance of a A.Abstract");

            // Create a sub-type of C.
            var C2 = C.type();

            // Re-wire C2 and o.
            C2.prototype  = o;
            o.constructor = C2;

            return C2;
        }
    };

    // Test if a something is a Type.
    _.is = function(C) { return C != N && !!Type_key(C); };
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
function Type_override(m, b, forceBase) {
    // TODO: do not override abstract b methods: treat them as non-existing.

    if(!m) { return b; } // no override, afterall
    if(!b) { return m; }

    // b and m
    if(!/\.base\b/.test(m)) {
        // m does NOT call b.
        return forceBase ? Type_forcedOverride(m, b) : m;
    }

    // In this case, `forceBase` is not enforced (see note above).
    return Type_uncheckedOverride(m, b);
}

function Type_forcedOverride(m, b) {

    function override() {
        b.apply(this, arguments);
        m.apply(this, arguments);
    }

    return override;
}

function Type_uncheckedOverride(m, b) {

    function override() {
        var _ = Abstract_proto, prev = _.base; _.base = b; // push
        try     { return m.apply(this, arguments); } 
        finally { _.base = prev; } // pop
    }

    return override;
}

// ~~~~ UTIL ~~~~

function Type_failBuilt() {
    throw A.error.oper.invalid("Type is already built and cannot be changed.");
}