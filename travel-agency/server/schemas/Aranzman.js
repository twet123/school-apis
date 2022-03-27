const mongoose = require("mongoose");

const aranzmanSchema = mongoose.Schema(
  {
    _id: mongoose.ObjectId,
    name: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    createdAt: Date,
    updatedAt: Date,
  },
  { collection: "aranzmans" }
);

aranzmanSchema.pre("save", function (next) {
  var currentDate = new Date();

  this.updatedAt = currentDate;

  if (!this.createdAt) this.createdAt = currentDate;

  next();
});

module.exports = mongoose.model("Aranzman", aranzmanSchema);
