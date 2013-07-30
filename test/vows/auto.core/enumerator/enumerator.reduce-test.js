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
    "Using _reduce_": {
        topic: [1, 2, 3],
        
        "with an empty sequence": { 
            "and no default value": function() {
                assert.throws(function() {
                    var f = function(){};
                    A.enumerator().reduce(f);
                }, Error);
            },
            
            "and a default value": {
                "does not throw an error": function() {
                    assert.doesNotThrow(function() {
                        var f = function(){};
                        A.enumerator().reduce(f, 1);
                    }, Error);
                },
                
                "does not call function": function() {
                    var called = false;
                    assert.doesNotThrow(function() {
                        var f = function(){called=true;};
                        A.enumerator().reduce(f, 1);
                    }, Error);
                    assert.isFalse(called);
                },
                
                "the result is the default value": function() {
                    var f = function(){};
                    var r = A.enumerator().reduce(f, 1);
                    
                    assert.strictEqual(r, 1);
                }
            }
        },
        
        "with a one-element sequence": {
            topic: [2],
            
            "and no default value": {
                "the result is the first element": function(a) {
                    var f = function(){};
                    var r = A.enumerator(a).reduce(f);
                    
                    assert.strictEqual(r, a[0]);
                },
                "does not call function": function(a) {
                    var called = false;
                    var f = function(){called=true;};
                    A.enumerator(a).reduce(f);
                    assert.isFalse(called);
                }
            },
            
            "and a default value": {
                "the function is called with the default value, the first element and 0, as arguments": function(a) {
                    var dv = {};
                    var arg1, arg2, arg3;
                    var f = function(a1, a2, a3){ arg1=a1; arg2=a2; arg3=a3;};
                    
                    A.enumerator(a).reduce(f, dv);
                    
                    assert.strictEqual(arg1, dv  );
                    assert.strictEqual(arg2, a[0]);
                    assert.strictEqual(arg3, 0   );
                }
            }
        },
        
        "with a two element sequence": {
            topic: [1,2],
            "and no default value": {
                "calls the funcion once": function(a) {
                    var called = 0;
                    var f = function() {called++;};
                    A.enumerator(a).reduce(f);
                    
                    assert.strictEqual(called, 1);
                },
                
                "the function receives the first element, the second element and 1 as arguments": function(a) {
                    var arg1, arg2, arg3;
                    
                    var f = function(a1, a2, a3){ arg1=a1; arg2=a2; arg3=a3;};
                    
                    A.enumerator(a).reduce(f);
                    
                    assert.strictEqual(arg1, a[0]);
                    assert.strictEqual(arg2, a[1]);
                    assert.strictEqual(arg3, 1);
                },
                
                "the result of the function is the overall result": function(a) {
                    var r0 = {};
                    var f  = function() { return r0; };
                    
                    var r = A.enumerator(a).reduce(f);
                    
                    assert.strictEqual(r, r0);
                }
            },
            
            "and a default value": {
                "the function is called twice": function(a) {
                    var dv = {};
                    var count = 0;
                    var f = function(){ count++; };
                    
                    A.enumerator(a).reduce(f, dv);
                    
                    assert.strictEqual(count, 2);
                }
            }
        },
        
        "with a more than 2 element sequence": {
            topic: [1,2,3,4,5,6,7,8],
            
            "the function receives the previous result as first argument": function(a) {
                var prev; 
                var first = true;
                
                var f = function(prevr, e) {
                    var r = prevr + e;
                    if(first) {
                        first = false;
                    } else {
                        assert.strictEqual(prevr, prev);
                    }
                    prev = r;
                    return r;
                };
                
                A.enumerator(a).reduce(f);
            },
            
            "the function is called one time less that the number of elements": function(a) {
                var count = 0; 
                var f = function(r, e) {
                    count++;
                    return r + e;
                };
                
                A.enumerator(a).reduce(f);
                
                assert.strictEqual(count, a.length - 1);
            },
            
            "if the function is _add_ the result is the sum of all elements": function(a) {
                var sum = 0;
                for(var i = 0 ; i < a.length ; i++) { sum += a[i]; }
                
                var add = function(a,b) { return a + b; };
                
                var r = A.enumerator(a).reduce(add);
                
                assert.strictEqual(r, sum);
            }
        },

        "the function is called in the global JS context": function() {
            var a = [1, 2];
            var global = (function() { return this; }());
            var f  = function() { assert.strictEqual(this, global); };
            A.enumerator(a).reduce(f);
        }
    }
})
.export(module);
