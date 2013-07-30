var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.object.create")
.addBatch({
    "When called with no arguments": {
        "returns an empty object": function() {
            var o = A.object.create();
            assert.isObject(o);
            assert.isEmpty(o);
        },
        
        "returns a new object each time": function() {
            var o1 = A.object.create();
            var o2 = A.object.create();
            assert.notStrictEqual(o1, o2);
        }
    },
    
    "When called with an object as first argument": {
        topic: {foo: 'bar'},
        
        "returns an object": function(sup) {
            var sub = A.object.create(sup);
            assert.isObject(sub);
        },
        
        "returns an object derived from the argument": function(sup) {
            var sub = A.object.create(sup);
            assert.strictEqual(Object.getPrototypeOf(sub), sup);
        },
        
        "returns an object with no own properties": function(sup) {
            var sub = A.object.create(sup);
            assert.equal(Object.keys(sub).length, 0);
        }
    },
    
    "When called with a function as first argument": {
        topic: function() { return function() { this.foo = 'bar'; }; },
        
        "returns an object": function(Sup) {
            var sub = A.object.create(Sup);
            assert.isObject(sub);
        },
        
        "returns an object which is an instance of the argument": function(Sup) {
            var sub = A.object.create(Sup);
            assert.instanceOf(sub, Sup);
        },
        
        "does not call the function": function(Sup) {
            var sub = A.object.create(Sup);
            assert.isTrue(!('foo' in sub));
        }
    },
    
    "When called with an object as second argument": {
        topic: function() {
            var o = {foo: 'bar', guru: undefined};
            var o2 = Object.create(o);
            o2.bar = 'foo';
            o2.baz = null;
            return o2;
        },
        
        "returns an object": {
            
            "containing all its not undefined properties as own": function(o2) {
                var sub = A.object.create({}, o2);
                for(var p in o2) {
                    var v = o2[p];
                    if(v !== undefined) {
                        assert.isTrue(sub.hasOwnProperty(p));
                        assert.strictEqual(sub[p], v);
                    }
                }
            },
        
            "that does not contain its undefined properties": function(o2) {
                var sub = A.object.create({}, o2);
                assert.isTrue(!('guru' in sub));
            },
            
            "that contains its null properties as own": function(o2) {
                var sub = A.object.create({}, o2);
                assert.isTrue(sub.hasOwnProperty('baz'));
                assert.isNull(sub.baz);
            },
            
            "whose same-named properties have been overwritten": function(o2) {
                var sub = A.object.create({foo: 'foo'}, o2);
                assert.strictEqual(sub.foo, 'bar');
            }
        }
    },
    
    "When called with a Function as second argument": {
        topic: function() {
            var F = function() {
                this.foo = 'foo';
            };
            
            F.prototype = {foo: 'bar', guru: undefined, bar: 'foo', baz: null};
            
            return F;
        },
        
        "returns an object containing all its prototype's not undefined properties as own": function(F) {
            var sub = A.object.create({}, F);
            var proto = F.prototype;
            for(var p in proto) {
                var v = proto[p];
                if(v !== undefined) {
                    assert.isTrue(sub.hasOwnProperty(p));
                    assert.strictEqual(sub[p], v);
                }
            }
        },
        
        "does not call the function": function() {
            var C = function() { assert.isFalse(false); }
            A.object.create({}, C);
        }
    }
})
.export(module);

