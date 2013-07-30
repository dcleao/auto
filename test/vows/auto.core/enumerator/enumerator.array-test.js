var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.enumerator")
.addBatch({
    "Using _array_": {
        topic: [1, 2, 3],
        
        "we obtain an array": function(a) {
            var b = A.enumerator(a).array();
            assert.instanceOf(b, Array);
        },
        
        "we obtain an array with the same elements": function(a) {
            var b = A.enumerator(a).array();
            assert.deepEqual(a, b);
        },
        
        "we obtain a distinct array": function(a) {
            var b = A.enumerator(a).array();
            assert.notStrictEqual(a, b);
        }
    }
})
.export(module);
