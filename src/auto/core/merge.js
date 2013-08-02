
// loadtime: 
// runtime:  base(Ap_slice, Op_hasOwn, O_create)
//           object(A.object.as, A.object.native.as)

A.merge = Merge_create(A.copy);

A.copy.own(A.merge, {
    copy:    A.merge,                  // 1- 1-Level copy protection
    inherit: Merge_create(O_create),   // 2- Inherit from source native object
    share:   Merge_create(A.identity), // 3- Not protected, shared
    custom:  Merge_create              // 4- Create a custom native object protection rule
});

function Merge_create(protectNatObj) {
    return function(to/*, from1, from2, ...*/) {
        return Merge_many(to, Ap_slice.call(arguments, 1), protectNatObj);
    };
}

function Merge_many(to, froms, protectNatObj) {
    for(var i = 0, L = froms.length ; i < L ; i++) {
        var from = froms[i];
        if(from) {
            from = A.object.as(from.prototype || from);

            if(from) { Merge_recursive(to, from, protectNatObj); }
        }
    }

    return to;
}

function Merge_recursive(to, from, protectNatObj) {
    for(var p in from) { Merge_prop(to, p, from[p], protectNatObj); }
}

function Merge_prop(to, p, vFrom, protectNatObj) {
    if(vFrom !== U) {
        var oFrom,
            oTo = A.object.native.as(to[p]);

        if(oTo) { // => oTo != N
            oFrom = A.object.as(vFrom);
            if(oFrom) {
                // If oTo is inherited, don't change it
                // Inherit from it and assign it locally.
                // It will be the target of the merge.
                if(!Op_hasOwn.call(to, p)) {
                    to[p] = oTo = O_create(oTo);
                }
                
                // Merge the two objects
                Merge_recursive(oTo, oFrom, protectNatObj);
            } else {
                // Overwrite oTo with a simple value
                to[p] = vFrom;
            }
        } else { 
            // Target will be overwritten.
            // Target property does not contain a native object.
            oFrom = A.object.native.as(vFrom);
            if(oFrom) {
                // Should vFrom be set directly in to[p] ?
                // Should we copy its properties into a fresh object ?
                // Should we inherit from it ?
                vFrom = (protectNatObj || O_create)(oFrom);
            }
            
            to[p] = vFrom;
        }
    }
}
