var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

// TODO - these tests, well, were some of the first

vows
.describe("A.copy.own")
.addBatch({
    "copy own properties": {
        topic: function() {
            var sup = {a: 1, b: 2};
            var sub = Object.create(sup);
            sub.a = 3;
            sub.c = 4;
            sub.d = undefined; 
            sub.e = null;
            return sub;
        },
        
        "ignores inherited properties": function(sub) {
            assert.isFalse('b' in A.copy.own(sub));
        },
        
        "copies nully own properties": function(sub) {
            assert.isTrue('d' in A.copy.own(sub));
            assert.isTrue('e' in A.copy.own(sub));
        },
        
        "when dest is unspecified always returns a different object": function(sub) {
            var a = A.copy.own(sub);
            var b = A.copy.own(sub);
            var c = A.copy.own(sub);
            
            assert.notEqual(a, sub);
            assert.notEqual(b, sub);
            assert.notEqual(c, sub);
            assert.notEqual(a, b);
            assert.notEqual(b, c);
            assert.notEqual(a, c);
        }
    },
    
    "Returns an an empty object": {
        "when both source and dest are unspecified": function() {
            var r = A.copy.own();
            assert.isNotNull(r);
            assert.instanceOf(r, Object);
            assert.isEmpty(r);
        },
        
        "when source is null and dest is unspecified": function() {
            var r = A.copy.own(null);
            assert.isNotNull(r);
            assert.instanceOf(r, Object);
            assert.isEmpty(r);
        },
        
        "when source is null and dest is an empty object": function() {
            var r = A.copy.own({}, null);
            assert.isNotNull(r);
            assert.instanceOf(r, Object);
            assert.isEmpty(r);
        },
        
        "when source and dest are empty objects": function() {
            var r = A.copy.own({}, {});
            assert.isNotNull(r);
            assert.instanceOf(r, Object);
            assert.isEmpty(r);
        }
    },
    
    "copy own properties and the source object": {
        topic: function() { return {a: 1, b: 2}; },
        
        "source is not modified": function(source) {
            var dest = A.copy.own(source);
            var i = 0;
            for(var p in source) {
                i++;
                switch(p) {
                    case 'a': assert.equal(source[p], 1); break;
                    case 'b': assert.equal(source[p], 2); break;
                }
            }
            
            assert.equal(i, 2);
        }
    },
    
    "copy own properties and the dest object": {
        topic: function() { return {a: 1, b: 2}; },
        
        "dest argument is the return value": function(source) {
            var dest = {};
            var res = A.copy.own(dest, source);
            assert.equal(res, dest);
        }
    }
})
.export(module);
