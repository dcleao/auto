// loadtime: base(F_extend, O_create)
//           atype(ATypePrivate, AType_proto)
// runtime:  base(O_id, A.copy.notUndef)  -> loadtime because of created predicate types below

// PredicateType - PType

// ~~~~ PType (Private) ~~~~

function PTypePrivate(pub, bases) {
    this.pub = pub;
    
    ATypePrivate.call(this, pub, null/*proto*/, bases);
}

F_extend(ATypePrivate, PTypePrivate);

// ~~~~ CType (Public) ~~~~
var PType_proto = O_create(AType_proto);

function PType_create(def) {
    // `Pub` is the main function - 
    //  it's not like a constructor, to be used with `new`, 
    //  like in ComplexTypes;
    //  it's more like a cast or convert function.
    // When called, it tries to convert its argument(s) to this type.
    // This wrapper makes it possible that `Pub.to` can be later redefined.
    var Pub = function() { return Pub.to.apply(Pub, arguments); };

    // Extend with default PType's methods
    A.copy.notUndef(Pub, PType_proto);

    var bases;
    var opts = def(Pub);
    if(opts) {
        if(opts.is) { Pub.is = opts.is; }
        if(opts.to) { Pub.to = opts.to; }

        bases = opts.bases;
        if(bases) { bases = bases.map(getOwnTypePriv); }
    }

    // Force id assignment (stored publicly).
    O_id(Pub);

    var priv = new PTypePrivate(Pub, bases);
    
    // Store private me, in public me
    AType_key.init(Pub, priv);

    // Wrap "is" method with generic implementation
    Pub.is = PType_wrapIs(priv, Pub.is);

    return Pub;
}

function PType_wrapIs(priv, evalIs) {
    return function(value) { return PType_is(value, priv, evalIs); };
}

// Predicate type wrapper "predicate/is" function
// For instances of complex types, it verifies if 
// * the ctype has ptype as a base type
// * the ctype's prototype satisfies the ptype's predicate
//   in which case, the ptype is added to ctype as a base type.
function PType_is(value, priv, evalIs) {
    var Pub = priv.pub;

    // 1. If value is not an instance of a complex type, simply call evalIs.
    if(!(value instanceof A_Base)) {
        // value may be null, in which case it ends up here.
        return evalIs.call(Pub, value);
    }

    var C = value.constructor;
    var CPriv = getOwnTypePriv(C) || A.fail.oper.invalid("Tampered instance.");
    (CPriv instanceof CTypePrivate) || A.assert("Must be a complex type");

    // A complex type instance.
    // Is the CType known to be based on this one?
    // TODO: Could test 0/1 values.
    if(CPriv.inherits(Pub)) {
        // Assume value, as an instance, has not been modified and also is PType...
        return T;
    }

    // Does the complex type's prototype satisfy the predicate?
    var is = evalIs.call(Pub, C.prototype);
    // If is, CPriv is based in PType after all...
    // Mixing is available, whether or not the ctype is locked/built, when the mixed-in type is not a complex type.
    if(is) { CPriv._mixPriv(priv); }
    return is;
    // TODO: Store the 0 in CPriv, so we don't test again

    // Does the instance satisfy the predicate?
    // Should we test that far?
    // This opens up the problem of where to store the result...
    //  and of being performant.
    // If something is an instance of a CType, we only test the CType.
    // It is still possible to create an own type to give
    //  independence to a give instance.
    // We just cannot create an own type, per tested instance,
    //  to store the result.
    // Even if we wouldn't create an own type, and thus not store the result,
    //  we would still be worsening the performance of every normal false CType_proto test
    //  to test the instance explicitly.
}

// Make sure the private object is stored in the corresponding Pub
var getOwnTypePriv = function(Pub) {
    var priv;
    return Pub && (priv = AType_key(Pub)) && (priv.pub === Pub) ? priv : N;
};

// A PType for Auto's types
A.type = PType_create(function(_) {
    return {
        is: function(Pub) { return !!getOwnTypePriv(Pub); }
        //to: ??
    };
});

// A PType for Auto's predicate types
A.type.predicate = PType_create(function(_) {
    return {
        // Every Predicate type is also a Type
        bases: [A.type],
        
        is: function(Pub) { return getOwnTypePriv(Pub) instanceof PTypePrivate; },

        // TODO: really need a protected version of PType_create?
        to: function(def) { return PType_create(def); }
    };
});
