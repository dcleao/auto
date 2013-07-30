var requirejs = require('requirejs').config({
    nodeRequire: require, 
    baseUrl: __dirname + '/../../../../'
});

var vows   = requirejs("vows");
var assert = requirejs("assert");
var A      = requirejs("dist/auto");

vows
.describe("A.sequence")
.addBatch({
    "Creating a sequence generator": {
        "with no arguments": {
            "returns a function": function() {
                var s1 = A.sequence();
                assert.typeOf(s1, 'function');
            },
            "calling the function 10 times yields the numbers 0 to 9": function() {
                var s1 = A.sequence();
                for(var i = 0 ; i < 10 ; i++) {
                    var j = s1();
                    assert.strictEqual(j, i);
                }
            }
        },
        "with a _next_ argument of 5": {
            "returns a function that called 10 times, yields the numbers 5 to 14": function() {
                var numbers = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
                var s1 = A.sequence(numbers[0]);
                for(var i = 0 ; i < numbers.length ; i++) {
                    var j = s1();
                    assert.strictEqual(j, numbers[i]);
                }
            }
        },
        
        "with a _next_ argument of 4 and a _step_ argument of 2": {
            "returns a function that called 5 times, yields the numbers 4, 6, 8, 10, 12": function() {
                var numbers = [4, 6, 8, 10, 12];
                var step  = 2;
                var s1 = A.sequence(numbers[0], step);
                for(var i = 0 ; i < numbers.length ; i++) {
                    var j = s1();
                    assert.strictEqual(j, numbers[i]);
                }
            }
        },
        
        "with a _next_ argument of -4 and a _step_ argument of 2": {
            "returns a function that called 5 times, yields the numbers -4, -2, 0, 2, 4": function() {
                var numbers = [-4, -2, 0, 2, 4];
                var step  =  2;
                var s1 = A.sequence(numbers[0], step);
                for(var i = 0 ; i < numbers.length ; i++) {
                    var j = s1();
                    assert.strictEqual(j, numbers[i]);
                }
            }
        },
        
        "with a _next_ argument of -4 and a _step_ argument of -2": {
            "returns a function that called 5 times, yields the numbers -4, -6, -8, -10, -12": function() {
                var numbers = [-4, -6, -8, -10, -12];
                var step  =  -2;
                var s1 = A.sequence(numbers[0], step);
                for(var i = 0 ; i < numbers.length ; i++) {
                    var j = s1();
                    assert.strictEqual(j, numbers[i]);
                }
            }
        },
        
        "with a _next_ argument of 1 and a _step_ argument of 0": {
            "returns a function that called 5 times, yields the numbers 1, 1, 1, 1, 1": function() {
                var start = 1;
                var step  = 0;
                var s1 = A.sequence(start, step);
                for(var i = 0 ; i < 5 ; i++) {
                    var j = s1();
                    assert.strictEqual(j, 1);
                }
            }
        }
    },
    
    "Calling the _gen_ method": {
        "with a _count_ argument of 5": {
            "on a sequence generator created with no arguments": {
                "returns an enumerator": function() {
                    var count = 5; 
                    var etor = A.sequence().gen(count);
                    assert.isTrue(A.enumerator.is(etor));
                },
                
                "that yields exactly 5 iterations with items 0, 1, 2, 3, 4": function() {
                    var count = 5; 
                    var etor = A.sequence().gen(count);
                    var numbers = [0,1,2,3,4];
                    var actualCount = 0;
                    while(etor.next()) {
                        assert.strictEqual(etor.item, numbers[etor.index]);
                        actualCount++;
                    }
                    assert.strictEqual(actualCount, count);
                }
            }
        } 
    },
    
    "When a default sequence generator is created": {
        topic: function() {
            return A.sequence();
        },
        
        "and it is called once": {
            topic: function(seq) {
                seq();
                return seq;
            },
            
            "and then an infinite enumerator of it is obtained": {
                topic: function(seq) {
                    return seq.gen();
                },
                
                "the first 5 enumerated numbers are the numbers 1 to 5": function(etor) {
                    var i = 1;
                    while(i <= 5) {
                        assert.isTrue(etor.next());
                        assert.strictEqual(etor.item, i);
                        i++;
                    }
                }
            },
            
            "and then another infinite enumerator of it is obtained": {
                topic: function(seq) {
                    return seq.gen();
                },
                
                "the first 5 enumerated numbers are the numbers 6 to 11": function(etor) {
                    var i = 6;
                    while(i <= 11) {
                        assert.isTrue(etor.next());
                        assert.strictEqual(etor.item, i);
                        i++;
                    }
                }
            }
        }
    }
})
.export(module);
