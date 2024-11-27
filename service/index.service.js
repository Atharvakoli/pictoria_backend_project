const { user: userModel } = require("../models");

const doesUserExist = async (newUser) => {
  const findUser = await userModel.findOne({
    where: { username: newUser.username },
  });

  if (!findUser) {
    return false;
  }

  if (
    findUser.username === newUser.username ||
    findUser.email === newUser.email
  ) {
    return true;
  }
  return false;
};

const validateQuery = (query) => {
  let pattern = /^[~!@#$%^&*()_]+$/;
  let errors = [];
  if (!query && typeof query !== "string") {
    errors.push("Query parameter is required and type to be string");
  }
  if (pattern.test(query)) errors.push("No symbols are required as query.");
  return errors;
};

module.exports = { doesUserExist, validateQuery };
