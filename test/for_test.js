var arr = [];
while(arr.length < 5000000){
    arr.push(arr.length);
}
 
 
console.time("for in");
for(var i in arr) {
}
console.timeEnd("for in");
 
 
console.time("i++"); 
var length = arr.length;
for(var i=0; i<length; i++) {
}
console.timeEnd("i++"); 
 
console.time("i--");
var length = arr.length;
for(var i=length; i--;) {
}
console.timeEnd("i--");
 
 
console.time("map");
arr.map(function(){});
console.timeEnd("map");
 
 
console.time("filter");
arr.filter(function(){});
console.timeEnd("filter");
 
 
console.time("forEach");
arr.forEach(function(){});
console.timeEnd("forEach");
 
 
console.time("some");
arr.some(function(){});
console.timeEnd("some");
 
 
console.time("every");
arr.every(function(){return true;});
console.timeEnd("every");