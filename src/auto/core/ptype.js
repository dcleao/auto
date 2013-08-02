// loadtime: base(F_extend, O_create)
//           atype(ATypePrivate, AType_proto)
// runtime:  base(O_id, A.copy.notUndef)  -> loadtime because of created predicate types below

// PredicateType - PType

// ~~~~ PType (Private) ~~~~

function PTypePrivate(pub) {
    this.pub = pub;
    
    ATypePrivate.call(this, pub);
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
    // This is defined in a way that `Pub.to` may be later redefined.
    var Pub = function() { return Pub.to.apply(Pub, arguments); };

    // Extend with default PType's methods
    A.copy.notUndef(Pub, PType_proto);

    // The only requirement for `def` is that it fills in `Pub.is`.
    def(Pub);

    // Force id assignment (stored publicly).
    O_id(Pub);

    var priv = new PTypePrivate(Pub);
    
    // Store private me, in public me
    AType_key.init(Pub, priv);

    return Pub;
}

// Make sure the private object is stored in the corresponding Pub
var getOwnTypePriv = function(Pub) {
    var priv;
    return Pub && (priv = AType_key(Pub)) && (priv.pub === Pub) ? priv : N;
};

// A PType for Auto's types
A.type = PType_create(function(_) {
    _.is = function(Pub) { return !!getOwnTypePriv(Pub); };
    //_.to = ??
});

// A PType for Auto's predicate types
A.type.predicate = PType_create(function(_) {
    _.is = function(Pub) { return getOwnTypePriv(Pub) instanceof PTypePrivate; };

    // TODO: really need a protected version of PType_create?
    _.to = function(def) { return PType_create(def); };
});