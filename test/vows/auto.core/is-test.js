var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.is")
.addBatch({
    "detects instances of classes": {
        "object literal is an Object": function() {
            assert.isTrue(A.is({}, Object));
        },
        
        "string literal is not a String": function() {
            assert.isFalse(A.is("", String));
        },
        
        "a custom class instance is of its class": function() {
            function F(){}
            var f = new F();
            assert.isTrue(A.is(f, F));
        },
        
        "a custom sub-class instance is of its super-class": function() {
            function F(){}
            function G() {}
            G.prototype = new F();
            G.prototype.constructor = G;
            assert.isTrue(A.is(new G(), F));
        },
        
        "null is not an instance of Object": function() {
            assert.isFalse(A.is(null, Object));
        },
        
        "a null class throws a TypeError": function() {
            try {
                A.is({}, null);
                assert.isFalse(false);
            } catch(ex) {
                assert.isTrue(ex instanceof TypeError);
            }
        }
    }
})
.export(module);

