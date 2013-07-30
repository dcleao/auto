var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

var I = function(value) { this.value = value; }

vows
.describe("A.enumerator")
.addBatch({
    "Using _apply_": {
        
        "the method is called as many times as it is defined": function() {
            var count = 0;
            var o = {method: function() { count++; }};
            
            var a = [o, o, null, o, {}];
            
            A.enumerator(a).apply('method');
            
            assert.strictEqual(count, 3);
        },
        
        "each instance's method is called exactly once": function(a) {
            var F = function(){};
            F.prototype = {count: 0, method: function() { this.count++; }};
            
            var a = [new F(), new F(), new F()];
            
            A.enumerator(a).apply('method');
            
            assert.strictEqual(a[0].count, 1);
            assert.strictEqual(a[1].count, 1);
            assert.strictEqual(a[2].count, 1);
        },
        
        "instance's method are called in order": function() {
            var index = 0;
            
            var F = function() {};
            F.prototype = {index: -1, method: function() { this.index = index++; }};
            
            var a = [new F(), new F(), new F()];
            
            A.enumerator(a).apply('method');
            assert.strictEqual(a[0].index, 0);
            assert.strictEqual(a[1].index, 1);
            assert.strictEqual(a[2].index, 2);
        },
        
        "instance's methods are called with instance as the JS context": function() {
            var F = function() {};
            F.prototype = {instance: null, method: function() { this.instance = this; }};
            
            var a = [new F(), new F(), new F()];
            
            A.enumerator(a).apply('method');
            assert.strictEqual(a[0].instance, a[0]);
            assert.strictEqual(a[1].instance, a[1]);
            assert.strictEqual(a[2].instance, a[2]);
        },
        
        "instance's methods are called with the additional static arguments": function() {
            var args = [1, 2, 3];
            
            var F = function() {};
            F.prototype = {
                method: function(a1, a2, a3) { 
                    assert.strictEqual(a1, args[0]);
                    assert.strictEqual(a2, args[1]);
                    assert.strictEqual(a3, args[2]);
                    assert.strictEqual(arguments.length, args.length);
                }
            };
            
            var a = [new F(), new F(), new F()];
            
            A.enumerator(a).apply('method', args);
        }
    }
})
.export(module);
