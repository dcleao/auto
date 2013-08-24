// no arguments -> NullEnumerable
// nully        -> an enumerable with the single value (if not desirable, test before)
// Eble         -> self
// Etor         -> a lazily materialized enumerable
// Array-like   -> ...
// Single item Eble

var toEble = A.enumerable = A.type.predicate(function(_) {
    return {
      to: function(v) {
          return !arguments.length                 ? NEble :

                 // An atom
                 (v == N || typeof v !== 'object') ? new SingleEble(v) :

                 A.fun.is(v.enumerate)             ? v :

                 // An array like
                 (v.length != N)                   ? new ALEble(v) :

                 // An Etor?
                 toEtor.is(v)                      ? new EtorEble(v) :

                 // An object atom
                new SingleEble(v);
      },
      
      // Has an "enumerate" method
      is: function(v) { return !!v && A.fun.is(v.enumerate); }
    };
});