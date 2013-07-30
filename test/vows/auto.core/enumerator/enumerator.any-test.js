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
    "Using _any_": {
        
        "with no elements returns false": function() {
            var r = A.enumerator().any();
            
            assert.isFalse(r);
        },
        
        "with 1 element returns true": function() {
            var r = A.enumerator([false]).any();
            
            assert.isTrue(r);
        },
        
        "with 2 elements returns true": function() {
            var r = A.enumerator([false, false]).any();
            
            assert.isTrue(r);
        },
        
        "with a predicate": { 
            "and no elements, does not call the predicate": function() {
                var called = 0;
                var p = function() {called++;};
                var f = A.enumerator().any(p);
                
                assert.strictEqual(called, 0);
            },
            
            "with 1 element": {
                "the predicate is called once": function() {
                    var called = 0;
                    var p = function() {called++;};
                    A.enumerator([null]).any(p);
                    
                    assert.strictEqual(called, 1);
                },
                
                "that satisfies the predicate, true is returned": function() {
                    var secret = 4;
                    var p = function(e) { return e===secret};
                    var r = A.enumerator([4]).any(p);
                    
                    assert.isTrue(r);
                },
                
                "that does not satisfy the predicate, false is returned": function() {
                    var secret = 4;
                    var p = function(e) { return e===secret};
                    var r = A.enumerator([3]).any(p);
                    
                    assert.isFalse(r);
                }
            },
            
            "with 2 elements and only the second satisfies the predicate returns true": function() {
                var a = [1, 2];
                var p = function(e) { return e===a[1]; };
                var r = A.enumerator(a).any(p);
                assert.isTrue(r);
            },
            
            "with many elements and none satisfies the predicate, returns false":
            function() {
                var a = [1,2,3,4,5,6,7,8,9];
                var dv = {};
                var p = function(e) { return false; };
                var r = A.enumerator(a).any(p);
                assert.isFalse(r);
            },
            
            "with many elements and only the last satisfies the predicate, returns true":
            function() {
                var a = [1,2,3,4,5,6,7,8,9];
                var secret = a[a.length - 1];
                var p = function(e) { return e === secret; };
                var r = A.enumerator(a).any(p);
                assert.isTrue(r);
            },
            
            "the context object is passed to the predicate": function() {
                var a = [1];
                var x = {};
                var p = function(e) { assert.strictEqual(this, x); };
                A.enumerator(a).any(p, x);
            },
            
            "with many elements, the predicate is called only until the first time it returns true":
            function() {
                var a = [1,2,3,4,5,6,7,8,9];
                var count  = 5;
                var secret = a[count - 1];
                
                var actualCount = 0;
                var p = function(e) {
                    actualCount++;
                    return e === secret; 
                };
                A.enumerator(a).any(p);
                assert.strictEqual(actualCount, count);
            }
        }
    }
})
.export(module);
