const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const User = require("./models/user");
const connectDB = require("./config/db");

const adminEmail = "admin.gog@gmail.com";
const adminPassword = "12345@Aa";

const createAdminUser = async () => {
    try {
        await connectDB();
        const existingAdminUser = await User.findOne({ email: adminEmail });
        if (existingAdminUser) {
            return;
        }

        const hashedPassword = bcrypt.hashSync(adminPassword, bcrypt.genSaltSync(10), null);

        const adminUser = new User({
            name: "GOG Admin",
            email: adminEmail,
            password: hashedPassword,
            isAdmin: true,
        });

        await adminUser.save();
        console.log("Admin user created successfully.");
    } catch (error) {
        console.error("Error creating admin user:", error);
    }
};

module.exports = createAdminUser;
