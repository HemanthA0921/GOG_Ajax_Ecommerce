const mongoose = require("mongoose");

const checkoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true,
    },
    // Other fields for checkout data
    totalQty: {
        type: Number,
        default: 0,
        required: true,
    },
    totalCost: {
        type: Number,
        default: 0,
        required: true,
    },
    items: [
        {
            // Define the fields for each item in the cart
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            imagePath: String,
            qty: Number,
            price: Number,
            title: String,
            productCode: String,
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Checkout", checkoutSchema);