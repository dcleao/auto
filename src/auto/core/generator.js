
// TODO: Should an enumerable of generators be possible?
// The sequence would start over on each enumerate?

var IGen = A.IGenerator = { 
    gen: function(count) { return new GenEtor(this, count); } 
};

// An Enumerator that enumerates (the next) _count_ items of a generator instance
var GenEtor = F_extend(IEtor, function(gen, count) {
    if(count == N) { count = Infinity; }
    var me = this;
    var i  = -1;
    me.next = function() {
        if(++i < count) {
            me.item  = gen();
            me.index = i;
            return T;
        }
        me.dispose();
        return F;
    };
    me.count = function() { return count - 1 - i; };
});

// Extends a function to "become" a generator
var gtor = function(g) { return A.copy.own(g, IGen); };
