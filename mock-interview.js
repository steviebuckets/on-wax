Write an example function that takes a callback function as an argument. 
Inside the function, invoke the callback and pass in a locally assigned variable (any value). Finally, 
call the example function, with a callback that logs out the provided argument.


steve function() {
	//

}

test function(steve) {
steve()
var lastName = "Martin";

}
test(lastName);

function callback(name) {
	console.log(name);


}
function example(callback) {
var name = "steve";
callback(name);

}
example(callback);