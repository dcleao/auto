var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.random")
.addBatch({
    "Creating a random generator": {
        "with no arguments": {
            "returns a function": function() {
                var s1 = A.random();
                assert.typeOf(s1, 'function');
            },
            
            "and calling the function 50 times": {
                "yields numbers between [0 and 1[": function() {
                    var s1 = A.random();
                    for(var i = 0 ; i < 50 ; i++) {
                        var j = s1();
                        assert.isTrue(j >= 0 && j < 1);
                    }
                },
                
                "yields uniformly distributed numbers": function() {
                    var avg = 0;
                    var s1 = A.random();
                    var count = 50;
                    for(var i = 0 ; i < count ; i++) {
                        var j = s1();
                        avg += j;
                    }
                    avg /= count;
                    assert.isTrue(avg > 0.35 && avg < 0.65);
                }
            }
        },
        
        "with arguments _i_ = 5 and _f_ = 10": {
            "and calling the function 50 times": {
                "yields numbers between [5 and 10[": function() {
                    var I =  5;
                    var F = 10;
                    var s1 = A.random(I,F);
                    for(var i = 0 ; i < 50 ; i++) {
                        var j = s1();
                        assert.isTrue(j >= I && j < F);
                    }
                },
                
                "yields uniformly distributed numbers": function() {
                    var I =  5;
                    var F = 10;
                    var avg = 0;
                    var s1 = A.random(I,F);
                    var count = 50;
                    for(var i = 0 ; i < count ; i++) {
                        var j = s1();
                        avg += j;
                    }
                    //console.log("sum: " + avg + " count: " + count);
                    avg /= count;
                    
                    var D = (F-I) * 0.15;
                    var M = (F+I)/2;
                    var a = avg - M;
                    //console.log("avg: " + avg + " D: " + D + " M: " + M);
                    assert.isTrue(a > -D && a < D);
                }
            }
        }
    }
})
.export(module);
