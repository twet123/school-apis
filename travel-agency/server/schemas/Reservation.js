const mongoose = require("mongoose");

const reservationSchema = mongoose.Schema(
  {
    _id: mongoose.ObjectId,
    username: {
      type: String,
      required: true,
    },
    aranzman: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    createdAt: Date,
    updatedAt: Date,
  },
  { collection: "rezervations" }
);

reservationSchema.pre("save", function (next) {
  var currentDate = new Date();

  this.updatedAt = currentDate;

  if (!this.createdAt) this.createdAt = currentDate;

  next();
});

module.exports = mongoose.model("Reservation", reservationSchema);
