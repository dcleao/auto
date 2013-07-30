var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.queryable.is")
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