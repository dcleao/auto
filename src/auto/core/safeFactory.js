// loadtime: 
// runtime:  error(A.fail)

// Adapted from
// http://www.codeproject.com/Articles/133118/Safe-Factory-Pattern-Private-instance-state-in-Jav/
var _safeFactory = function() {
    // This variable binding is shared between the open function
    // and all created safe functions.
    // Allows them to privately exchange information.
    var _channel; // = U;
    
    // Created safe functions can/should be placed publicly
    // Their value is immutable.
    
    function newSafe(secret) { return function safe() { _channel = secret; }; }

    // The `open` function must be kept private
    // It can open any safe created by the above `newSafe` instance
    // and read their secrets.
    function open(safe) {
        // Previously attacked?
        (_channel === U) || A.fail.oper.invalid("Access denied.");
        
        // 1 - calling `safe` places its secret in the `_channel`.
        // 2 - read and return the value in `_channel`.
        // 3 - clear `_channel` to avoid memory leak.
        var secret = (safe(), _channel); // Do NOT remove the parentesis
        return (_channel = U), secret;
    }
 
    open.newSafe = newSafe;
    open.newProp = _newProp;
    return open;
};

// Creates an `open` function that expects safes to be stored in
// a given property `p` of objects.
// When `p` isn't specified, a random property name is used.
var _newProp = function(p) {
    if(!p) { p = ('_sf' + Date.now() + '' + Math.round(1000 * Math.random())); }
    
    var _open = this;
    
    // Initializes an object, 
    // by storing in a predefined property, 
    // a given secret in a newly created safe.
    function init(inst, secret) { inst[p] = _open.newSafe(secret); return secret; }
    
    // Should be kept private
    function open(inst) {
        var s = inst[p];
        return s != N ? _open(s) : N;
    }
    
    //open.opener = _open;
    open.init = init;
    open.name = p;
    
    return open;
};