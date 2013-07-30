
// Creates a sequential number generator.
A.sequence = A.seq = function(next, step) {
    if(next == N) { next = 0; }
    if(step == N) { step = 1; }
    return gtor(function() {
        var v = next;
        next += step;
        return v;
    });
};
