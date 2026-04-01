Backend Routes: 
-------------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------------

1. AUTH ROUTES

POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/update-profile
POST   /api/auth/logout
POST   /api/auth/refresh-token !!


2. PRODUCT ROUTES

POST   /api/products              (seller/admin)
GET    /api/products              (all products, filters, search)
GET    /api/products/:id          (single product)
PUT    /api/products/:id          (seller/admin)
DELETE /api/products/:id          (soft delete using isActive)

With Filters 
GET /api/products?category=mobile&minPrice=10000&maxPrice=50000&search=iphone


3. CATEGORY ROUTES

POST   /api/categories
GET    /api/categories
GET    /api/categories/:id
GET    /api/categories/:id/products (filter + pagination) !!
PUT    /api/categories/:id
DELETE /api/categories/:id


4. REVIEW ROUTES

POST   /api/reviews/:productId   (add review)
GET    /api/reviews/:productId   (get product reviews)
DELETE /api/reviews/:id          (user/admin)

Feature:
Only 1 review per user per product
Only buyers can review


5. CART ROUTES

POST   /api/cart                 (add to cart)
GET    /api/cart                 (get user cart)
PUT    /api/cart/:productId      (update quantity)
DELETE /api/cart/:productId      (remove item)
DELETE /api/cart                 (clear cart)


6. ORDER ROUTES

POST   /api/orders               (place order)
GET    /api/orders/my            (user orders)
GET    /api/orders/:id           (order details)
PATCH    /api/orders/:id/status    (admin/seller)


7. PAYMENT ROUTES

POST   /api/payment/create/order     (razorpay order)
POST   /api/payment/verify          (verify payment)
GET    /api/payment/:id             (payment details) !!


8. DELIVERY ROUTES

POST   /api/delivery                 (assign delivery)
GET    /api/delivery/:orderId        (track delivery)
PUT    /api/delivery/:id/status      (update delivery status)

9. ADMIN ROUTES

GET /api/admin/users
GET /api/admin/orders
GET /api/admin/products

10. ANALYTICS

GET /api/admin/dashboard
