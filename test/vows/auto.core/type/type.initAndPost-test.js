var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.type")
.addBatch({
    "Creating a simple type using A.type returns a function": {
        "": function() {
            var Foo = A.type();
            assert.typeOf(Foo, 'function');
        },

        "whose prototype is an instance of A.Abstract": function() {
            var Foo = A.type();
            assert.isTrue(Foo.prototype instanceof A.Abstract);
        },

        "whose instances are instances of the type and its super-type A.Abstract": function() {
            var Foo = A.type();
            var f = new Foo();
            assert.instanceOf(f, Foo);
            assert.instanceOf(f, A.Abstract);
        },

        "that is different each time": function() {
            assert.notStrictEqual(A.type(), A.type());
        },

        "that, when called, creates an instance of it": function() {
            var Foo = A.type();
            var f   = new Foo();
            assert.instanceOf(f, Foo);
        },

        "that, when called, creates a different instance each time": function() {
            var Foo = A.type();
            assert.notStrictEqual(new Foo(), new Foo());
        }
    },
    "A simple type's instances are detected by A.is": function() {
        var Foo = A.type();
        assert.isTrue(A.is(new Foo(), Foo));
        assert.isTrue(A.is(new Foo(), Object));
    },
    "Passing an initialization function": {
        "works": function() {
            var Foo = A.type().init(function(){});

            assert.typeOf(Foo, 'function');
        },
        "returns the constructor": function() {
            var Foo = A.type();
            var Bar = Foo.init(function(){});

            assert.strictEqual(Foo, Bar);
        },
        "it is returned value of calling init": function() {
            var finit = function(){
                this.bar = 1;
            };

            var Foo = A.type().init(finit);
            
            assert.strictEqual(Foo.init(), finit);
        },
        "it gets called once on each instance creation": function() {
            var called = 0;
            var Foo = A.type().init(function() {
                called++;
            });

            var f = new Foo();

            assert.instanceOf(f, Foo);
            assert.strictEqual(called, 1);
        },
        "it gets called on the created instances": function() {
            var bar = {};
            var inst;
            var Foo = A.type()
                .init(function(){
                    inst = this;
                    this.bar = bar;
                });
            
            var f = new Foo();

            assert.strictEqual(inst, f);
            assert.strictEqual(inst.bar, bar);
        },
        "its return value is ignored": function() {
            var bar = {};
            var Foo = A.type().init(function() { return bar; });
            
            var f = new Foo();

            assert.notStrictEqual(f, bar);
        },
        "it is passed the arguments with which the constructor is called": function() {
            var args = [{}, {}, {}, {}, {}];
            var Foo = A.type().init(function() { 
                var args2 = arguments;
                assert.strictEqual(args2.length, args.length);

                args.forEach(function(v, i) {
                    assert.strictEqual(args2[i], args[i]);
                });
            });
            
            // Invoke constructor dynamically
            var f = Object.create(Foo.prototype);
            Foo.apply(f, args);
        }
    },
    "Passing a post-initialization function": {
        "works": function() {
            var Foo = A.type().post(function(){});

            assert.typeOf(Foo, 'function');
        },
        "returns the constructor": function() {
            var Foo = A.type();
            var Bar = Foo.post(function(){});

            assert.strictEqual(Foo, Bar);
        },
        "it is returned value of calling post": function() {
            var fpost = function(){
                this.bar = 1;
            };

            var Foo = A.type().post(fpost);
            
            assert.strictEqual(Foo.post(), fpost);
        },
        "it gets called once on each instance creation": function() {
            var called = 0;
            var Foo = A.type().post(function() {
                called++;
            });

            var f = new Foo();

            assert.instanceOf(f, Foo);
            assert.strictEqual(called, 1);
        },
        "it gets called on the created instances": function() {
            var bar = {};
            var inst;
            var Foo = A.type()
                .post(function(){
                    inst = this;
                    this.bar = bar;
                });
            
            var f = new Foo();

            assert.strictEqual(inst, f);
            assert.strictEqual(inst.bar, bar);
        },
        "its return value is ignored": function() {
            var bar = {};
            var Foo = A.type().post(function() { return bar; });
            
            var f = new Foo();

            assert.notStrictEqual(f, bar);
        },
        "it is passed the arguments with which the constructor is called": function() {
            var args = [{}, {}, {}, {}, {}];
            var Foo = A.type().post(function() { 
                var args2 = arguments;
                assert.strictEqual(args2.length, args.length);

                args.forEach(function(v, i) {
                    assert.strictEqual(args2[i], args[i]);
                });
            });
            
            // Invoke constructor dynamically
            var f = Object.create(Foo.prototype);
            Foo.apply(f, args);
        },
        "it gets called after init": function() {
            var id = 0, idinit, idpost;

            var Foo = A.type()
                .init(function() { idinit = id++; })
                .post(function() { idpost = id++; });
            
            var f = new Foo();

            assert.strictEqual(idinit, 0);
            assert.strictEqual(idpost, 1);
        },
        "it gets called on the same instance as init is": function() {
            var meinit, mepost;

            var Foo = A.type()
                .init(function() { meinit = this; })
                .post(function() { mepost = this; });
            
            var f = new Foo();

            assert.strictEqual(meinit, f);
            assert.strictEqual(mepost, f);
        },
        "it does not get called after init, if init throws an exception": function() {
            var postCalled = false;
            var Foo = A.type()
                .init(function() { throw new Error(); })
                .post(function() { postCalled = true; });
            
            assert
                .throws(function() {
                    new Foo();
                }, 
                Error);
            
            assert.isFalse(postCalled);
        },
        "it is passed the arguments with which the constructor is called, even if init changes them": function() {
            var args = [{}, {}, {}, {}, {}];
            var Foo = A.type()
                .init(function() {
                    var args2 = Array.prototype.slice.call(arguments);

                    args2.forEach(function(v, i) {
                        args2[i] = 1;
                    });
                })
                .post(function() { 
                    var args2 = arguments;
                    assert.strictEqual(args2.length, args.length);

                    args.forEach(function(v, i) {
                        assert.strictEqual(args2[i], args[i]);
                    });
                });
            
            // Invoke constructor dynamically
            var f = Object.create(Foo.prototype);
            Foo.apply(f, args);
        }
    }
})
.export(module);
