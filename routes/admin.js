const express = require("express");
const Product = require("../models/product");
const Category = require("../models/category");
const ContactUs = require("../models/contact");
const Order = require("../models/order");
const Checkout = require("../models/checkout");
const middleware = require("../middleware");
const User = require('../models/user');
const passport = require('passport')
const csrf = require("csurf");
const { check } = require("express-validator");
const adminRouter = express.Router();

adminRouter.get('/', middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        const products = await Product.find({});
        const categories = await Category.find({});
        const user_checkout = await Checkout.find({}).sort({ createdAt: -1 }).populate('user');

        const topSellingItems = user_checkout.reduce((acc, checkout) => {
            checkout.items.forEach((item) => {
                const existingItem = acc.find((accItem) => accItem.productId.toString() === item.productId.toString());
                if (existingItem) {
                    existingItem.qty += item.qty;
                } else {
                    acc.push({
                        productId: item.productId,
                        qty: item.qty,
                        title: item.title,
                        price: item.price,
                    });
                }
            });
            return acc;
        }, []);
        topSellingItems.sort((a, b) => b.qty - a.qty);

        res.render("admin/admin_dashboard", {
            title: "GOG | Admin Dashboard",
            users,
            products,
            categories,
            user_checkout,
            topSellingItems,
        });
    } catch (error) {
        console.log(error);
        return res.redirect("/");
    }
});


adminRouter.get('/userDetails', middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        res.render("admin/userDetails", {
            title: "Admin | User Details", users
        });
    } catch (error) {
        console.log(error);
        return res.redirect("/");
    }
});

adminRouter.get('/addProduct', middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
    try {
        res.render("admin/addProduct", {
            title: "Add Product"
        });
    } catch (error) {
        console.log(error);
        return res.redirect("/");
    }
});

adminRouter.get("/myOrders", middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
    try {
        const checkouts = await Checkout.find({}).sort({ createdAt: -1 });
        res.render("admin/ordersList", {
            checkoutitems: checkouts,
            title: "Orders List",
        });
    } catch (err) {
        console.log(err);
        return res.redirect("/");
    }
});


adminRouter.get('/productDetails', middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
    try {
        // const users = await User.find({});
        const products = await Product.find({});
        // const categories = await Category.find
        res.render("admin/productDetails", {
            title: "Admin | Product Details", products
        });
    } catch (error) {
        console.log(error);
        return res.redirect("/");
    }
});

adminRouter.get('/messages', middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
    try {
        const messages = await ContactUs.find({});
        res.render("admin/messages", {
            title: "Admin | Messages", messages
        });
    } catch (error) {
        console.log(error);
        return res.redirect("/");
    }
});

adminRouter.get("/deleteProduct/:id", middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
    Product.findByIdAndDelete(req.params.id, function (err) {
        if (err) console.log(err);
        console.log("product Successfully deleted");
    });
    res.redirect('/admin/productDetails');
});

adminRouter.get("/deleteUser/:id", middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
    User.findByIdAndDelete(req.params.id, function (err) {
        if (err) console.log(err);
        console.log("user Successfully deleted");
    });
    res.redirect('/admin/userDetails');
});

adminRouter.get("/deleteMessage/:id", middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
    ContactUs.findByIdAndDelete(req.params.id, function (err) {
        if (err) console.log(err);
        console.log("Message Successfully deleted");
    });
    res.redirect('/admin/messages');
});

adminRouter.post('/addProduct', middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
    try {
        // console.log(req.body);
        let product = new Product();
        product.productCode = req.body.productcode;
        product.title = req.body.title;
        product.imagePath = req.body.imagepath;
        product.imagethumbnail1 = req.body.imagethumbnail1;
        product.imagethumbnail2 = req.body.imagethumbnail2;
        product.imagethumbnail3 = req.body.imagethumbnail3;
        product.description = req.body.description;
        product.features1 = req.body.features1;
        product.features2 = req.body.features2;
        product.features3 = req.body.features3;
        product.features4 = req.body.features4;
        product.mrp = req.body.mrp;
        product.price = req.body.price;
        product.reviewed = req.body.reviewed;
        product.sold = req.body.sold;
        product.stock = req.body.stock;
        product.brand = req.body.brand;
        product.manufacturer = req.body.manufacturer;
        product.available = Boolean(req.body.available);
        product.category = req.body.category;
        await product.save();
        req.session.product = product;
        console.log("Product Added successfully");
        res.redirect('/productDetails');
    } catch (error) {
        console.log(error);
    }
});

module.exports = { adminRouter };