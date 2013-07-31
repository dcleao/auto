// No arguments -> NullEnumerator.
// nully -> an enumerator with the single value (if not desirable, test before)
// 
// Optimized for performance.
// Could also be coded using Eble/AL/Etor.is/as methods.
var toEtor = A.enumerator = typeDef(function(_) {
    _.to = function(v) {
        return !arguments.length                  ? NEtor :
               
               // An atom
               (v == N || typeof v !== 'object')  ? new SingleEtor(v) :

               // An enumerator
               (v.index != N && A.fun.is(v.next)) ? v :

               // An enumerable
               A.fun.is(v.enumerate)              ? v.enumerate() : // TODO: trust that result is actually a full-blow enumerator?

               // An array like
               (v.length != N)                    ? new ALEtor(v) :

               // An object atom
               new SingleEtor(v);
    };

    // Has a non nully "index" property and a "next" method
    _.is = function(v) { return v != N && v.index != N && A.fun.is(v.next); };
});