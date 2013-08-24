var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.enumerator.is")
.addBatch({
    "An enumerator-like object": {
        topic: {index: -1, next: function() { return false; }},
        
        "is considered an enumerator": function(etor) {
            assert.isTrue(A.enumerator.is(etor));
        },
        
        "is convertible to an enumerator, itself": function(etor) {
            if(A.enumerator.is(etor)) {
                var etor2 = A.enumerator.as(etor);
                assert.strictEqual(etor2, etor);
            }
        }
    }
})
.export(module);

vows
.describe("A.enumerator")
.addBatch({
    "When called with no arguments": {
        "returns an enumerator": function() {
            var etor = A.enumerator();
            assert.isObject(etor);
            assert.isNotNull(etor.index);
            assert.typeOf(etor.next, 'function');
        },
        
        "returns an empty enumerator": function() {
            var etor = A.enumerator();
            assert.isFalse(etor.next());
        },
        
        "returns a reset enumerator": function() {
            var etor = A.enumerator();
            assert.strictEqual(etor.index, -1);
        }
    },
    
    "When called with a null value": {
        "returns a reset enumerator with one item, null": function() {
            var etor = A.enumerator(null);
            assert.isObject(etor);
            assert.strictEqual(etor.index, -1);
            assert.typeOf(etor.next, 'function');
            assert.isTrue(etor.next());
            assert.strictEqual(etor.item, null);
            assert.isFalse(etor.next());
        }
    },
    
    "When called with an undefined value": {
        "returns a reset enumerator with one item, undefined": function() {
            var etor = A.enumerator(undefined);
            assert.isObject(etor);
            assert.strictEqual(etor.index, -1);
            assert.typeOf(etor.next, 'function');
            assert.isTrue(etor.next());
            assert.strictEqual(etor.item, undefined);
            assert.isFalse(etor.next());
        }
    },
    
    "When called with an empty array argument": { 
        "returns a reset enumerator with no items": function() {
            var etor = A.enumerator([]);
            assert.isObject(etor);
            assert.strictEqual(etor.index, -1);
            assert.typeOf(etor.next, 'function');
            assert.isFalse(etor.next());
        }
    },
    
    "When called with an array argument with some items": {
        topic: [1, 2, 3],
        
        "it is converted to": {
            "an enumerator": function(a) {
                var etor = A.enumerator(a);
                assert.isTrue(A.enumerator.is(etor));
            },
            
            // TODO: This should go elsewhere...
            "that": {
                "can be enumerated with _next_": function(a) {
                    var etor = A.enumerator(a);
                    while(etor.next());
                },
        
                "enumerates the same values, in order": function(a) {
                    var etor = A.enumerator(a);
                    var index = 0;
                    while(etor.next()) {
                        assert.strictEqual(etor.index, index);
                        assert.strictEqual(etor.item,  a[index]);
                        
                        index++;
                    }
                    assert.strictEqual(index, a.length);
                }
            }
        }
    },
    
    "When called with an enumerable": {
        "returns the enumerator returned by it": function() {
            var etor0 = {};
            var eble  = {enumerate: function() { return etor0; }};
            var etor  = A.enumerator(eble);
            assert.strictEqual(etor, etor0);
        }
    }
})
.export(module);
