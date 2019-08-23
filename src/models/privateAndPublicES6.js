class Mesh {
    // Here, we are in the "inner world". Almost everything within the curly braces of the class definition
    // can see and modify each other, with some exceptions. These exceptions are listed below.

    constructor() {
        // This is a private variable, since it is NOT declared with the "this." syntax.
        // It can ONLY be accessed from functions defined within the constructor. Other
        // member methods (functions) of this class cannot access it, even when using the
        // this.function = this.function.bind(this) syntax.
        let babylonFilepath = "dbdev.adder.io/assets/foo.babylon";

        // This is a public variable. It can be accessed directly by ANY object, simply by using the
        // "this." syntax. Example below the class definition. Note that in this declaration (and definition),
        // there is no "var", "let", or "const". In ES6 classes, you do NOT use these when declaring public
        // variables/methods, but rather use "this.VARIABLE" to declare/define them.
        this.positionVector = {
            x: 0,
            y: 1,
            z: 3.4
        };

        // In order for an outside object to access the private "babylonFilepath" variable, we must declare a public
        // method that outside objects can use to retrieve it. Remember, a private variable, such as "babylonFilepath",
        // can only be accessed by functions defined within the constructor. Thus, we define a "getter" method here in
        // the constructor, that returns the "babylonFilepath" variable when called. Since this function is declared
        // with the "this." syntax, it is accessible to the outside world, and since it is defined within the constructor,
        // it is able to access the private "babylonFilepath" variable. Think of it as a bridge between the inner workings
        // of the class, and the outer world.
        this.getPrivateBabylonFilepath = function() {
            return babylonFilepath;
        };

        // In order for an outside object to change the value of the private "babylonFilepath" variable, we can declare
        // a public "setter" function that outside objects can use to directly access the variable.
        this.setPrivateBabylonFilepath = function(newFilepath) {
            // Note that we do NOT use the "this." syntax when accessing "babylonFilepath". Using "this.babylonFilepath"
            // actually leaves the original private variable unchanged, and creates a new public variable with the value
            // "newFilepath". This is demonstrated and explained in depth in the examples below the class definition.

            babylonFilepath = newFilepath;
        }
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Here, we are now in the "outer world". The concepts of private and public variables/functions start here.

// Let's make a new mesh, to try out some examples.
let mesh = new Mesh();

// If we try to access "babylonFilepath" directly, we will get "undefined" as the result, as it is a private variable
// and is not accessible to the outer world.
//
//  OUTPUT: undefined
console.log(mesh.babylonFilepath);

// Now, since "positionVector" is a public variable of the Mesh class, we can directly access it and view it's properties:
//
// OUTPUT: { x: 0, y: 1, z: 3.4 }
console.log(mesh.positionVector);

// How do we access the "babylonFilepath" variable? We use the "getter" method we defined in the constructor.
//
// OUTPUT: dbdev.adder.io/assets/foo.babylon
console.log(mesh.getPrivateBabylonFilepath());

// All cool, now what if we want to change the "positionVector" variable? Easy, since it is public, we can access it
// and do whatever we want!
//
// OUTPUT: { x: 52, y: 1, z: 3.4 }
mesh.positionVector.x = 52;
console.log(mesh.positionVector);

// OUTPUT: { x: 'foo', y: 'bar', z: 'baz' }
mesh.positionVector = {
    x: "foo",
    y: "bar",
    z: "baz"
};
console.log(mesh.positionVector);

// Great! Now, what if we want to modify the "babylonFilepath" variable? This situation gets a bit crazy. The code
// below works without any errors or exceptions, so you'd think it would work, right?
//
// OUTPUT: portal.adder.io/assets/foo.babylon
mesh.babylonFilepath = "portal.adder.io/assets/foo.babylon";
console.log(mesh.babylonFilepath);

// But wait, the "console.log(mesh.babylonFilepath)" works now, but it didn't work before. What is going on? The problem
// is that when you set the "mesh.babylonFilepath" variable from the "outer world", it is NOT actually changing the
// private variable "babylonFilepath". What it IS doing is creating a new public variable (i.e. this.babylonFilepath),
// and assigning it the value "portal.adder.io/assets/foo.babylon". The difference can be seen by using two different
// console.log calls to print the different variables. The last log message showed the new value we have tried to assign
// to the private variable (the path starting with portal.adder.io), while the below call, which uses the
// "getPrivateBabylonFilepath()" function to retrieve the private variable, will return the original "dbdev.adder.io",
// which remains unmodified.
//
// OUTPUT: dbdev.adder.io/assets/foo.babylon
console.log(mesh.getPrivateBabylonFilepath());

// This is a very easy situation to get mixed up in, and is one of the downfalls of JS in general. Most statically typed
// languages (such as Java, C#, C++, etc...) will NOT let this happen, and the compiler will throw a fit if you try to
// do it. However, since JS is built around the concept of "Everything is an object with properties", it is perfectly
// legal to do this. In fact, before ES6 came around, this was actually the way of defining static functions on classes.
// This is feature can either be a blessing (in a few circumstances), or a literal hellscape of neverending scoping issues
// (as in most cases), and should be avoided unless there is a very good reason to do so.

// So, how do we actually modify the private "babylonFilepath" variable? Easy, we just use the "setter" method we defined
// in the constructor. First, we log out the private variable as it already exists:
//
// OUTPUT: dbdev.adder.io/assets/foo.babylon
console.log(mesh.getPrivateBabylonFilepath());

// Now, we use the setter method to change the private variable value, and then use console.log to see the result. This
// time, we get the result we expected. Remember, in order to view the private variable, we have to use the getter
// method, as accessing directly via the "mesh.babylonFilepath" syntax will give us the incorrect filepath (from the
// previous example).
//
// OUTPUT: foo.com/assets/baz.babylon
mesh.setPrivateBabylonFilepath("foo.com/assets/baz.babylon");
console.log(mesh.getPrivateBabylonFilepath());

/*
    So what's the big deal about private vs public?

    One of the principles of OOP is that objects should hide their internal state, and only expose an interface to
    outside objects that allows outside objects to modify the internal state in a controlled manner. This is called
    "information hiding", and is part of the wider OOP principal of "Encapsulation".

    When the internal state is completely hidden from the outside world, it makes it impossible for an outside object
    to modify the internals directly. Instead, if an outside object wants to modify anything, it has to go through
    a well defined interface (i.e. a set of public methods). Since all outside objects MUST be funnelled through these
    public methods, there are several benefits:
        1) When debugging, you might see a private variable is set to a value that was NOT expected. Since everything
           goes through the public functions, it makes it much easier to use stack traces to track down where the value
           was set from, and correct the issue.
        2) More importantly, keeping the internal state hidden and exposing only a public interface helps with
           maintenance and scalability. Say, for instance, you have a Car object. That car has a public variable, called
           speed. Due to (bad) design, this speed variable is public, and can be changed by outside objects. Now say
           there are two different objects, GasPedal, and CruiseControl. Both of these will modify the speed of the car,
           so they both have functions that calculate the speed based on either the position of the gas pedal or the
           position of the CruiseControl. Now, say that the original design of the Car class was considering that the
           car itself is a 4-cylinder engine. As it stands right now, both GasPedal and CruiseControl know this, and
           so everything gets calculated fine, and everything works as expected.

           2 months later, the system designer decides the car should be a 6-cylinder, rather than a 4. This definitely
           affects the speed of the car when considering the GasPedal (i.e. you don't have to push the gas pedal down as
           hard to achieve the same speed as you did in the 4-cylinder), so you go to the GasPedal class and change that.
           You test the system out again, and the GasPedal works perfectly fine, but for some weird reason, the CruiseControl
           makes the car move waaaaaay too slowly. That's because you forgot to change the speed calculation in CruiseControl.
           This isn't a big deal when there's only two things modifying the car's speed, but now imagine there are 20
           classes that can do this. You'd have to first REMEMBER all of the classes that modify it, then you have to change
           20 DIFFERENT classes to use the correct calculation. It's just NOT scalable or maintainable, especially considering
           that the original programmer that wrote the classes may NOT be available to help.

           The fix is that the Car class itself hides the speed variable, and exposes a public method, setSpeed(speedFactor),
           which takes a variable called speedFactor. The Car class can then use this speedFactor, in whatever method it
           needs to, to determine the actual speed itself, and then set it's private speed variable appropriately. Now,
           going back to the situation where the Car design was changed from a 4-cylinder to a 6-cylinder engine. Instead
           of needing to change the 20 different classes that were modifying the speed directly, now, you only need to change
           one function, the setSpeed function. This saves tons of development time and headscratching.

 */