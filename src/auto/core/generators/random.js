
// Creates a random number generator.
// Generates numbers between i and f (exclusive).
A.random = function(i, f) {
    if(i == N) { i = 0; }
    if(f == N) { f = 1; }
    var d = f - i;
    return gtor(function() { return i + d * M.random(); });
};
