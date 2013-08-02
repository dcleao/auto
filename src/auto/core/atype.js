// loadtime: base(F_extend)
//           safeFactory(_safeFactory)
// runtime:  base(O_create, O_id, A.copy, A_lazyOwn, Op_hasOwn, O_lazyOwn)

var O_propStrictEqualTo1 = function(p) { return this[p] === 1; };

// AbstractType - AType

// ~~~~ AType (Private) ~~~~

function ATypePrivate(pub, protoPriv, basePrivs) {
    this.pub = pub;
    
    var is;
    if(protoPriv) {
        this._proto = protoPriv;
        is = O_create(protoPriv._is);
    } else {
        is = {};
    }
    is[O_id(pub)] = 1;
    this._is = is;

    basePrivs && basePrivs.forEach(this._addBase, this);
}

F_extend(null, ATypePrivate, {
    _proto:     N, // Prototype type, if any.
    _bases:     N, // List of all direct base types (excludes _proto!!).
    _basesById: N, // Map of bases by their id: id -> 1.
    _subs:      N, // List of all direct sub-types  (those which this is base of; except _proto)
    _is:        N, // Map of all types that this one inherits from, directly or indirectly: id -> 1.

    // Always up to date info
    inherits: function(TypePub) { return this._is[O_id(TypePub)] === 1; },
    
    // Get only - immutable
    proto: function() {
        var proto = this._proto;
        return proto && proto.pub;
    },

    _addBase: function(basePriv) {
        var id = O_id(basePriv.pub);
        var basesById = O_lazyOwn(this, '_basesById');
        if(!Op_hasOwn.call(basesById, id)) {
            A_lazyOwn(this, '_bases').push(basePriv);
            basesById[id] = 1;
            basePriv._onNewSub(this);
            this._onNewIs(basePriv);
            return T;
        }
    },

    // Called for direct and indirect bases
    _onNewIs: function(isPriv) {
        // Add all _is[type_id]=1 of isPriv to local _is
        A.copy(this._is, isPriv._is, O_propStrictEqualTo1);

        // Notify any subs, so that they add basePriv._is as well.
        this._subs && this._subs.forEach(function(subPriv) { subPriv._onNewIs(isPriv); });
    },

    _onNewSub: function(subPriv) {
        A_lazyOwn(this, '_subs').push(subPriv);
    }
});

// ~~~~ AType (Public) ~~~~

// Safe-Factory public-instance/private-property key
var AType_key = _safeFactory().newProp();

var AType_dispatch = function(n) {
    return function() {
        var priv = AType_key(this);
        return priv[n].apply(priv, arguments);
    };
};

var AType_proto = {
    proto:    AType_dispatch('proto'),

    // Indicates if this type inherits from a given type.
    // inherits-from(.) <=> is-based-on(.) or has-mixed-in(.)
    inherits: AType_dispatch('inherits'),

    // SuperClass.inheritedBy(SubClass)
    // inherited-by(.) <=> is-base-of(.) or is-mixed-in-by(.)
    inheritedBy: function(Sub) {
        var SubPriv = Sub && AType_key(Sub);
        return !!SubPriv && SubPriv.inherits(this);
    },

    to: function(o) { return this.as(o); },
    as: function(o) { return this.is(o) ? o : N; },
    
    // Abstract
    // Indicates if a given value is an "instance of" this type.
    is: function(o) { return F; }
};
