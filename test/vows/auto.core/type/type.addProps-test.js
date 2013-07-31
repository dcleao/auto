var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.type.add properties")
.addBatch({
    "Calling add": {
        "with no arguments": function() {
            var Foo = A.type();
            Foo.add();
        },
        "with an empty object literal": function() {
            var Foo = A.type();
            Foo.add({});
        },
        "with an object literal with one function": {
            "works": function() {
                var Foo = A.type();
                Foo.add({
                    bar: function() {}
                });
            },
            "it is placed in the type's prototype": function() {
                var Foo = A.type();
                var bar = function() {};
                Foo.add({bar: bar});
                assert.isTrue(Object.prototype.hasOwnProperty.call(Foo.prototype, 'bar'));
                assert.strictEqual(Foo.prototype.bar, bar);
            },
            "it is accessible from an instance": function() {
                var Foo = A.type();
                var bar = function() {};
                Foo.add({bar: bar});
                assert.strictEqual(new Foo().bar, bar);
            },
            "that when executing, calling base, returns undefined": function() {
                var Foo = A.type();
                Foo.add({bar: function() { assert.isUndefined(this.base()); }});

                new Foo().bar();
            }
        },
        "with an object literal with one non-function property": {
            "works": function() {
                var Foo = A.type();
                Foo.add({
                    bar: {}
                });
            },
            "its value is placed in the type's prototype": function() {
                var Foo = A.type();
                var bar = {};
                Foo.add({bar: bar});
                assert.isTrue(Object.prototype.hasOwnProperty.call(Foo.prototype, 'bar'));
                assert.strictEqual(Foo.prototype.bar, bar);
            },
            "it is accessible from an instance": function() {
                var Foo = A.type();
                var bar = {};
                Foo.add({bar: bar});
                assert.strictEqual(new Foo().bar, bar);
            }
        },
        "with an object literal with a property named `base`, the property is ignored": function() {
            var Foo = A.type().add({base: 1});
            assert.isFalse(Object.prototype.hasOwnProperty.call(Foo.prototype, 'base'));
        },
        "with an object literal with a property named `constructor`, the property is ignored": function() {
            var Foo = A.type().add({constructor: 1});
            assert.instanceOf(Foo.prototype, A.Abstract);
        },
        "with an object literal with a property that holds the Auto ID, that property is ignored": function() {
            var props = {};
            var id   = A.id(props);
            assert.isNotNull(props[A.PROP_ID]);

            var Foo  = A.type().add(props);
            var Foop = Foo.prototype;

            assert.isFalse(Object.prototype.hasOwnProperty.call(Foop, A.PROP_ID));
        },
        "with more than one object literal": {
            "works": function() {
                var Foo = A.type();
                Foo.add({}, {});
            },
            "all their values are placed in the type's prototype": function() {
                var Foo = A.type();
                var bar = {};
                var guu = {};
                var zas = {};
                Foo.add({bar: bar}, {guu: guu, zas: zas});
                
                assert.isTrue(Object.prototype.hasOwnProperty.call(Foo.prototype, 'bar'));
                assert.isTrue(Object.prototype.hasOwnProperty.call(Foo.prototype, 'guu'));
                assert.isTrue(Object.prototype.hasOwnProperty.call(Foo.prototype, 'zas'));
                assert.strictEqual(Foo.prototype.bar, bar);
                assert.strictEqual(Foo.prototype.guu, guu);
                assert.strictEqual(Foo.prototype.zas, zas);
            },
            "all their values are accessible from an instance": function() {
                var Foo = A.type();
                var bar = {};
                var guu = {};
                var zas = {};
                Foo.add({bar: bar}, {guu: guu, zas: zas});

                assert.strictEqual(new Foo().bar, bar);
                assert.strictEqual(new Foo().guu, guu);
                assert.strictEqual(new Foo().zas, zas);
            },
            "with properties of equal name": {
                "and non-function and non-native-object value, the last wins": function() {
                    var Foo = A.type();
                    var bar1 = 1;
                    var bar2 = 2;
                    Foo.add({bar: bar1}, {bar: bar2});

                    assert.strictEqual(new Foo().bar, bar2);
                },
                "an existing native-object is merged with an object": function() {
                    var Foo = A.type();
                    var bar1 = {};
                    var bar2 = [1, 2, 3]; // an object, but not a native object Object
                    Foo.add({bar: bar1}, {bar: bar2});

                    var barz = Foo.prototype.bar;
                    assert.strictEqual(barz, bar1);
                    assert.strictEqual(barz[0], bar2[0]);
                    assert.strictEqual(barz[1], bar2[1]);
                    assert.strictEqual(barz[2], bar2[2]);
                },
                "an existing inherited native-object is first localized before merging with an object": function() {
                    var bar1 = {};
                    var bar2 = [1, 2, 3]; // an object, but not a native object Object
                    var Foo = A.type().add({bar: bar1});
                    var Zas = Foo.type().add({bar: bar2});
                    
                    var barz = Zas.prototype.bar;
                    assert.notStrictEqual(barz, bar1);
                    assert.notStrictEqual(barz, bar2);
                    assert.strictEqual(Object.getPrototypeOf(barz), bar1);

                    assert.strictEqual(barz[0], bar2[0]);
                    assert.strictEqual(barz[1], bar2[1]);
                    assert.strictEqual(barz[2], bar2[2]);

                    assert.isTrue(Object.prototype.hasOwnProperty.call(barz, '0'));
                    assert.isTrue(Object.prototype.hasOwnProperty.call(barz, '1'));
                    assert.isTrue(Object.prototype.hasOwnProperty.call(barz, '2'));
                },
                "an existing not-a-native-object is replaced by the new value": function() {
                    var Foo = A.type();
                    var bar1 = [1, 2, 3];
                    var bar2 = {};
                    Foo.add({bar: bar1}, {bar: bar2});

                    var barz = Foo.prototype.bar;
                    assert.strictEqual(barz, bar2);
                    assert.isUndefined(barz[0]);
                    assert.isUndefined(barz[1]);
                    assert.isUndefined(barz[2]);
                },
                "of function value, the second replaces the first": function() {
                    var Foo = A.type();
                    var res1 = {};
                    var res2 = {};
                    var bar1 = function() { return res1; };
                    var bar2 = function() { return res2; };
                    Foo.add({bar: bar1}, {bar: bar2});

                    assert.strictEqual(new Foo().bar(), res2);
                },
                "of function value, the second overrides the first, which is callable trough `base`": function() {
                    var Foo = A.type();
                    var res1 = 1;
                    var res2 = 2;
                    var bar1 = function() { return res1; };
                    var bar2 = function() { return res2 + this.base(); };
                    Foo.add({bar: bar1}, {bar: bar2});

                    assert.strictEqual(new Foo().bar(), res1 + res2);
                },
                "of function value, the third overrides the second, and the second overrides the first": function() {
                    var Foo = A.type();
                    var res1 = 1;
                    var res2 = 2;
                    var res3 = 3;
                    var bar1 = function() { return res1; };
                    var bar2 = function() { 
                        assert.strictEqual(this.base, bar1);
                        return res2 + this.base(); 
                    };
                    var bar3 = function() {
                        assert.notStrictEqual(this.base, bar2);
                        return res3 + this.base(); 
                    };
                    Foo.add({bar: bar1}, {bar: bar2}, {bar: bar3});

                    assert.strictEqual(new Foo().bar(), res1 + res2 + res3);
                }
            },
            "with a method overriding a non-function value, the method wins": function() {
                var Foo = A.type();
                var bar1 = {};
                var bar2 = function() { 
                    assert.isUndefined(this.base());
                };

                Foo.add({bar: bar1}, {bar: bar2});

                assert.strictEqual(new Foo().bar, bar2);
                new Foo().bar();
            }
        }
    }
})
.export(module);
