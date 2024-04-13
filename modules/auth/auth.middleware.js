const AuthUtil = require("./auth.util");

const authorize = (roleArr) => {
  if (!roleArr) roleArr = [];
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const returnBody = await AuthUtil.authorize(authHeader, roleArr);
    req.auth = returnBody;
    next();
  };
};

module.exports = { authorize };
