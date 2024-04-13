const Auth = require("./auth.model");

const save = async (auth) => {
  return auth.save();
};

const findById = async (id) => {
  return Auth.findById(id);
};

module.exports = { save, findById };
