const express = require("express");
const Product = require("../models/product");
const Category = require("../models/category");
const Cart = require("../models/cart");
const Wishlist = require("../models/wishlist");
const Checkout = require("../models/checkout");
const ContactUs = require("../models/contact");
const middleware = require("../middleware");
const User = require('../models/user');
const passport = require('passport');
const { check } = require("express-validator");
const router = express.Router();
const bcrypt = require('bcrypt');

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "gadgetsofgalaxy123@gmail.com",
        pass: "hxaqzlreadakbpbd"
    }
})

router.get('/', async (req, res) => {
    try {
        const users = await User.find({})
        const categories = await Category.find({})
        const products = await Product.find({})
        res.render('home', { title: 'Homepage', users, products, categories, middleware })
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
})

router.get('/homepage', (req, res) => {
    return res.redirect('/')
})



router.get("/category", (req, res) => {
    res.render("pagecategory", { title: 'Category' });
});


router.get('/featuredproducts', async (req, res) => {
    try {
        const categories = await Category.find({})
        const products = await Product.find({}).sort("-reviewed")
        res.render('products', { title: 'Featured Products', products, categories });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.get('/relatedProducts/:id', async (req, res) => {
    try {
        const categories = await Category.find({})
        const products = await Product.find({ brand: req.params.id })
        res.render('products', { title: 'Related Products', products, categories });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.get('/trendingproducts', async (req, res) => {
    try {
        const categories = await Category.find({})
        const products = await Product.find({}).sort("-sold")
        res.render('products', { title: 'Trending Products', products, categories });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});


router.post("/search", async (req, res) => {
    try {
        const products = await Product.find({ title: { $regex: req.body.search, $options: "i" } })
        res.render("products", {
            title: "Search Results",
            products
        });
    } catch (error) {
        console.log(error);
        res.redirect("/");
    }
});

router.get("/contactUs", (req, res) => {
    res.render("contactUs", { title: 'Contact Us' });
});

router.post("/contactUs", async (req, res) => {
    try {
        const newContactUs = await new ContactUs();
        newContactUs.name = req.body.name;
        newContactUs.email = req.body.email;
        newContactUs.subject = req.body.subject;
        newContactUs.phone = req.body.phone;
        newContactUs.message = req.body.message;
        await newContactUs.save();
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.redirect('/')
    }
});

router.get("/register", middleware.isNotLoggedIn, (req, res) => {
    res.redirect('/login');
});

router.post(
    "/register",
    [
        middleware.isNotLoggedIn,
        passport.authenticate("local.register", {
            successRedirect: "/login",
            failureRedirect: "/register",
            failureFlash: true,
        }),
    ],
    async (req, res) => {
        try {
            res.redirect("/login");
        } catch (err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/");
        }
    }
);

router.post('/check-login-email', (req, res) => {
    const { email } = req.body;
    User.findOne({ email: email })
        .exec()
        .then((user) => {
            if (user) {
                res.json({ isValidEmail: true });
            } else {
                res.json({ isValidEmail: false });
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

router.post('/check-login-password', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json({ isPasswordValid: false });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            return res.json({ isPasswordValid: true });
        } else {
            return res.json({ isPasswordValid: false });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/check-email', (req, res) => {
    const userEmails = [];
    User.find({}, 'email')
        .exec()
        .then((users) => {
            if (users.length > 0) {
                users.forEach((user) => {
                    userEmails.push(user.email);
                });

                const { email } = req.body;
                const isTaken = userEmails.includes(email);

                res.json({ isTaken });
            } else {
                console.log('No users found.');
                res.json({ isTaken: false });
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

// GET: display the login form
router.get("/login", middleware.isNotLoggedIn, async (req, res) => {
    res.render("login", {
        title: 'Login | Register',
    });
});

// POST: handle the login logic
router.post(
    "/login",
    [
        middleware.isNotLoggedIn,
        (req, res, next) => {
            if (req.body.isAdmin) {
                // If the "isAdmin" checkbox is selected, use "local.admin-login" strategy
                passport.authenticate("local.admin-login", {
                    failureRedirect: "/login",
                    failureFlash: true,
                })(req, res, next);
            } else {
                // Use the standard "local.login" strategy for regular user login
                passport.authenticate("local.login", {
                    failureRedirect: "/login",
                    failureFlash: true,
                })(req, res, next);
            }
        },
    ],
    async (req, res) => {
        try {
            // Check if the user is authenticated (either admin or regular user)
            if (req.isAuthenticated()) {
                if (req.user.isAdmin) {
                    // If the user is an admin, redirect to /admin without restoring any session data
                    return res.redirect("/admin");
                } else {
                    // User is not an admin, handle session data restoration
                    let cart = await Cart.findOne({ user: req.user._id });
                    if (req.session.cart && !cart) {
                        const cart = await new C
                        a0rt(req.session.cart);
                        cart.user = req.user._id;
                        await cart.save();
                    }
                    if (cart) {
                        req.session.cart = cart;
                    }

                    let wishlist = await Wishlist.findOne({ user: req.user._id });
                    if (req.session.wishlist && !wishlist) {
                        wishlist = new Wishlist(req.session.wishlist);
                        wishlist.user = req.user._id;
                        await wishlist.save();
                    }
                    if (wishlist) {
                        req.session.wishlist = wishlist;
                    }

                    // Redirect to old URL before logging in, or a default route
                    if (req.session.oldUrl) {
                        var oldUrl = req.session.oldUrl;
                        req.session.oldUrl = null;
                        return res.redirect(oldUrl);
                    }
                    return res.redirect("/myAccount");
                }
            }
            // If not authenticated, handle redirection accordingly
            return res.redirect("/login");
        } catch (err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/");
        }
    }
);


// GET: display user's profile
router.get("/myAccount", middleware.isLoggedIn, async (req, res) => {
    try {
        user_details = await User.find({ email: req.user.email }).exec();
        // console.log(user_details[0])
        res.render("user_profile", {
            user: user_details,
            title: "User Profile",
        });
    } catch (err) {
        console.log(err);
        return res.redirect("/");
    }
});

router.get("/editProfile", middleware.isLoggedIn, async (req, res) => {
    try {
        user_details = await User.find({ email: req.user.email }).exec();
        // console.log(user_details[0])
        res.render("edit_profile", {
            user: user_details,
            title: "Edit Profile",
        });
    } catch (err) {
        console.log(err);
        return res.redirect("/");
    }
});

router.post('/editProfile/:id', middleware.isLoggedIn, async (req, res) => {
    console.log(req.params);
    console.log(req.body);
    var user_id = req.params.id;
    User.findByIdAndUpdate(user_id, {
        mobileNumber: req.body.profileInputMobileNum,
        gender: req.body.profileInputGender,
        dob: req.body.profileInputBirthday.toString(),
        location: req.body.profileInputLocation,
    }, function (err, docs) {
        if (err) {
            console.log(err)
            res.redirect('/editProfile');
        }
        else {
            console.log("Updated User");
            res.redirect('/myAccount');
        }
    });
});

router.get("/myOrders", middleware.isLoggedIn, async (req, res) => {
    try {
        if (req.user) {
            const userId = req.user._id;
            
            // Find all checkout records for the user
            const userCheckouts = await Checkout.find({ user: userId }).sort({ createdAt: -1 });
            console.log("Userchekcouts\n");
            console.log(userCheckouts);
            
            res.render("myorders", {
                user_checkout: userCheckouts,
                title: "My Orders",
            });
        } else {
            res.render("myorders", {
                user_checkout: [],
                title: "My Orders",
            });
        }
    } catch (err) {
        console.error(err);
        return res.redirect("/");
    }
});



// GET: logout
router.get("/logout", middleware.isLoggedIn, (req, res) => {
    req.logout();
    req.session.cart = null;
    req.session.wishlist = null;
    res.redirect("/");
});


router.get("/shopping-cart", middleware.isLoggedIn, async (req, res) => {
    try {
        if (req.user && !req.session.cart) {
            const categories = await Category.find({});
            res.render("cart", { title: 'Cart', categories, cartitems: null });
        }
        else {
            const categories = await Category.find({});
            const requireuser = await Cart.findOne({ user: req.user._id })
            const cartitems = requireuser.items;
            // console.log(cartitems[0])
            res.render("cart", { title: 'Cart', categories, cartitems });
        }
    } catch (error) {
        console.log(error);
        // res.redirect('/');
    }
});

router.get("/wishlist", middleware.isLoggedIn, async (req, res) => {
    try {
        if (!req.user) {
            const categories = await Category.find({});
            res.render("wishlist", { title: 'wishlist', categories, wishlistitems: null });
        }
        if (req.user && !req.session.wishlist) {
            const categories = await Category.find({});
            res.render("wishlist", { title: 'wishlist', categories, wishlistitems: null });
        }
        else {
            // console.log(req.session)
            const categories = await Category.find({});
            const requireuser = await Wishlist.findOne({ user: req.user._id })
            // console.log(requireuser.items[0])
            const wishlistitems = requireuser.items;
            res.render("wishlist", { title: 'wishlist', categories, wishlistitems });
        }
    } catch (error) {
        console.log(error);
        //res.redirect('/');
    }
});

router.get("/add-to-wishlist/:id", middleware.isLoggedIn, async (req, res) => {
    const productId = req.params.id;
    try {
        // get the correct cart, either from the db, session, or an empty cart.
        let user_wishlist;
        if (req.user) {
            user_wishlist = await Wishlist.findOne({ user: req.user._id });
        }
        let wishlist;
        if (
            (req.user && !user_wishlist && req.session.wishlist) ||
            (!req.user && req.session.wishlist)
        ) {
            wishlist = await new Wishlist(req.session.wishlist);
        } else if (!req.user || !user_wishlist) {
            wishlist = new Wishlist({});
        } else {
            wishlist = user_wishlist;
        }

        // add the product to the cart
        const product = await Product.findById(productId);
        const itemIndex = wishlist.items.findIndex((p) => p.productId == productId);
        if (itemIndex > -1) {
        } else {
            // console.log(productId);
            wishlist.items.push({
                productId: productId,
                price: product.price,
                title: product.title,
                imagePath: product.imagePath,
                productCode: product.productCode,
            });
            wishlist.totalQty++;
        }

        // if the user is logged in, store the user's id and save cart to the db
        if (req.user) {
            wishlist.user = req.user._id;
            await wishlist.save();
        }
        req.session.wishlist = wishlist;
        req.flash("success", "Item added to the shopping wishlist");
        res.redirect(req.headers.referer);
    } catch (err) {
        console.log(err.message);
        res.redirect("/");
    }
});

async function productsFromCart(cart) {
    let products = [];
    for (const item of cart.items) {
        let foundProduct = (
            await Product.findById(item.productId).populate("category")
        ).toObject();
        foundProduct["qty"] = item.qty;
        foundProduct["totalPrice"] = item.price;
        products.push(foundProduct);
    }
    return products;
}


// GET: add a product to the shopping cart when "Add to cart" button is pressed
router.get("/add-to-cart/:id", middleware.isLoggedIn, async (req, res) => {
    const productId = req.params.id;
    try {
        // get the correct cart, either from the db, session, or an empty cart.
        let user_cart;
        if (req.user) {
            user_cart = await Cart.findOne({ user: req.user._id });
        }
        let cart;
        if (
            (req.user && !user_cart && req.session.cart) ||
            (!req.user && req.session.cart)
        ) {
            cart = await new Cart(req.session.cart);
        } else if (!req.user || !user_cart) {
            cart = new Cart({});
        } else {
            cart = user_cart;
        }

        // add the product to the cart
        const product = await Product.findById(productId);
        const itemIndex = cart.items.findIndex((p) => p.productId == productId);
        if (itemIndex > -1) {
            // if product exists in the cart, update the quantity
            cart.items[itemIndex].qty++;
            cart.items[itemIndex].price = cart.items[itemIndex].qty * product.price;
            cart.totalQty++;
            cart.totalCost += product.price;
        } else {
            // console.log(productId);
            // if product does not exists in cart, find it in the db to retrieve its price and add new item
            cart.items.push({
                productId: productId,
                qty: 1,
                price: product.price,
                title: product.title,
                imagePath: product.imagePath,
                productCode: product.productCode,
            });
            cart.totalQty++;
            cart.totalCost += product.price;
        }

        // if the user is logged in, store the user's id and save cart to the db
        if (req.user) {
            cart.user = req.user._id;
            await cart.save();
        }
        req.session.cart = cart;
        req.flash("success", "Item added to the shopping cart");
        res.redirect(req.headers.referer);
    } catch (err) {
        console.log(err.message);
        res.redirect("/");
    }
});


// GET: reduce one from an item in the shopping cart
router.get("/reduce/:id", async (req, res) => {
    const productId = req.params.id;
    try {
        // Find the user's cart based on their ID (you should implement this logic)
        let cart;
        if (req.user) {
            cart = await Cart.findOne({ user: req.user._id });
        } else if (req.session.cart) {
            cart = await new Cart(req.session.cart);
        }

        // Find the index of the item to remove in the cart.items array
        const itemIndex = cart.items.findIndex((item) => item.productId == productId);

        if (itemIndex !== -1) {
            // Get the price and quantity of the item being removed
            const removedItem = cart.items[itemIndex];
            const removedItemPrice = removedItem.price;
            const removedItemQty = removedItem.qty;

            // Remove the item from the cart's items array
            cart.items.splice(itemIndex, 1);

            // Update the cart's totalQty and totalCost
            cart.totalQty -= removedItemQty;
            cart.totalCost -= removedItemPrice;

            // If the cart is now empty, remove it from the session or database
            if (cart.items.length === 0) {
                req.session.cart = null;
                await Cart.findByIdAndRemove(cart._id);
            } else {
                // Save the updated cart to the session or database
                if (req.user) {
                    await cart.save();
                }
                req.session.cart = cart;
            }
        }

        // Redirect back to the cart page
        res.redirect("/shopping-cart");
    } catch (error) {
        console.log(error.message);
        res.redirect("/");
    }
});


router.get("/reduce-wishlist/:id", async (req, res) => {
    const productId = req.params.id;
    try {
        // Find the user's wishlist based on their ID (you should implement this logic)
        let wishlist;
        if (req.user) {
            wishlist = await Wishlist.findOne({ user: req.user._id });
        } else if (req.session.wishlist) {
            wishlist = await new Wishlist(req.session.wishlist);
        }

        // Find the index of the item to remove in the wishlist.items array
        const itemIndex = wishlist.items.findIndex((item) => item._id == productId);

        if (itemIndex !== -1) {
            // Get the price of the item being removed
            const removedItemPrice = wishlist.items[itemIndex].price;

            // Remove the item from the wishlist's items array
            wishlist.items.splice(itemIndex, 1);

            // Update the wishlist's totalQty and totalCost
            wishlist.totalQty--; // Decrease the total quantity by 1
            wishlist.totalCost -= removedItemPrice;

            // If the wishlist is now empty, remove it from the session or database
            if (wishlist.items.length === 0) {
                req.session.wishlist = null;
                await Wishlist.findByIdAndRemove(wishlist._id);
            } else {
                // Save the updated wishlist to the session or database
                if (req.user) {
                    await wishlist.save();
                }
                req.session.wishlist = wishlist;
            }
        }

        // Redirect back to the wishlist page
        res.redirect("/wishlist");
    } catch (error) {
        console.log(error.message);
        res.redirect("/");
    }
});



// GET: remove all instances of a single product from the cart
router.get("/removeAll/:id", async function (req, res, next) {
    const productId = req.params.id;
    let cart;
    try {
        if (req.user) {
            cart = await Cart.findOne({ user: req.user._id });
        } else if (req.session.cart) {
            cart = await new Cart(req.session.cart);
        }
        //fnd the item with productId
        let itemIndex = cart.items.findIndex((p) => p.productId == productId);
        if (itemIndex > -1) {
            //find the product to find its price
            cart.totalQty -= cart.items[itemIndex].qty;
            cart.totalCost -= cart.items[itemIndex].price;
            await cart.items.remove({ _id: cart.items[itemIndex]._id });
        }
        req.session.cart = cart;
        //save the cart it only if user is logged in
        if (req.user) {
            await cart.save();
        }
        //delete cart if qty is 0
        if (cart.totalQty <= 0) {
            req.session.cart = null;
            await Cart.findByIdAndRemove(cart._id);
        }
        res.redirect(req.headers.referer);
    } catch (err) {
        console.log(err.message);
        res.redirect("/");
    }
});

// GET: checkout form with csrf token
router.get("/checkout", middleware.isLoggedIn, async (req, res) => {
    if (!req.session.cart) {
        return res.redirect("/shopping-cart");
    }
    //load the cart with the session's cart's id from the db
    const cart = await Cart.findById(req.session.cart._id);
    // console.log(cart);
    res.render("checkout", { title: "Checkout", cost: cart.totalCost });
});
router.get("/placeOrder", middleware.isLoggedIn, async (req, res) => {
    const cart = await Cart.findById(req.session.cart._id);
    let checkout = new Checkout();
    checkout.items = cart.items;
    checkout.totalCost = cart.totalCost;
    checkout.totalQty = cart.totalQty;
    checkout.user = cart.user;
    req.session.checkout = checkout;
    await checkout.save();
    await cart.save();
    await Cart.findByIdAndDelete(cart._id);
    req.session.cart = null;
    
    // Set a timer to redirect to the home page after 6 seconds
    setTimeout(() => {
        const mailOptions = {
            from: "gadgetsofgalaxy123@gmail.com",
            to: req.user.email,
            subject: "GOG Registration",
            html: "<h1>Your Order has been placed successfully</h1>"
        }
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log("Email sent:" + info.response);
            }
        });
        res.redirect('/myOrders');
    }, 3000); // 6 seconds delay
});



module.exports = router;