// to throw custom errors 

// OOPS 
// extends keyword is used for inheritance
// Error is a predefined class have predefined methods and properties
class ErrorHandler extends Error {
    // Error is the parent class
    // constructor is used in creating a object an instance of class

    constructor(message, statusCode){
        //By calling the super() method in the constructor method, 
        // we call the parent's constructor method and gets access to the parent's properties and methods
        super(message);
        // this is referred as object of the class
        this.statusCode = statusCode
        //captureStackTrace is used to make clear safe stack trace 
        // this is a object and this.constructor is a function , which is used to tell from where we want to scrubbed cleanly.
        Error.captureStackTrace(this, this.constructor)
    }
}


module.exports = ErrorHandler