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

const ucenikSchema = mongoose.Schema(
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
    ocene: {
      type: [ocenaSchema],
      default: [],
    },
    createdAt: Date,
    updatedAt: Date,
  },
  { collection: "ucenici" }
);

ucenikSchema.pre("save", function (next) {
  var currentDate = new Date();

  this.updatedAt = currentDate;

  if (!this.createdAt) this.createdAt = currentDate;

  next();
});

module.exports = mongoose.model("Ucenik", ucenikSchema);
