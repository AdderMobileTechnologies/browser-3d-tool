//Brandons Register Child Function
/////////--------------------------------------
// Registering a child components function with it's parent so that the parent can call the function when it needs to.
//<Parent>: ------------------
//- outside the constructor:

registerChildFunction(childFunction) {
    this.childFunction = childFunction;
}
callChildFunction(data) {
//call the registered function.
this.childFunction(data);
}
componentWillUnmount() {
this.childFunction = null;
}
//</Parent>

////<Child>: ------------------------
//- inside constructor:
    this.childFunction = this.childFunction.bind(this);
    props.registerChildFunction(this.childFunction);

//- outside the constructor 
childFunction(data) {}

//////-</Child> --------------------------------------------