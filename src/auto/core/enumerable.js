
var IEble = A.IEnumerable = {enumerate: A.fun.constant(NEtor)};

// The null enumerable (obtain it by calling: A.enumerable())
var NEble = A.create(IEble);

// Make all IEtor.terminal methods directly available on enumerables.
// Obtain an enumerator and call the method.
var makeEbleCallsEtorMethod = function(p) {
    return function() {
        var etor = this.enumerate();
        return etor[p].apply(etor, arguments);
    };
};

A.each.own(IEtor.terminals, function(m, n) { IEble[n] = makeEbleCallsEtorMethod(n); });

// ------------

var EtorEble = F_extend(IEble, function(etor) {
  // We need to be able to enumerate multiple times.
  // Materialize it on first enumeration.
  var a;
  this.enumerate = function() {
    if(!a) { a = etor.array(); }
    return new ALEtor(a);
  };
});

var SingleEble = F_extend(IEble, function(v) {
  this.enumerate = function() { return new SingleEtor(v); };
});

var ALEble = F_extend(IEble, function(al) {
  this.enumerate = function() { return new ALEtor(al); };
});