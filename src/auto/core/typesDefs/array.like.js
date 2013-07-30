
// no arguments, null or undefined are converted to [null] or [undefined]
var AL = A.array.like = typeDef(function(_) {
	_.to = function(v) { return AL.is(v) ? v : [v]; };
    _.is = function(v) { return v != N && v.length != N && typeof v !== 'string'; };
});