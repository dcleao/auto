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
    "Using _first_": {
        
        "with no elements and no default value returns undefined": function() {
            var f = A.enumerator().first();
            
            assert.isUndefined(f);
        },
        
        "with no elements and a default value returns the default value": function() {
            var dv = {};
            var f = A.enumerator().first(null, dv);
            
            assert.strictEqual(f, dv);
        },
        
        "with 1 element returns it": function() {
            var f = A.enumerator([1]).first();
            
            assert.strictEqual(f, 1);
        },
        
        "with 2 elements returns the first": function() {
            var f = A.enumerator([1, 2]).first();
            
            assert.strictEqual(f, 1);
        },
        
        "with many elements returns the first": function() {
            var f = A.enumerator([1,2,3,4,5,6,7,8,9]).first();
            
            assert.strictEqual(f, 1);
        },
        
        "with a predicate function": {
            "and no elements, does not call the predicate": function() {
                var called = 0;
                var p = function() {called++;};
                var f = A.enumerator().first(p);
                
                assert.strictEqual(called, 0);
            },
            
            "with 1 element": {
                "the predicate is called once": function() {
                    var called = 0;
                    var p = function() {called++;};
                    A.enumerator([null]).first(p);
                    
                    assert.strictEqual(called, 1);
                },
                
                "that satisfies the predicate, the element is returned": function() {
                    var secret = 4;
                    var p = function(e) { return e===secret};
                    var r = A.enumerator([4]).first(p);
                    
                    assert.strictEqual(r, secret);
                },
                
                "that does not satisfy the predicate": {
                    "and no default value, undefined is returned": function() {
                        var secret = 4;
                        var p = function(e) { return e===secret};
                        var r = A.enumerator([3]).first(p);
                        
                        assert.isUndefined(r);
                    },
                    "and a default value, the default value is returned": function() {
                        var secret = 4;
                        var dv = 5;
                        var p = function(e) { return e===secret};
                        var r = A.enumerator([3]).first(p, dv);
                        
                        assert.strictEqual(r, dv);
                    }
                }
            },
            
            "with 2 elements and only the second satisfies the predicate, returns the second": function() {
                var a = [1, 2];
                var p = function(e) { return e===a[1]; };
                var f = A.enumerator(a).first(p);
                assert.strictEqual(f, a[1]);
            },
            
            "with many elements and a default value and none satisfies the predicate, the default value is returned":
            function() {
                var a = [1,2,3,4,5,6,7,8,9];
                var dv = {};
                var p = function(e) { return false; };
                var f = A.enumerator(a).first(p, dv);
                assert.strictEqual(f, dv);
            },
            
            "with many elements, returns the first that satisfies the predicate":
            function() {
                var a = [1,2,3,4,5,6,7,8,9];
                var secret = a[5];
                var p = function(e) { return e === secret; };
                var f = A.enumerator(a).first(p);
                assert.strictEqual(f, secret);
            },
            
            "the context object is passed to the predicate": function() {
                var a = [1];
                var x = {};
                var p = function(e) { assert.strictEqual(this, x); };
                A.enumerator(a).first(p, undefined, x);
            }
        }
    }
})
.export(module);
