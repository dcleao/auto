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
    "Using _count_": {
        topic: [1, 2, 3],
        
        "returns the number of elements": function(a) {
            var c = A.enumerator(a).count();
            
            assert.strictEqual(c, a.length);
        },
        
        "returns the number of elements remaining to enumerate": function(a) {
            var etor = A.enumerator(a);
            assert.isTrue(etor.next());
            var c = etor.count();
            
            assert.strictEqual(c, a.length - 1);
        },
        
        "returns 0 for an empty enumerator": function() {
            var c = A.enumerator([]).count();
            assert.strictEqual(c, 0);
        }
    }
})
.export(module);
