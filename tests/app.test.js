const request = require("supertest");
const { user, photo, tag, searchHistory } = require("../models");

let {
  validateUserCredentials,
  isExistingEmail,
  isValidEmail,
  validateImageUrl,
  validateCredentails,
  validateTags,
  setLimitUpto5,
  validateSearchPhotosCredentials,
} = require("../controllers/validations/index.validate.js");

let http = require("http");
const { app } = require("../index.js");
const { doesUserExist, validateQuery } = require("../service/index.service.js");
const { STRING } = require("sequelize");
const {
  createNewUser,
  addTagsForPhotos,
  savePhotosInCollection,
  searchPhotosByTagsAndSortByDateSaved,
  trackAndDisplaySearchHistory,
} = require("../controllers/dataController.js");
const { getPhotosWitTags } = require("../helperFunctions/helper.js");

// jest.requireActual(): This is used to import the actual code from the module, meaning we can mock some functions but keep others intact.
// jest.fn(): These mock functions will replace the original methods. They are useful when you want to control the behavior of those methods in your tests.

jest.mock("../controllers/validations/index.validate.js", () => ({
  ...jest.requireActual("../controllers/validations/index.validate.js"),
  validateUserCredentials: jest.fn(),
  isExistingEmail: jest.fn(),
  isValidEmail: jest.fn(),
  validateImageUrl: jest.fn(),
  validateCredentails: jest.fn(),
  validateTags: jest.fn(),
  setLimitUpto5: jest.fn(),
  validateSearchPhotosCredentials: jest.fn(),
}));

jest.mock("../service/index.service.js", () => ({
  ...jest.requireActual("../service/index.service.js"),
  doesUserExist: jest.fn(),
  validateQuery: jest.fn(),
}));

jest.mock("../helperFunctions/helper.js", () => ({
  ...jest.requireActual("../helperFunctions/helper.js"),
  getPhotosWitTags: jest.fn(),
}));

jest.mock("../models", () => ({
  user: {
    create: jest.fn(),
  },
  photo: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  tag: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
  searchHistory: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
}));

let server;

beforeAll((done) => {
  server = http.createServer(app);
  server.listen(3001, done);
});

afterAll((done) => {
  server.close(done);
});

describe("Integration Test and UNIT TEST for API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should return status 201 when a user is successfully created", async () => {
    const req = {
      body: {
        username: "JohnDoe",
        email: "johndoe@example.com",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    validateUserCredentials.mockReturnValue([]);
    isValidEmail.mockReturnValue(true);
    isExistingEmail.mockResolvedValue(false);
    doesUserExist.mockResolvedValue(false);

    user.create.mockResolvedValue({
      id: 1,
      username: req.body.username,
      email: req.body.email,
    });

    await createNewUser(req, res);

    expect(validateUserCredentials).toHaveBeenCalledWith(req.body);
    expect(isValidEmail).toHaveBeenCalledWith(req.body.email);
    expect(isExistingEmail).toHaveBeenCalledWith(req.body.email);
    expect(doesUserExist).toHaveBeenCalledWith({
      username: req.body.username,
      email: req.body.email,
    });
    expect(user.create).toHaveBeenCalledWith({
      username: req.body.username,
      email: req.body.email,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User Created successfully.",
      newUser: {
        id: 1,
        username: req.body.username,
        email: req.body.email,
      },
    });
  });

  it("should return status 201 when a photo is successfully saved", async () => {
    const req = {
      body: {
        imageUrl: "http://example.com/image.jpg",
        description: "A beautiful scenery",
        altDescription: "Scenery with mountains and lakes",
        tags: ["nature", "landscape"],
        userId: "123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    validateImageUrl.mockReturnValue(true);
    validateCredentails.mockReturnValue([]);

    photo.create.mockResolvedValue({
      id: 1,
      imageUrl: req.body.imageUrl,
      description: req.body.description,
      altDescription: req.body.altDescription,
      tags: req.body.tags,
      userId: req.body.userId,
    });

    tag.create.mockResolvedValue(true);

    await savePhotosInCollection(req, res);

    expect(validateImageUrl).toHaveBeenCalledWith(req.body.imageUrl);
    expect(validateCredentails).toHaveBeenCalledWith({
      description: req.body.description,
      altDescription: req.body.altDescription,
      tags: req.body.tags,
      userId: req.body.userId,
    });
    expect(photo.create).toHaveBeenCalledWith({
      imageUrl: req.body.imageUrl,
      description: req.body.description,
      altDescription: req.body.altDescription,
      dateSaved: expect.any(Date),
      tags: req.body.tags,
      userId: req.body.userId,
    });
    expect(tag.create).toHaveBeenCalledTimes(2);
    expect(tag.create).toHaveBeenCalledWith({
      name: "nature",
      photoId: 1,
    });
    expect(tag.create).toHaveBeenCalledWith({
      name: "landscape",
      photoId: 1,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Photo saved successfully",
    });
  });

  it("should return status 201 when tags are successfully added", async () => {
    const req = {
      params: { photoId: "1" },
      body: { tages: ["nature", "landscape"] },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    validateTags.mockReturnValue([]);
    setLimitUpto5.mockReturnValue(false);

    tag.create.mockResolvedValue(true);
    photo.findOne.mockResolvedValue({ id: "1" });

    await addTagsForPhotos(req, res);

    expect(validateTags).toHaveBeenCalledWith(["nature", "landscape"], "1");
    expect(setLimitUpto5).toHaveBeenCalledWith(["nature", "landscape"]);
    expect(tag.create).toHaveBeenCalledTimes(2);
    expect(photo.findOne).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Tags added successfully",
    });
  });
  it("should return status 200 and photos when tags are found and photos exist", async () => {
    const req = {
      query: {
        tags: ["nature", "travel"],
        sort: "DESC",
        userId: 1,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    validateSearchPhotosCredentials.mockReturnValue([]);

    tag.findAll.mockResolvedValue([{ photoId: 1 }, { photoId: 2 }]);

    photo.findAll.mockResolvedValue([
      {
        id: 1,
        dataValues: { id: 1, dateSaved: "2024-11-01", tags: ["nature"] },
      },
      {
        id: 2,
        dataValues: { id: 2, dateSaved: "2024-11-02", tags: ["travel"] },
      },
    ]);

    getPhotosWitTags.mockResolvedValueOnce({
      id: 1,
      dateSaved: "2024-11-01",
      tags: ["nature"],
    });

    getPhotosWitTags.mockResolvedValueOnce({
      id: 2,
      dateSaved: "2024-11-02",
      tags: ["travel"],
    });

    searchHistory.create.mockResolvedValue({});

    await searchPhotosByTagsAndSortByDateSaved(req, res);

    // Assertions
    expect(validateSearchPhotosCredentials).toHaveBeenCalledWith({
      tags: req.query.tags,
      sort: req.query.sort,
    });

    expect(tag.findAll).toHaveBeenCalledWith({
      where: { name: req.query.tags },
    });

    expect(photo.findAll).toHaveBeenCalledWith({
      where: { id: [1, 2] },
      order: [["dateSaved", "DESC"]],
    });

    expect(getPhotosWitTags).toHaveBeenCalledTimes(2);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      photos: [
        { id: 1, dateSaved: "2024-11-01", tags: ["nature"] },
        { id: 2, dateSaved: "2024-11-02", tags: ["travel"] },
      ],
    });
  });

  it("should return status 200 and search history when userId is valid", async () => {
    const req = {
      query: {
        userId: "user123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockSearchHistory = [
      { id: 1, query: "nature", userId: "user123", timestamp: "2024-11-01" },
      { id: 2, query: "travel", userId: "user123", timestamp: "2024-11-02" },
    ];

    searchHistory.findAll.mockResolvedValue(mockSearchHistory);

    await trackAndDisplaySearchHistory(req, res);

    expect(searchHistory.findAll).toHaveBeenCalledWith({
      where: { userId: "user123" },
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ searchHistory: mockSearchHistory });
  });

  it("should return status 404 when userId is missing or invalid", async () => {
    const req = {
      query: {
        userId: "",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await trackAndDisplaySearchHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Credentails are required",
    });
  });

  it("should return status 404 when no search history is found for the userId", async () => {
    const req = {
      query: {
        userId: "user123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    searchHistory.findAll.mockResolvedValue([]);

    await trackAndDisplaySearchHistory(req, res);

    expect(searchHistory.findAll).toHaveBeenCalledWith({
      where: { userId: "user123" },
    });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "search History NOT FOUND",
    });
  });

  it("should return status 500 when there is a server error", async () => {
    const req = {
      query: {
        userId: "user123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    searchHistory.findAll.mockRejectedValue(new Error("Database error"));

    await trackAndDisplaySearchHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to GET Search History, since Database error",
    });
  });
});
