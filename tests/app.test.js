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

let server;

beforeAll((done) => {
  server = http.createServer(app);
  server.listen(3001, done);
});

afterAll((done) => {
  server.close(done);
});

describe("FUNCTIONS TESTS", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("POST /api/users shold be able to Create user ", () => {
    it("validateUserCredentials should return an array that contains errors messages in it with users VALID INPUT", () => {
      let userDetails = { username: "Atharva", email: "koli@gmail.com" };

      validateUserCredentials.mockRuturnValue([]);

      let errors = validateUserCredentials(userDetails);
      expect(errors).toEqual([]);
      expect(errors.length).toEqual(0);
    });
  });
});
