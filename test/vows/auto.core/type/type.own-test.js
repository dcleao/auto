var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.type own")
.addBatch({
    "About the own Type": {
        "An instance's own type can be obtained": function() {
            var Foo = A.type();
            var foo = new Foo();

            // Obtain (creating if necessary) the instance's own type
            var OwnType = A.type(foo);

            assert.isNotNull(OwnType);
        },
        "An instance's own type inherits from the instance's original type": function() {
            var Foo = A.type();
            var foo = new Foo();

            var OwnType = A.type(foo);

            assert.isTrue(OwnType.inherits(Foo));
        },
        "An instance with an own type is still an instance of its original type": function() {
            var Foo = A.type();
            var foo = new Foo();

            A.type(foo);

            assert.instanceOf(foo, Foo);
        },
        "An instance with an own type is NOT an instance of its own type": function() {
            var Foo = A.type();
            var foo = new Foo();

            var OwnType = A.type(foo);

            assert.isFalse(foo instanceof OwnType);
        }
    },
    "About defining instance own methods": {
        "The original type's methods are still accessible": function() {
            var Foo = A.type().add({test: function() { return 1; }});
            var foo = new Foo();

            var OwnType = A.type(foo);

            assert.strictEqual(foo.test(), 1);
        },
        "The original type's methods are overriden by own methods": function() {
            var Foo = A.type().add({test: function() { return 1; }});
            
            var foo = new Foo();
            A.type(foo).add({test: function() { return this.base() + 2; }});

            assert.strictEqual(foo.test(), 3);
        },
        "The original type's methods are unaffected by its instances' own methods": function() {
            var Foo = A.type().add({test: function() { }});
            
            var foo1 = new Foo();

            A.type(foo1).add({test1: function() { }});

            var foo2 = new Foo();
            assert.isUndefined(foo2.test1);
        }
    },
    "About mixing types into an instance": {
        // Instances ignore mixin's init/post, cause they're already built....
        // But what about dispose?
        "An instance can be mixed with types whether or not they're in its original type": function() {
            var Foo = A.type().add({test: function() { return 1; }});
            
            var Bar = A.type().add({test: function() { return 2 + this.base(); }});

            var foo = new Foo();

            // Mixin Bar in foo
            A.type(foo).add(Bar);

            assert.strictEqual(foo.test(), 3);
            assert.isTrue(A.is(foo, Foo));
            assert.isTrue(A.is(foo, Bar));
            assert.isFalse(Foo.inherits(Bar));
            assert.isFalse(Bar.inherits(Foo));
        }
    }
})
.export(module);
