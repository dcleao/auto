var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.enumerable")
.addBatch({
    "Using _each_": {
        topic: [1, 2, 3],
        
        "the function is called as many times as there are elements": function(a) {
            var j = 0;
            A.enumerable(a).each(function(v, i) { j++; });
            
            assert.strictEqual(j, a.length);
        },
        
        "an item is passed to the function only once": function(a) {
            var seen  = [];
            A.enumerable(a).each(function(v, i) {
                assert.isFalse(i in seen);
            });
        },
        
        "every item is called": function(a) {
            var dict = {};
            a.forEach(function(v, i){ dict[i] = v; });
            
            assert.isNotEmpty(dict);
            
            A.enumerable(a).each(function(v, i) { delete dict[i]; });
            
            assert.isEmpty(dict);
        },
        
        "items are called in the same order": function(a) {
            var j = 0;
            A.enumerable(a).each(function(v, i) { 
                assert.strictEqual(i, j);
                j++;
            });
        },
        
        "the context argument is passed in every call": function(a) {
            var x = {};
            A.enumerable(a).each(function(v, i) { 
                assert.strictEqual(this, x);
            }, x);
        }
    }
})
.export(module);
