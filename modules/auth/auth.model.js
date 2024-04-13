const mongoose = require("mongoose");

const AuthSchema = mongoose.Schema(
  {
    _id: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Please provide the password!"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Auth", AuthSchema);
