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
    "Using _sum_": {
        
        "with no elements returns null": function() {
            var s = A.enumerator().sum();
            
            assert.isNull(s);
        },
        
        "with 1 element, returns it": function() {
            var s = A.enumerator([200]).sum();
            
            assert.strictEqual(s, 200);
        },
        
        "sums the elements": function() {
            var a = [1,2,3,4,5,6,7,8];
            var sum = 0;
            for(var i = 0 ; i < a.length ; i++) { sum += a[i]; }
            
            var s = A.enumerator(a).sum();
            assert.strictEqual(s, sum);
        }
    }
})
.export(module);
