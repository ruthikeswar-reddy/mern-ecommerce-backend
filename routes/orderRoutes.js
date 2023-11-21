const express = require('express')
const { createOrder, getSingleOrder, myOrders, getAllOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/authentication');

const router = express.Router()



// route to create a order

router
.route('/order/new')
.post(isAuthenticatedUser, createOrder);


// route to get a single user

router
.route('/order/:id')
.get(isAuthenticatedUser, getSingleOrder)


// route to get logged in user orders

router
.route('/myOrders')
.get(isAuthenticatedUser,myOrders)


// route to get all orders

router
.route('/admin/allOrders')
.get(isAuthenticatedUser,authorizeRoles("admin"), getAllOrders);



//route to update order status and delete a order

router.route('/admin/order/:id')
.put(isAuthenticatedUser,authorizeRoles("admin"),updateOrderStatus)
.delete(isAuthenticatedUser,authorizeRoles("admin"),deleteOrder)


module.exports = router