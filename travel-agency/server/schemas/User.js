const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    _id: mongoose.ObjectId,
    username: {
      type: String,
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    createdAt: Date,
    updatedAt: Date,
  },
  { collection: "users" }
);

userSchema.pre("save", function (next) {
  var currentDate = new Date();

  this.updatedAt = currentDate;

  if (!this.createdAt) this.createdAt = currentDate;

  next();
});

module.exports = mongoose.model("User", userSchema);
