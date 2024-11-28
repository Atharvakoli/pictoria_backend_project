const express = require("express");
const cors = require("cors");
require("dotenv").config();
const {
  createNewUser,
  savePhotosInCollection,
  addTagsForPhotos,
  searchPhotosByTagsAndSortByDateSaved,
  getPhotos,
  trackAndDisplaySearchHistory,
} = require("./controllers/dataController");
const { searchImages } = require("./controllers/unsplashController");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Photo curation App");
});

app.post("/api/users", createNewUser);
app.post("/api/photos", savePhotosInCollection);
app.post("/api/photos/:photoId/tags", addTagsForPhotos);

app.get("/api/photos/search", searchImages);
app.get("/api/photos/tag/search", searchPhotosByTagsAndSortByDateSaved);
app.get("/api/photos", getPhotos);
app.get("/api/search-history", trackAndDisplaySearchHistory);

module.exports = { app };
