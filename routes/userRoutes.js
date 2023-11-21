const express = require('express')
const { userRegister, loginUser, logout, forgotPassword, resetPassword, getUserDetails, updateChangePassword, updateUserProfile, getAllUsers, getSingleUser, updateUserRole, deleteUser } = require('../controllers/userControls')
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/authentication')

const router = express.Router()


//route to register a user
router.route('/user/register').post(userRegister)

//route to login a user

router.route('/user/login').post(loginUser)


// route to logout a user

router.route('/user/logout').get(logout)


// route to get a email when forgot password
router.route('/user/forgotpassword').post(forgotPassword)

//route to reset password 

router.route('/user/resetPassword/:token').put(resetPassword)

// route to get userDetails

router.route('/me').get(isAuthenticatedUser,getUserDetails)

// route to update a user password after logging into account

router.route('/me/password/update').put(isAuthenticatedUser,updateChangePassword)

//route to update user profile

router.route('/me/updateProfile').put(isAuthenticatedUser,updateUserProfile)



//route to get allusers

router.route('/admin/allUsers').get(isAuthenticatedUser,authorizeRoles("admin"),getAllUsers)


//route to get single user

router.route('/admin/singleUser/:id').get(isAuthenticatedUser,authorizeRoles("admin"),getSingleUser)


// route to update user role

router.route('/admin/updateUserRole/:id').put(isAuthenticatedUser,authorizeRoles("admin"),updateUserRole);

// route to delete a user

router.route('/admin/deleteUser/:id').delete(isAuthenticatedUser,authorizeRoles("admin"),deleteUser)


module.exports = router;