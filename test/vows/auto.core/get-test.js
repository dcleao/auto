var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.get")
.addBatch({
    "The default value": {
        "is returned when": {
            topic: {},
            
            "the source is nully": function(dv) {
                assert.strictEqual(A.get(null, 'toString', dv), dv);
                assert.strictEqual(A.get(undefined, 'toString', dv), dv);
            },
            
            "a property doesn't exist, locally or on any parent object": function(dv) {
                assert.strictEqual(A.get({}, 'b', dv), dv);
            }
        },
        
        "is the value _undefined_ by default": function() {
            assert.isUndefined(A.get(null, 'toString'));
        }
    },
    
    "A falsy property value": {
        topic: [false, null, undefined, NaN, 0, ""],
        
        "is returned, nonetheless": function(falsies) {
            var dv = {};
            falsies.forEach(function(falsy) {
                if(isNaN(falsy)) {
                    assert.isTrue(isNaN(A.get({p: falsy}, 'p', dv)));
                } else {
                    assert.strictEqual(A.get({p: falsy}, 'p', dv), falsy);
                }
            });
        }
    },
    
    "A property value": {
        topic: {},
        "is returned when": {
            "the property is local": function(value) {
                var o = {p: value};
                assert.strictEqual(A.get(o, 'p'), value);
            },
            
            "the property is inherited": function(value) {
                var o = {p: value};
                var o2 = Object.create(o);
                assert.strictEqual(A.get(o2, 'p'), value);
            }
        }
    }
})
.export(module);
