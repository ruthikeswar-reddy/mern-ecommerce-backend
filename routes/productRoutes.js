const express = require('express');
const { getAllProducts, createProduct, updateProduct, getSingleProduct, deleteProduct } = require('../controllers/productControllers');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/authentication');
const { createProductReview, getAllReviewsOfAProduct, deleteReview } = require('../controllers/userControls');

const router = express.Router();


//route of create a product -- post()
router
.route('/admin/products/new')
.post(isAuthenticatedUser,authorizeRoles("admin"), createProduct)



//route to get all products -- get()
router
.route('/products')
.get(getAllProducts)


//route to get a single product
router
.route('/products/singleProduct/:id')
.get(getSingleProduct)


//route to update a product---put()
// here :id means changable , for example if you want to find product1 with id:124n53b5q23 you use it in {:id} place in the route
router
.route('/admin/product/:id')
.put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)



//route to delete a product
router
.route('/admin/products/delete/:id')
.delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct)

//route to create a review

router
.route('/product/review')
.put(isAuthenticatedUser,createProductReview);


// route to get all reviews of a product

router
.route('/product/singleProductReviews')
.get(getAllReviewsOfAProduct)


//route to delete a review

router
.route('/product/deleteReview')
.delete(isAuthenticatedUser, deleteReview)


module.exports = router;
