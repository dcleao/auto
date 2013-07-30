var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.type.add types")
.addBatch({
    "Calling add": {
        "with a type": {
            "works": function() {
                var Bar = A.type();
                var Foo = A.type().add(Bar);
            },
            "its instances": {
                "are instances of the mixin-type as well, according to A.is": function() {
                    var Bar = A.type();
                    var Foo = A.type().add(Bar);

                    assert.isTrue(A.is(new Foo(), Foo));
                    assert.isTrue(A.is(new Foo(), Bar));
                },
                "are instances of the type, the base type and of the mixed type, according to A.is": function() {
                    var AAA = A.type();
                    var BBB = AAA.type();

                    var CCC = A.type();
                    AAA.add(CCC);

                    assert.isTrue(A.is(new BBB(), BBB));
                    assert.isTrue(A.is(new BBB(), AAA));
                    assert.isTrue(A.is(new BBB(), CCC));
                }
            },
            "its properties": {
                "are placed in the receiving type's prototype": function() {
                    var bar1 = function() {};
                    var Bar = A.type()
                        .add({bar: bar1});

                    var Foo = A.type().add(Bar);

                    assert.isTrue(Object.prototype.hasOwnProperty.call(Foo.prototype, 'bar'));
                    assert.strictEqual(Foo.prototype.bar, bar1);
                }
            },
            "its `init` and `post`": {
                "are called after the receiving type's ones": function() {
                    var id = 0;
                    var idAInit, idAPost, idBInit, idBPost;

                    var AAA = A.type()
                        .init(function(){ idAInit = id++; })
                        .post(function(){ idAPost = id++; });

                    var BBB = A.type()
                        .init(function(){ idBInit = id++; })
                        .post(function(){ idBPost = id++; });

                    AAA.add(BBB);

                    var a = new AAA();
                    assert.strictEqual(idAInit, 0);
                    assert.strictEqual(idBInit, 1);
                    assert.strictEqual(idAPost, 2);
                    assert.strictEqual(idBPost, 3);
                },
                "are called on the same instance of the type's one": function() {
                    var meAInit, meAPost, meBInit, meBPost;

                    var AAA = A.type()
                        .init(function(){ meAInit = this; })
                        .post(function(){ meAPost = this; });

                    var BBB = A.type()
                        .init(function(){ meBInit = this; })
                        .post(function(){ meBPost = this; });

                    AAA.add(BBB);

                    var a = new AAA();
                    assert.strictEqual(meAInit, a);
                    assert.strictEqual(meAPost, a);
                    assert.strictEqual(meBInit, a);
                    assert.strictEqual(meBPost, a);
                },
                "are called even if the receiving type has none": function() {
                    var id = 0;
                    var idBInit, idBPost;

                    var AAA = A.type();

                    var BBB = A.type()
                        .init(function(){ idBInit = id++; })
                        .post(function(){ idBPost = id++; });

                    AAA.add(BBB);

                    var a = new AAA();
                    assert.strictEqual(idBInit, 0);
                    assert.strictEqual(idBPost, 1);
                },
                "are not called when a previous method fails": function() {
                    var id = 0;
                    var idAInit, idAPost, idBInit, idBPost;

                    var AAA = A.type()
                        .init(function(){ idAInit = id++; })
                        .post(function(){ idAPost = id++; throw Error(); });

                    var BBB = A.type()
                        .init(function(){ idBInit = id++; })
                        .post(function(){ idBPost = id++; });

                    AAA.add(BBB);

                    assert.throws(function() { new AAA(); }, Error);

                    assert.strictEqual(idAInit, 0);
                    assert.strictEqual(idBInit, 1);
                    assert.strictEqual(idAPost, 2); // throws
                    assert.isUndefined(idBPost);
                }
            },
            "its methods": {
                "override the same-named receiving type' ones": function() {
                    var res1 = 1;
                    var res2 = 2;
                    var bar1 = function() { return res1; };
                    var bar2 = function() { return res2 + this.base(); };
                    
                    var Foo = A.type().add({bar: bar1});

                    var Bar = A.type().add({bar: bar2});

                    Foo.add(Bar);

                    assert.strictEqual(new Foo().bar(), res1 + res2);
                }
            }
        },

        "with more than one type": {
            "works": function() {
                var Bar = A.type();
                var Zas = A.type();
                var Foo = A.type().add(Bar).add(Zas);
            },
            "its `init` and `post` are called after the receiving type's ones": function() {
                var id = 0;
                var idAInit, idAPost, idBInit, idBPost, idCInit, idCPost;

                var AAA = A.type()
                    .init(function(){ idAInit = id++; })
                    .post(function(){ idAPost = id++; });

                var BBB = A.type()
                    .init(function(){ idBInit = id++; })
                    .post(function(){ idBPost = id++; });

                var CCC = A.type()
                    .init(function(){ idCInit = id++; })
                    .post(function(){ idCPost = id++; });

                AAA.add(BBB, CCC);

                var a = new AAA();
                assert.strictEqual(idAInit, 0);
                assert.strictEqual(idBInit, 1);
                assert.strictEqual(idCInit, 2);
                assert.strictEqual(idAPost, 3);
                assert.strictEqual(idBPost, 4);
                assert.strictEqual(idCPost, 5);
            }
        }
    }
})
.export(module);
