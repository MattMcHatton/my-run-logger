const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  email: { type: String, default: null },
  date: { type: Date, default: null },
  mileage: { type: Number, default: null},
  duration: { type: String, default: null },
});

module.exports = mongoose.model("history", historySchema);