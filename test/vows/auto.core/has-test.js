var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.has")
.addBatch({
    "Detects properties of objects": {
        "an object _has_ its own properties": function() {
            assert.strictEqual(A.has({f: null}, 'f'), true);
        },
        
        "an object _has_ the inherited properties": function() {
            var o = Object.create({f: null});
            assert.isTrue(A.has(o, 'f'));
        },
        
        "a nully object _has_ no properties": function() {
            assert.isFalse(A.has(null,      'toString'));
            assert.isFalse(A.has(undefined, 'toString'));
        },
        
        "a object _has_ its Object inherited properties": function() {
            assert.isTrue(A.has({}, 'toString'));
        },
        
        "a non-object and non-nully source": {
            topic: [false, NaN, 0, ""],
            
            "throws TypeError": function(falsies) {
                falsies.forEach(function(falsy) {
                    assert.throws(
                         function() { A.has(falsy, 'toString'); }, 
                         TypeError);
                });
            }
        },
        
        "the property name argument is first passed through String": function() {
            var p = {toString: function() { return 'foo'; }};
            var o = {'foo':  null};
            
            assert.isTrue(A.has(o, p));
            
            assert.isTrue(A.has({'null': null}, null));
        }
    }
})
.export(module);
