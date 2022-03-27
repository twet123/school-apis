const mongoose = require("mongoose");

const ocenaSchema = mongoose.Schema({
  ocena: {
    type: Number,
    required: true,
  },
  predmet: {
    type: String,
    required: true,
  },
  createdAt: Date,
  updatedAt: Date,
});

ocenaSchema.pre("save", function (next) {
  var currentDate = new Date();

  this.updatedAt = currentDate;

  if (!this.createdAt) this.createdAt = currentDate;

  next();
});

module.exports = mongoose.model("Ocena", ocenaSchema);
