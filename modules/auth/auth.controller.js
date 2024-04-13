const { StatusCodes } = require("http-status-codes");
const AuthUtil = require("./auth.util");
const Auth = require("./auth.model");
const AuthService = require("./auth.service");
const UserService = require("../user/user.service");
const constants = require("../../constants");
const bcrypt = require("bcryptjs");
const BadRequestError = require("../error/error.classes/BadRequestError");
const NotFoundError = require("../error/error.classes/NotFoundError");

const register = async (req, res) => {
  const { email, name, address, contactNumber, role, password } = req.body;

  // disallow admin registration
  if (role === constants.USER.ROLES.ADMIN)
    throw new BadRequestError("Not Allowed to Create Admin Accounts!");

  // create auth document
  const auth = new Auth({
    _id: email,
    password: await AuthUtil.getEncryptedPassword(password),
  });
  const dbAuth = await AuthService.save(auth);

  // create user document
  const user = await UserService.createUser({
    auth: {
      _id: dbAuth._id,
    },
    name,
    address,
    contactNumber,
    role,
  });

  return res.status(StatusCodes.CREATED).json(user);
};

const authorize = async (req, res) => {
  const { authHeader, accessRoles } = req.body;
  console.log(req.body);
  const returnBody = await AuthUtil.authorize(authHeader, accessRoles);
  return res.status(StatusCodes.OK).json(returnBody);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // validations
  if (!password || !email)
    throw new BadRequestError("Both Email & Password are Required!");

  // check for existence
  const dbAuth = await AuthService.findById(email);
  if (!dbAuth) throw new NotFoundError("User Account Not Found!");

  //compare the passwords
  const passwordCompare = await bcrypt.compare(
    password,
    String(dbAuth.password)
  );
  if (!passwordCompare) throw new UnauthorizedError("Bad Credentials!");

  // request user from user service
  const dbUser = await UserService.getUserByAuthId(email);

  // sign token
  const token = AuthUtil.signToken(dbUser);

  const resBody = {
    token,
    user: dbUser,
  };

  return res.status(StatusCodes.OK).json(resBody);
};

module.exports = { register, authorize, login };
