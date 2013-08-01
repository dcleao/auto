
// Safe-Factory public-instance/private-property key
var TypeDef_key = _safeFactory().newProp();

var TypeDef_as = function(v) { return this.is(v) ? v : N; };

var TypeDef_to = function(define) {
    var _to, _is;

    // _ is the typeDef "instance"
    var _ = function() { return _to.apply(_, arguments); };
    
    define(_);

    _is = _.is || A.fail.oper.invalid("Type Definition without 'is' function.");
    _to = _.to; // tryConvertTo

    _.as = TypeDef_as.bind(_);

    if(!_.to) { _.to = _.as; }

    // Force id assignment

    O_id(_);
    
    TypeDef_key.init(_, _);

    return _;
};

var typeDef = A.typeDef = TypeDef_to(function(_) {
    _.to = TypeDef_to;
    _.is = function(v) { return !!v && TypeDef_key(v) === v; };
});