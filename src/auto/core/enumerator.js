
var IEtor = A.IEnumerator = A.create(ID, {
    index:  -1,
    item:   U,
    parent: N, // For nested/chained enumerators
    next:   F_false,
    dispose: function() {
        var me = this;
        if(me.index > -1) {
            me.next = F_false;
            //me.index = -1;
            delete me.index;
            var p = me.parent;
            
            delete me.item;
            delete me.parent;
            
            if(p) { p.dispose(); }
        }
    }
});

// The null enumerator (obtain it by calling: A.enumerator())
var NEtor = A.create(IEtor);

// -----------------

// Array Like Enumerator
var ALEtor = F_extend(IEtor, function(al) {
    al = AL(al);
    
    var me = this;
    var i  = -1;
    var I  = al.length;
    me.next = function() {
        while(++i < I) {
            if(Op_hasOwn.call(al, i)) {
                me.index = i;
                me.item  = al[i];
                return T;
            }
        }
        me.dispose();
        return F;
    };
    
    // TODO: these also must consume the enumerator!
    // More efficient than the default implementations
    // me.count = function() { return I - 1 - i; };

    // TODO: Must take i into account
    //me.array = function() { return Ap_slice.call(al); };
});

var SingleEtor = F_extend(IEtor, function(v) {
    var finished;
    var me = this;
    me.next = function() {
        if(!finished) {
            finished = true;
            me.index = 0;
            me.item  = v;
            return T;
        }
        me.dispose();
        return F;
    };
    
    // TODO: these also must consume the enumerator!
    // More efficient than the default implementations
    //me.count = function() { return finished ? 0 : 1; };

    // Must take i into account
    //me.array = function() { return [v]; };
});