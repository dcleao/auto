var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.type shared")
.addBatch({
    "A shared property": {
        "can be defined and obtained through the constructor": function() {
            var Foo = A.type();

            var bar1 = {};
            Foo.shared().add({bar: bar1});

            assert.strictEqual(Foo.bar, bar1);
        },
        "can be defined and cannot be obtained through the instance": function() {
            var Foo = A.type();

            var bar1 = {};
            Foo.shared().add({bar: bar1});

            var foo = new Foo();

            assert.isUndefined(foo.bar);
            assert.isFalse(Object.prototype.hasOwnProperty.call(Foo.prototype, 'bar'));
        },
        "can be defined twice": {
            "generally, the last overrides the first": function() {
                var Foo = A.type();

                var bar1 = 1;
                var bar2 = 2;
                Foo.shared().add({bar: bar1}, {bar: bar2});

                assert.strictEqual(Foo.bar, bar2);
            },
            "a native object is merged with a second object": function() {
                var Foo = A.type();

                var bar1 = {};
                var bar2 = {a:1, b:2, c:3};
                
                Foo.shared().add({bar: bar1}, {bar: bar2});

                assert.strictEqual(Foo.bar, bar1);
                assert.strictEqual(Foo.bar.a, bar2.a);
                assert.strictEqual(Foo.bar.b, bar2.b);
                assert.strictEqual(Foo.bar.c, bar2.c);
            },
            "an inherited native object is localized and merged with a second object": function() {
                var bar1 = {};
                var Foo = A.type();
                Foo.shared().add({bar: bar1});

                var bar2 = {a:1, b:2, c:3};
                var Zas = Foo.type();
                Zas.shared().add({bar: bar2});

                assert.strictEqual(Object.getPrototypeOf(Zas.bar), bar1);
                
                assert.isTrue(Object.prototype.hasOwnProperty.call(Zas.bar, 'a'));
                assert.isTrue(Object.prototype.hasOwnProperty.call(Zas.bar, 'b'));
                assert.isTrue(Object.prototype.hasOwnProperty.call(Zas.bar, 'c'));
                
                assert.strictEqual(Zas.bar.a, bar2.a);
                assert.strictEqual(Zas.bar.b, bar2.b);
                assert.strictEqual(Zas.bar.c, bar2.c);
            },
            "a native object is replaced by a non-object": function() {
                var Foo = A.type();

                var bar1 = {};
                var bar2 = null;
                
                Foo.shared().add({bar: bar1}, {bar: bar2});

                assert.strictEqual(Foo.bar, bar2);
            }
        }
    }
})
.export(module);
