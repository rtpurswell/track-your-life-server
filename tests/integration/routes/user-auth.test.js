const request = require("supertest");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../../../models/user");

let server = require("../../../app");
describe("USERS AND AUTH", () => {
  describe("/api/auth", () => {
    beforeEach(async () => {
      const password = await bcrypt.hash("12345678", 10);
      const user = new User({
        name: "Test User",
        email: "jake@test.com",
        password: password,
      });
      await user.save();
    });
    afterEach(async () => {
      await User.remove();
    });
    describe("POST /", () => {
      let requestBody;
      beforeEach(() => {
        requestBody = { email: "jake@test.com", password: "12345678" };
      });
      const exec = async () => {
        return await request(server).post("/api/auth").send(requestBody);
      };
      it("Should return 400 if the request is not valid", async () => {
        requestBody = {
          email: "jake@test.com",
          password: "12345678",
          extra: "asdfasdf",
        };

        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 400 if the email address is incorrect", async () => {
        requestBody.email = "asdf@Asdasd.com";
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return 400 if the password is incorrect", async () => {
        requestBody.password = "12345679";
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it("Should return a 200 response with a JWT in the header", async () => {
        const res = await exec();

        expect(res.status).toBe(200);
        expect(res.header[config.get("authTokenName")]).not.toBeNull();

        try {
          const decoded = jwt.verify(
            res.header[config.get("authTokenName")],
            config.get("jwtPrivateKey")
          );

          expect(decoded.email).toBe("jake@test.com");
        } catch (ex) {
          expect(null).not.toBeNull(); //This means that the JWT was not valid
        }
      });
    });
  });

  describe("/api/users", () => {
    afterEach(async () => {
      await User.remove();
    });
    describe("POST /", () => {
      let user;
      beforeEach(() => {
        user = {
          name: "Test User",
          email: "jake@test.com",
          password: "12345678",
        };
      });
      afterEach(async () => {
        await User.remove();
      });
      const exec = async () => {
        return await request(server).post("/api/users").send(user);
      };

      it("Should return 400 if it fails validation", async () => {
        user.name = "a";
        const res = await exec();

        expect(res.status).toBe(400);
      });
      it("Should return 400 if the user already exists", async () => {
        await new User(user).save();
        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("Should create a new user and return the JWT in the response header", async () => {
        const res = await exec();

        const newUser = User.findOne({ email: "jake@test.com" });
        expect(newUser).not.toBeNull();

        expect(res.header[config.get("authTokenName")]).not.toBeNull();

        try {
          const decoded = jwt.verify(
            res.header[config.get("authTokenName")],
            config.get("jwtPrivateKey")
          );

          expect(decoded.email).toBe("jake@test.com");
        } catch (ex) {
          expect(null).not.toBeNull(); //This means that the JWT was not valid
        }
      });
    });
    describe("/api/users/validate", () => {
      let user;
      let code;
      beforeEach(async () => {
        user = new User({
          name: "Test User",
          email: "jake@test.com",
          verified: false,
        });

        user.password = await User.hashPassword("12345678");
        await user.save();
      });
      afterEach(async () => {
        await User.remove();
      });
      describe("GET / ", () => {
        it("Should return 404 is the user doesnt exist", async () => {
          const res = await request(server)
            .get("/api/users/validate")
            .query({ code: code, email: "jake@test.commmm" });
          expect(res.status).toBe(404);
        });
        it("Should return 400 is the code is invalid", async () => {
          const res = await request(server)
            .get("/api/users/validate")
            .query({ code: "asdfasdfasdf", email: "jake@test.com" });
          expect(res.status).toBe(400);
        });
        it("Should validate the user if their code is correct.", async () => {
          code = await bcrypt.hash(user._id.toString(), 10);

          const res = await request(server)
            .get("/api/users/validate")
            .query({ code: code, email: "jake@test.com" });
          expect(res.status).toBe(200);
          expect(res.header[config.get("authTokenName")]).not.toBeNull();

          try {
            const decoded = jwt.verify(
              res.header[config.get("authTokenName")],
              config.get("jwtPrivateKey")
            );

            expect(decoded.email).toBe("jake@test.com");
          } catch (ex) {
            expect(null).not.toBeNull(); //This means that the JWT was not valid
          }
        });
      });
    });
  });
});
