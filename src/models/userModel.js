const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        email:{
            type: String,
            unique: [true, "Email must be unique"],
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
        },
        name:{
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        password:{
                type: String,
                required: [true, "password is required"],
                minlength: [6, "Password should be contain more than 6 characters"],
                select: false,
            
        },
       
    }, {timestamps: true})
    userSchema.pre("save", async function(next) {
        if(!this.isModified("password")){
            return next();
        }

        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        return 
    });

    userSchema.methods.comaprePassword = async function (password){
        return await bcrypt.compare(password, this.password)
    }

    const userModel = mongoose.model("user", userSchema);
    module.exports = userModel;
