const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const constants = require("../../constants");
const UnauthorizedError = require("../error/error.classes/UnauthorizedError");
const ForbiddenError = require("../error/error.classes/ForbiddenError");
const UserService = require("../user/user.service");

const signToken = (user) => {
  const maxAge = 30 * 24 * 60 * 60; // 30d

  const tokenBody = {
    _id: user._id,
    accessRole: user.role,
  };

  return jwt.sign(tokenBody, String(process.env.JWT_SECRET), {
    expiresIn: maxAge,
  });
};

const generatedServiceToken = () => {
  const tokenBody = {
    accessRole: constants.ACCESS.ROLES.SERVICE,
  };

  return jwt.sign(tokenBody, String(process.env.JWT_SECRET));
};

const extractToken = (bearerToken) => {
  const bearerArr = bearerToken.split(" ");
  if (bearerArr.length !== 2) return null;
  return bearerArr[1];
};

const authorize = async (authHeader, accessRoles) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication invalid!");
  }

  const token = extractToken(authHeader);

  if (token) {
    let payload = null;

    // vertify token
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError")
        throw new UnauthorizedError("Your session is expired!");

      throw new UnauthorizedError(
        `You're unauthorized to access this resource!`
      );
    }

    const returnBody = {
      tokenPayload: payload,
      user: undefined,
    };

    console.log(returnBody, accessRoles);

    // access request from user token
    if (payload.accessRole !== constants.ACCESS.ROLES.SERVICE) {
      // access role validation
      if (!accessRoles.includes(payload.accessRole))
        throw new ForbiddenError(
          `You're unauthorized to access this resource!!`
        );

      const dbUser = await UserService.getUserByUserId(payload._id);
      returnBody.user = dbUser;
    }

    return returnBody;
  } else {
    throw new UnauthorizedError(`You're unauthorized to access this resource!`);
  }
};

const getEncryptedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

module.exports = {
  signToken,
  generatedServiceToken,
  extractToken,
  authorize,
  getEncryptedPassword,
};
