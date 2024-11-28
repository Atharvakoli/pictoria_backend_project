const {
  user: userModel,
  tag: tagModel,
  photo: photoModel,
  searchHistory: searchHistoryModel,
} = require("../models");
const { doesUserExist } = require("../service/index.service.js");
const {
  validateUserCredentials,
  isExistingEmail,
  isValidEmail,
  validateImageUrl,
  validateCredentails,
  validateTags,
  setLimitUpto5,
  validateSearchPhotosCredentials,
} = require("./validations/index.validate");

const { Op } = require("sequelize");
const { getPhotosWitTags } = require("../helperFunctions/helper.js");

const createNewUser = async (req, res) => {
  let isValidDetails = validateUserCredentials(req.body);

  if (isValidDetails.length > 0) {
    return res.status(404).json({ errors: isValidDetails });
  }
  try {
    let { username, email } = req.body;

    let isValid = isValidEmail(email);

    if (!isValid) {
      return res.status(404).json({
        message: "Not a Valid Email",
      });
    }

    let existingEmail = await isExistingEmail(email);

    if (existingEmail) {
      return res.status(400).json({ message: "Email provided already exists" });
    }

    let newUser = {
      username,
      email,
    };

    let checkUserAllExists = await doesUserExist(newUser);

    if (checkUserAllExists) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    let createAUser = await userModel.create(newUser);

    if (!createAUser) {
      return res.status(400).json({ message: "Failed to Create User." });
    }

    res
      .status(201)
      .json({ message: "User Created successfully.", newUser: createAUser });
  } catch (error) {
    res.status(500).json({ error: `Failed to Create User.` });
  }
};

const savePhotosInCollection = async (req, res) => {
  try {
    let { imageUrl, description, altDescription, tags, userId } = req.body;

    let isValidImageUrl = validateImageUrl(imageUrl);

    if (!isValidImageUrl) {
      return res.status(400).json({ message: "Invalid image URL." });
    }

    let validatePhotoCredentials = validateCredentails({
      description,
      altDescription,
      tags,
      userId,
    });

    if (validatePhotoCredentials.length > 0) {
      return res.status(404).json({ errors: validatePhotoCredentials });
    }

    let photo = {
      imageUrl,
      description,
      altDescription,
      dateSaved: new Date(),
      tags,
      userId,
    };

    let newPhoto = await photoModel.create(photo);

    if (!newPhoto) {
      return res
        .status(400)
        .json({ message: "Something went wrong while, Creating photo" });
    }

    for (const tagName of tags) {
      await tagModel.create({ name: tagName, photoId: newPhoto.id });
    }

    res.status(201).json({ message: "Photo saved successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Failed to GET photos, since ${error.message}` });
  }
};

const getPhotos = async (req, res) => {
  try {
    let photos = await photoModel.findAll();

    if (!photos) {
      return res.status(404).json({ message: "Photos, NOT FOUND" });
    }

    res.status(200).json({ photos });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Failed to GET photos, since ${error.message}` });
  }
};

const addTagsForPhotos = async (req, res) => {
  try {
    let photoId = req.params.photoId;

    let { tages } = req.body;

    let isValidateTags = validateTags(tages, photoId);

    if (isValidateTags.length > 0) {
      return res.status(404).json({ errors: isValidateTags });
    }

    let setLimit = setLimitUpto5(tages);

    if (setLimit) {
      return res
        .status(400)
        .json({ message: "tags should not be greater then 5" });
    }

    for (let i = 0; i < tages.length; i++) {
      await tagModel.create({
        name: tages[i],
        photoId,
      });
    }

    let findPhotoWithPhotoId = await photoModel.findOne({
      where: { id: photoId },
    });

    if (!findPhotoWithPhotoId) {
      return res.status(404).json({ message: "Photo, NOT FOUND" });
    }

    res.status(201).json({ message: "Tags added successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Failed to GET photos, since ${error.message}` });
  }
};

const searchPhotosByTagsAndSortByDateSaved = async (req, res) => {
  try {
    let tags = req.query.tags;
    let sort = req.query.sort || "ASC";
    let userId = req.query.userId;

    let errors = validateSearchPhotosCredentials({ tags, sort });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (userId) {
      await searchHistoryModel.create({
        query: tags,
        userId,
        timestamp: new Date(),
      });
    }

    let searchForTags = await tagModel.findAll({
      where: { name: tags },
    });

    if (!searchForTags || searchForTags.length === 0) {
      return res.status(404).json({ message: "Tags not found." });
    }

    let photoIds = searchForTags.map((tag) => tag.photoId);

    let photos = await photoModel.findAll({
      where: { id: photoIds },
      order: [["dateSaved", sort.toUpperCase()]],
    });

    if (!photos || photos.length === 0) {
      return res.status(404).json({ message: "Photos not found." });
    }

    let photosData = await Promise.all(
      photos.map((photo) => getPhotosWitTags(photo.dataValues))
    );
    console.log(photosData);

    res.status(200).json({ photos: photosData });
  } catch (error) {
    console.error("Error fetching photos by tags:", error);
    res.status(500).json({ error: `Failed to fetch photos: ${error.message}` });
  }
};

const trackAndDisplaySearchHistory = async (req, res) => {
  try {
    let userId = req.query.userId;

    if (!userId || typeof userId !== "string") {
      return res.status(404).json({ message: "Credentails are required" });
    }

    let findHistoryOfCorrespondingUserId = await searchHistoryModel.findAll({
      where: { userId },
    });

    if (findHistoryOfCorrespondingUserId.length === 0) {
      return res.status(404).json({ message: "search History NOT FOUND" });
    }

    res.status(200).json({ searchHistory: findHistoryOfCorrespondingUserId });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Failed to GET Search History, since ${error.message}` });
  }
};

module.exports = {
  createNewUser,
  savePhotosInCollection,
  addTagsForPhotos,
  searchPhotosByTagsAndSortByDateSaved,
  getPhotos,
  trackAndDisplaySearchHistory,
};
