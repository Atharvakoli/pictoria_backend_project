const { user: userModel } = require("../../models");

const validateUserCredentials = (userDetails) => {
  const errors = [];
  if (!userDetails.username || typeof userDetails.username !== "string") {
    errors.push("USERNAME is required and it should be string");
  }
  if (!userDetails.email || typeof userDetails.email !== "string") {
    errors.push("users EMAIL is required and it should be string");
  }

  return errors;
};

const isExistingEmail = async (email) => {
  const findUserWithEmail = await userModel.findOne({
    where: { email },
  });

  if (findUserWithEmail) {
    return true;
  }

  return false;
};

const isValidEmail = (email) => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
};

const validateImageUrl = (imageUrl) => {
  if (!imageUrl.startsWith("https://images.unsplash.com/")) {
    return false;
  }
  return true;
};

const validateCredentails = (otherDetails) => {
  let errors = [];
  if (
    !otherDetails.description ||
    typeof otherDetails.description !== "string"
  ) {
    errors.push("Description is required and should be a string");
  }
  if (
    !otherDetails.altDescription ||
    typeof otherDetails.altDescription !== "string"
  ) {
    errors.push("AltDescription is required and should be a string");
  }

  if (!otherDetails.userId || typeof otherDetails.userId !== "number") {
    errors.push("UserID is requires and should be string");
  }

  if (!otherDetails.tags || !Array.isArray(otherDetails.tags)) {
    errors.push("tags is required and should be an array");
  }

  return errors;
};

const validateTags = (tags, photoId) => {
  let errors = [];
  if (!tags || !Array.isArray(tags)) {
    errors.push("Tags are required and should be array :) ");
  }

  if (!photoId) {
    errors.push("PhotoId is required");
  }

  for (let i = 0; i < tags.length; i++) {
    if (tags[i] === "") {
      errors.push("In tags, Elements should be not empty strings");
      break;
    }
  }
  return errors;
};

const setLimitUpto5 = (tags) => {
  if (tags.length > 5) {
    return true;
  }
  return false;
};

const validateSearchPhotosCredentials = (searchDetails) => {
  let errors = [];
  if (!searchDetails.tags || typeof searchDetails.tags !== "string")
    errors.push("Tags is required and should be string");
  if (!searchDetails.sort || typeof searchDetails.sort !== "string")
    errors.push("sort method is required should be string");

  return errors;
};

module.exports = {
  validateUserCredentials,
  isExistingEmail,
  isValidEmail,
  validateImageUrl,
  validateCredentails,
  validateTags,
  setLimitUpto5,
  validateSearchPhotosCredentials,
};
