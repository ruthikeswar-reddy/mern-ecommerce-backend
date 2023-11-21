// bcrypt is used to hash(encode) a password and then save it to database
//jsonwebtoken is used to generate tokens
// validator is used to validate a email, that is .... it checks whether the entered mail by user, is a email or not 
//nodemailer is to send mail to a gmail in case of reset a password
// crypto is used to generate a reset password token

const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')//built in module

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,"please enter the name"],
        maxLength:[30,"Name should be less than 30 characters"],
        minLength:[4,'Name should be more than 4 characters']
    },

    email:{
        type:String,
        required:[true,"please enter your gmail"],
        unique: true,
        validate:[validator.isEmail, 'please enter a valid email']
    },

    password:{
        type:String,
        required:[true,"please enter your password"],
        select: false,
        // select:false, this attribute makes password unvisible when we use find operation in database.
        minLength:[8, "Password should be greater than 8 characters"]

    },
    avatar:{
        public_id:{
            type: String,
            required: true
        },
        url:{
            type: String,
            required: true
        }
    },
    role:{
        type:String,
        default:'user'
    },

    createdAt:{
        type:Date,
        default: Date.now,
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
}
)

// this event is executedd before saving of data 
userSchema.pre("save", async function(next){

    //hash(s, salt, callback, progressCallback=):: Asynchronously generates a hash for the given string.
    // s: string to hash, salt:strongness  to generate hash

    if(!this.isModified('password')){
        next();
    }
    // this condition is used in order to avoid hashing of password again in case of name or email update, the data gonna be saved once again. 
    // when data is gonna be saved again after changes we have to check if password is modified or not.
    // if modified we hash it.
    // if not modified we avoid hashing the password once again.

    this.password = await bcryptjs.hash(this.password, 10)

    // we use hash inorder to not show original password

})

// JWT TOKEN

userSchema.methods.getJWTtoken = function(){

    //jwt.sign(payload, secretOrPrivateKey, [options, callback]):: used to create tokens

    // (Asynchronous) If a callback is supplied, the callback is called with the err or the JWT.

    //(Synchronous) Returns the JsonWebToken as string

    //payload could be an string,object literal, buffer or string representing valid JSON which is going to get modified.

    return  jwt.sign({id:this._id},process.env.JWT_SECRET,{
            expiresIn:process.env.JWT_EXPIRE,
        }
    )

}

// TO CHECK ENTERED PASSWORD IS CORRECT OR NOT

userSchema.methods.comparePassword = async function(enteredPassword) {
    //compare(s, hash, callback, progressCallback=)::: Asynchronously compares the given data against the given hash.
    return bcryptjs.compare(enteredPassword,this.password)
    // compare() function compares entered password to the original hashed password(this.password)
}


// GENERATING RESET PASSWORD TOKEN
userSchema.methods.generateResetPasswordToken = function(){

    const resetToken = crypto.randomBytes(20).toString('hex')

    // crypto.randomBytes(20) creates a random buffer of 20 bytes
    // we need to convert the buffer into string by using toString() function
    // we use "hex" in order to decode the buffer to string.

    //HASHING AND ADDING RESET PASSWORD TOKEN TO THE userSchema

    this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

    //.createHash(algorithm):Creates and returns a Hash object that can be used to generate hash digests using the given algorithm(sha256).
    //.update(data):  Updates the hash content with the given data, the encoding of which is given in inputEncoding.
    //If encoding is not provided, and the data is a string, an encoding of 'utf8' is enforced. If data is a Buffer, TypedArray, orDataView, then inputEncoding is ignored
    //.digest():: Calculates the digest of all of the data passed to be hashed (using the hash.update() method). 
    // If encoding(here " hex ") is provided a string will be returned; otherwise a Buffer is returned.

    // The Hash object can not be used again after hash.digest() method has been called. Multiple calls will cause an error to be thrown.

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000
    // time is always mentioned in milliseconds or in a format like 1d, 1h ,1m.....

    return resetToken
}
module.exports = new mongoose.model('userModel', userSchema)