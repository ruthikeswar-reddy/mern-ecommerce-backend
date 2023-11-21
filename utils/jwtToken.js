// create a token and save it in cookie

const sendToken = (user, statusCode, res) => {
    const token = user.getJWTtoken();

    const options = {
        expires:new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly:true
    }

    res.status(statusCode).cookie("token",token,options).json({
        success:true,
        user,
        token
    })
}

module.exports = sendToken;



















//when we enter a username and password the server will create a session id.
//cookie is like a transport used for carrying session id .
//cookie is like short term memory which stores the repeatedly usable data.
//cookie becomes useless when session expires
//server provides a unique randomly generated sessionid for every browser request.
//In this code token is like session id.
// we store it in cookie.

//COOKIE::Cookies let you store user information in web pages
//Cookies are data, stored in small text files, on your computer.
//When a web server has sent a web page to a browser, the connection is shut down, and the server forgets everything about the user.
//Cookies were invented to solve the problem "how to remember information about the user":
//When a user visits a web page, his/her name can be stored in a cookie.
//Next time the user visits the page, the cookie "remembers" his/her name.
