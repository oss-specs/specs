var fs = require('q-io/fs');
var util = require('util');

console.log(util.inspect([].find.prototype, true));
console.log([].find.toString());

[1,2,3].find(function (item) {
    console.log("caller", caller);
    return item === 2;
});