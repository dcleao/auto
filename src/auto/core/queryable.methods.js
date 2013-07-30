
// ~~~~ CHILD ENUMERATORS ***CONSTRUCTORS*** ~~~~
var ChildEtor = {
    where: function(s, p, x) {
        var me = this;
        var i  = -1;
        me.parent = s;
        me.next   = function() {
            while(s.next()) {
                var e = s.item;
                if(p.call(x, e, s.index)) {
                    me.item  = e;
                    me.index = ++i;
                    return T;
                }
            }
            me.dispose();
            return F;
        };
    },
    
    select: function(s, f, x) { 
        var me = this;
        var i  = -1;
        me.parent = s;
        me.next   = function() {
            if(s.next()) {
                me.item  = f.call(x, s.item, s.index);
                me.index = ++i;
                return T;
            }
            me.dispose();
            return F;
        };
    },
    
    selectMany: function(s, f, x) { 
         var me = this;
         var i  = -1;
         var innerEtor; // Current inner enumerator;
         me.parent = s;
         me.next   = function() {
             while(T) {
                 // Consume all of existing manySource
                 if(innerEtor) {
                     if(innerEtor.next()) {
                         me.item  = innerEtor.item;
                         me.index = ++i; 
                         return 1;
                     }
                     
                     innerEtor = N;
                 }
                 
                 // Next inner enumerator
                 while(s.next()) {
                     innerEtor = f ? f.call(x, s.item, s.index) : s.item;
                     if(innerEtor != N) {
                         innerEtor = toEtor(innerEtor);
                         if(innerEtor.next()) {
                             me.item  = innerEtor.item;
                             me.innerIndex = innerEtor.index;
                             me.index = ++i; 
                             return T;
                         }
                         break; // end
                     }
                     // ignore null values
                 } // while
                 break;
             }
             me.dispose();
             return F;
         };
    },
    
    concat: function(/*other_queryables*/) {
        var qbles = A.array.append([this], arguments);
        ChildEtor.selectMany.apply(this, qbles);
    },
    
    // whayl
    takeWhile: function(s, p, x) {
        var me = this;
        var i  = -1;
        me.parent = s;
        me.next   = function() {
            while(s.next()) {
                var e = s.item;
                if(p.call(x, e, s.index)) {
                    me.item  = e;
                    me.index = ++i;
                    return T;
                }
            }
            me.dispose();
            return F;
        };
    },
    
    skipWhile: function(s, p, x) {
        var me = this;
        var i  = -1;
        me.parent = s;
        me.next   = function() {
            while(s.next()) {
                var e = s.item;
                if(p) {
                    if(!p.call(x, e, s.index)) {
                        continue;
                    }
                    p = N;
                }
                
                me.item  = e;
                me.index = ++i;
                return T;
            }
            me.dispose();
            return F;
        };
    },
    
    // n != null && n > 0 && isFinite(n)
    take: function(s, n) {
        ChildEtor.takeWhile.call(this, s, function(v, i) { return i < n; }); 
    },
    
    // n != null && n > 0 && isFinite(n)
    skip: function(s, n) {
        ChildEtor.skipWhile.call(this, s, function(v, i) { return i < n; }); 
    },
    
    distinct: function(s, k, x) {
        var me = this;
        var i  = -1;
        var ks = {};
        me.parent = s;
        me.next   = function() {
            while(s.next()) {
                // null key items are ignored!
                var e = s.item;
                var v = ks ? ks.call(x, e, s.index) : e;
                if(v != N && !Op_hasOwn.call(ks, v)) {
                    me.item  = e;
                    me.index = ++i;
                    return (ks[v] = T);
                }
            }
            me.dispose();
            return F;
        };
    },
    
    reverse: function(s) {
        var me = this;
        var i  = -1;
        var I;
        me.parent = s; // already disposed now... index and item are now insignificant
        me.next   = function() {
            if(i < 0) {
                // Materialize
                // TODO: detect ArrayLike source, to avoid copy
                s = s.array();
                // "s" is already disposed now, so parent.index and parent.item are not useful
                I = s.length;
            }
            
            while(++i < I) {
                var j = I - 1 - i;
                if(Op_hasOwn.call(s, j)) {
                    me.index = i;
                    me.item  = s[j];
                    return T;
                }
            }
            me.dispose();
            return F;
        };
    },
    
    sort: function(s, cmp) {
        var me = this;
        var i  = -1;
        var I;
        me.parent = s;
        me.next   = function() {
            if(i < 0) {
                // Materialize
                // The copy is for not modifying s.
                s = s.array().sort(cmp || A.compare); 
                // "s" is already disposed now, so parent.index and parent.item are not useful
                I = s.length;
            }
            // Just like array-like enumeration
            while(++i < I) {
                if(Op_hasOwn.call(s, i)) {
                    me.index = i;
                    me.item  = s[i];
                    return T;
                }
            }
            me.dispose();
            return F;
        };
    }
};

// Make ChildEtor constructors inherit from IEtor.
A.each.own(ChildEtor, function(ctor) { F_extend(IEtor, ctor); });

// Create IQble methods for each of the Etor constructors (except a few custom ones)
/* Example "standard" IQble method.
IQble.where = function(p, x) {
    return new ChildQ(this, function(src) { return new ChildEtor[p](src, p, x); });
};
*/

var createQbleMethod = function(EtorClass) {
    // The difference here is due to dealing with a variable number of arguments.
    return function(/* ... */) {
        var args = Ap_slice.call(arguments);
        return new ChildQ(this, function(src) {
            return A.make(EtorClass, A.array.append([src], args));
        });
    };
};

// "newChildEtor" is a function that receives the parent enumerator,
// obtained from parentEble, 
// wraps it with custom logic and returns a new enumerator.
var ChildQ = F_extend(IQble, function(parentEble, newChildEtor) {
    this.enumerate = function() { return newChildEtor(parentEble.enumerate()); };
});

A.each.own(ChildEtor, function(ctor, p) {
    switch(p) {
        // These methods are more elaborate than
        // the default method implementation
        case 'skip':
        case 'take': return;
    }
    
    IQble[p] = createQbleMethod(ChildEtor[p]);
});

IQble.take = function(n) {
    return n == N || n <= 0 ? NQble : // take none
           !isFinite(n)     ? this  : // take all
           new ChildQ(this, function(s) { return new ChildEtor.take(s, n); });
};

IQble.skip = function(n) {
   return n == N || n <= 0 ? this  : // skip none
          !isFinite(n)     ? NQble : // skip all
          new ChildQ(this, function(s) { return new ChildEtor.skip(s, n); });
};
