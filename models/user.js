const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String, // Using String to handle leading zeros and country codes
        required: true, // Set to true if mandatory
        match: [/^\+?\d{10,15}$/, 'Please enter a valid phone number'] // Optional validation
    }
}, { timestamps: true });

const userModel = model("user", userSchema);
module.exports = userModel;
