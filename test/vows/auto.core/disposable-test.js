var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.IDisposable")
.addBatch({
    "A disposable: ": {
        topic: {dispose: function() {}},
        
        "is anything with a property named dispose containing a function": function(disp) {
            assert.isTrue(A.disposable.is(disp));
        },
        
        "is not anything with a property named dispose not containing a function": function() {
            assert.isFalse(A.disposable.is({dispose: 'foo'}));
        }
    },
    
    "A.dispose.as: ": {
        topic: {dispose: function() {}},
        
        "returns the first argument if it _is_ a disposable": function(disp) {
            if(A.disposable.is(disp)) {
                assert.strictEqual(A.disposable.as(disp), disp);
            }
        },
        
        "returns _null_ if the first argument _is not_ a disposable": function() {
            var o = {};
            if(!A.disposable.is(o)) {
                assert.isNull(A.disposable.as(o));
            }
        }
    },
    
    // Depends on A.enumerator(ds).call('dispose') to be working...
    "A.using: ": {
        "the received function is executed exactly once": function() {
            var callCount = 0;
            var f = function() { callCount++; };
            A.using(null, f);
            assert.strictEqual(callCount, 1);
        },
        
        "the received disposable's dispose method ": {
            "is executed exactly once": function() {
                var callCount = 0;
                var disposable = {dispose: function() { callCount++; } };
                
                A.using(disposable, function() {});
                assert.strictEqual(callCount, 1);
            },
            
            "is executed exactly once, even when the main function argument throws": function() {
                var callCount = 0;
                var disposable = {dispose: function() { callCount++; } };
                try {
                    A.using(disposable, function() { throw new Error("Failed."); });
                } catch(ex) {
                    // swallow
                }
                assert.strictEqual(callCount, 1);
            }
        },
        
        "lets the main function argument's thrown errors pass-through": function() {
            var failed = new Error("Failed.");
            var caught;
            try {
                A.using(null, function() { throw failed; });
            } catch(ex) {
                caught = ex;
            }
            
            assert.strictEqual(caught, failed);
        },
        
        "all received disposables are executed exactly once": function() {
            var callCount1  = 0;
            var disposable1 = {dispose: function() { callCount1++; } };
            
            var callCount2  = 0;
            var disposable2 = {dispose: function() { callCount2++; } };
            
            A.using([disposable1, disposable2], function() { });
            
            assert.strictEqual(callCount1, 1);
            assert.strictEqual(callCount2, 1);
        },
        
        "all received disposables are executed in order": function() {
            var ids = [];
            var disposable1 = {dispose: function() { ids.push(1); } };
            var disposable2 = {dispose: function() { ids.push(2); } };
            
            A.using([disposable1, disposable2], function() { });
            
            assert.deepEqual(ids, [1, 2]);
        }
    }
})
.export(module);

