const mongoose = require("mongoose");

const nastavnikSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    ime: {
      type: String,
      required: true,
    },
    prezime: {
      type: String,
      required: true,
    },
    predmet: {
      type: String,
      required: true,
    },
    createdAt: Date,
    updatedAt: Date,
  },
  { collection: "nastavnici" }
);

nastavnikSchema.pre("save", function (next) {
  var currentDate = new Date();

  this.updatedAt = currentDate;

  if (!this.createdAt) this.createdAt = currentDate;

  next();
});

module.exports = mongoose.model("Nastavnik", nastavnikSchema);
