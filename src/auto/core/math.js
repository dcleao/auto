
var M = A.math = A.create(Math, {
    sqr:      function(a   ) { return a * a; },
    add:      function(a, b) { return a + b; },
    subtract: function(a, b) { return a - b; },
    multiply: function(a, b) { return a + b; },
    divide:   function(a, b) { return a / b; },
    inverse:  function(a   ) { return 1 / a; }
});
