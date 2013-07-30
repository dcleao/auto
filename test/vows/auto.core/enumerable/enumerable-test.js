var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.enumerable.is")
.addBatch({
    "An enumerable-like object": {
        topic: {enumerate: function() { return false; }},
        
        "is considered an enumerable": function(eble) {
            assert.isTrue(A.enumerable.is(eble));
        },
        
        "is convertible to an enumerable, itself": function(eble) {
            if(A.enumerable.is(eble)) {
                var eble2 = A.enumerable.as(eble);
                assert.strictEqual(eble2, eble);
            }
        }
    }
})
.export(module);

vows
.describe("A.enumerable")
.addBatch({
    "When called with no arguments": {
        "returns an enumerable": function() {
            var eble = A.enumerable();
            assert.isTrue(A.enumerable.is(eble));
        },
        
        "returns an empty enumerable": function() {
            var eble = A.enumerable();
            var etor = eble.enumerate();
            assert.isTrue(A.enumerator.is(etor));
            assert.isFalse(etor.next());
        }
    },
    
    "When called with a null value": {
        "returns an enumerable with one null item": function() {
            var eble = A.enumerable(null);
            var etor = eble.enumerate();
            assert.isTrue(A.enumerator.is(etor));
            assert.isTrue(etor.next());
            assert.strictEqual(etor.item, null);
            assert.isFalse(etor.next());
        }
    },
    
    "When called with an undefined value": {
        "returns a reset enumerator with one undefined item": function() {
            var eble = A.enumerable(undefined);
            var etor = eble.enumerate();
            assert.isTrue(A.enumerator.is(etor));
            assert.isTrue(etor.next());
            assert.strictEqual(etor.item, undefined);
            assert.isFalse(etor.next());
        }
    },
    
    "When called with an empty array argument": { 
        "returns an empty enumerator": function() {
            var eble = A.enumerable([]);
            var etor = eble.enumerate();
            assert.isTrue(A.enumerator.is(etor));
            assert.isFalse(etor.next());
        }
    },
    
    "When called with an array argument with some items": {
        topic: [1, 2, 3],
        
        "it is converted to an enumerable": function(a) {
            var eble = A.enumerable(a);
            var etor = eble.enumerate();
            assert.isTrue(A.enumerator.is(etor));
        },
            
        "that enumerates the same values, in order": function(a) {
            var eble = A.enumerable(a);
            var etor = eble.enumerate();
            
            var index = 0;
            while(etor.next()) {
                assert.strictEqual(etor.index, index);
                assert.strictEqual(etor.item,  a[index]);
                
                index++;
            }
            assert.strictEqual(index, a.length);
        }
    }
})
.export(module);

vows
.describe("A.enumerable")
.addBatch({
    "An enumerable-like object": {
        topic: [1, 2],
        
        "has all enumerator terminal methods": function(a) {
            var eble = A.enumerable(a)
            assert.typeOf(eble.each,   'function');
            assert.typeOf(eble.all,    'function');
            assert.typeOf(eble.any,    'function');
            assert.typeOf(eble.apply,  'function');
            assert.typeOf(eble.array,  'function');
            assert.typeOf(eble.call,   'function');
            assert.typeOf(eble.count,  'function');
            assert.typeOf(eble.first,  'function');
            assert.typeOf(eble.last,   'function');
            assert.typeOf(eble.min,    'function');
            assert.typeOf(eble.max,    'function');
            assert.typeOf(eble.reduce, 'function');
            assert.typeOf(eble.sum,    'function');
        }
    }
})
.export(module);
