var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.type base")
.addBatch({
    "Creating a sub type of a custom base type": {
        "works": function() {
            var AAA = A.type();
            var BBB = AAA.type();
        },
        "the instances of the sub-type are instances of the base type, accorfing to A.is": function() {
            var AAA = A.type();
            var BBB = AAA.type();

            assert.isTrue(A.is(new BBB(), BBB));
            assert.isTrue(A.is(new BBB(), AAA));
        },
        "makes the base-type's properties available to the sub-type": function() {
            var aaa = function() { };
            var bbb = function() { };

            var AAA = A.type().add({aaa: aaa});

            var BBB = AAA.type().add({bbb: bbb});

            var b = new BBB();
            assert.strictEqual(b.aaa, aaa);
            assert.strictEqual(b.bbb, bbb);
        },
        "when the base-type's `init` and `post` are not called from the sub's": {
            "they are called, automatically, before": function() {
                var id = 0;
                var idAInit, idBInit, idAPost, idBPost;

                var AAA = A.type()
                    .init(function() { idAInit = id++; })
                    .post(function() { idAPost = id++; });

                var BBB = AAA.type()
                    .init(function() { idBInit = id++; })
                    .post(function() { idBPost = id++; });

                var b = new BBB();
                assert.strictEqual(idAInit, 0);
                assert.strictEqual(idBInit, 1);
                assert.strictEqual(idAPost, 2);
                assert.strictEqual(idBPost, 3);
            },
            "they are called with the same arguments as the sub's constructor": function() {
                var args = [{}, {}, {}, {}, {}];
                
                function assertArgs() {
                    var args2 = arguments;
                    assert.strictEqual(args2.length, args.length);

                    args.forEach(function(v, i) {
                        assert.strictEqual(args2[i], args[i]);
                    });
                }
                
                var AAA = A.type()
                    .init(assertArgs)
                    .post(assertArgs);

                var BBB = AAA.type()
                    .init(assertArgs)
                    .post(assertArgs);

                // Invoke constructor dynamically
                var b = Object.create(BBB.prototype);
                BBB.apply(b, args);
            },
            "they are called with the same arguments as the sub's constructor, even if changed": function() {
                var args = [{}, {}, {}, {}, {}];
                
                function assertArgs() {
                    var args2 = arguments;
                    assert.strictEqual(args2.length, args.length);

                    args.forEach(function(v, i) {
                        assert.strictEqual(args2[i], args[i]);
                        args2[i] = 1;
                    });
                }
                
                var AAA = A.type()
                    .init(assertArgs)
                    .post(assertArgs);

                var BBB = AAA.type()
                    .init(assertArgs)
                    .post(assertArgs);

                // Invoke constructor dynamically
                var b = Object.create(BBB.prototype);
                BBB.apply(b, args);
            }
        },
        
        "the base-type's `init` and `post` can also be called explicitly from the sub's": function() {
            var id = 0;
            var idAInit, idBInit, idAPost, idBPost;

            var AAA = A.type()
                .init(function() { idAInit = id++; })
                .post(function() { idAPost = id++; });

            var BBB = AAA.type()
                .init(function() { 
                    idBInit = id++;
                    this.base();
                })
                .post(function() { 
                    idBPost = id++;
                    this.base();
                });

            var b = new BBB();
            assert.strictEqual(idAInit, 1);
            assert.strictEqual(idBInit, 0);
            assert.strictEqual(idAPost, 3);
            assert.strictEqual(idBPost, 2);
        },
        "and mixing another type at the base type": {
            "the base-type's and mixed-in type's `init` and `post` are called, automatically, before, when not called from the sub's": function() {
                var id = 0;
                var idAInit, idBInit, idCInit, idAPost, idBPost, idCPost;

                var AAA = A.type()
                    .init(function() { idAInit = id++; })
                    .post(function() { idAPost = id++; });

                var CCC = A.type()
                    .init(function() { idCInit = id++; })
                    .post(function() { idCPost = id++; });

                AAA.add(CCC);

                var BBB = AAA.type()
                    .init(function() { idBInit = id++; })
                    .post(function() { idBPost = id++; });

                var b = new BBB();
                assert.strictEqual(idAInit, 0);
                assert.strictEqual(idCInit, 1);
                assert.strictEqual(idBInit, 2);
                assert.strictEqual(idAPost, 3);
                assert.strictEqual(idCPost, 4);
                assert.strictEqual(idBPost, 5);
            },
            "the base-type's and mixed-in type's `init` and `post` can also be called explicitly from the sub's": function() {
                var id = 0;
                var idAInit, idBInit, idCInit, idAPost, idBPost, idCPost;

                var AAA = A.type()
                    .init(function() { idAInit = id++; })
                    .post(function() { idAPost = id++; });

                var CCC = A.type()
                    .init(function() { idCInit = id++; })
                    .post(function() { idCPost = id++; });

                AAA.add(CCC);
                
                var BBB = AAA.type()
                    .init(function() { 
                        idBInit = id++; 
                        this.base();
                    })
                    .post(function() { 
                        idBPost = id++; 
                        this.base();
                    });

                var b = new BBB();
                assert.strictEqual(idBInit, 0);

                assert.strictEqual(idAInit, 1);
                assert.strictEqual(idCInit, 2);
                
                assert.strictEqual(idBPost, 3);

                assert.strictEqual(idAPost, 4);
                assert.strictEqual(idCPost, 5);
            }
        }
    }
})
.export(module);
