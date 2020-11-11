const request = require("supertest");
const config = require("config");
const mongoose = require("mongoose");

const { HabbitCategory } = require("../../../models/habbitCategory");
const { User } = require("../../../models/user");

let server = require("../../../app");
let token;
let user;

describe("/api/habbits/categories", () => {
  beforeEach(() => {
    user = new User({ name: "Test Name", email: "test@test.com" });
    token = user.generateAuthToken();
  });
  afterEach(async () => {
    await HabbitCategory.remove({});
  });

  describe("GET /", () => {
    const exec = async () => {
      return await request(server)
        .get("/api/habbits/categories")
        .set(config.get("authTokenName"), token);
    };
    it("Should get 401 error if token is invalid", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return all idea boards for the signed in user", async () => {
      await HabbitCategory.insertMany([
        {
          userId: user._id,
          name: "Category 0",
          color: config.get("appColors")[0],
        },
        {
          userId: user._id,
          name: "Category 0",
          color: config.get("appColors")[0],
        },
        {
          userId: mongoose.Types.ObjectId(),
          name: "Category 0",
          color: config.get("appColors")[0],
        },
      ]);
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe("GET /:id", () => {
    it("Should return 401 if the user does not provide a valid token", async () => {
      const res = await request(server)
        .get(`/api/habbits/categories/${mongoose.Types.ObjectId()}`)
        .set(config.get("authTokenName"), "");
      expect(res.status).toBe(401);
    });
    it("Should return 400 if the object Id is invalid", async () => {
      const res = await request(server)
        .get(`/api/habbits/categories/1246`)
        .set(config.get("authTokenName"), token);
      expect(res.status).toBe(400);
    });
    it("Should return 404 if the user is not the owner of the HabbitCategory", async () => {
      const habbitCategory = new HabbitCategory({
        userId: mongoose.Types.ObjectId(),
        name: "Category 0",
        color: config.get("appColors")[0],
      });
      await habbitCategory.save();
      const res = await request(server)
        .get(`/api/habbits/categories/${habbitCategory._id}`)
        .set(config.get("authTokenName"), token);
      expect(res.status).toBe(404);
    });
    it("Should return 404 if it does not find an object with the given id", async () => {
      const habbitCategory = new HabbitCategory({
        userId: user._id,
        name: "Category 0",
        color: config.get("appColors")[0],
      });
      await habbitCategory.save();

      const res = await request(server)
        .get(`/api/habbits/categories/${mongoose.Types.ObjectId()}`)
        .set(config.get("authTokenName"), token);
      expect(res.status).toBe(404);
    });
    it("Should return a valid HabbitCategory if the user is signed in and provided an existing Id", async () => {
      const habbitCategory = new HabbitCategory({
        userId: user._id,
        name: "Category 0",
        color: config.get("appColors")[0],
      });
      await habbitCategory.save();

      const res = await request(server)
        .get(`/api/habbits/categories/${habbitCategory._id}`)
        .set(config.get("authTokenName"), token);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Category 0");
    });
  });

  describe("POST /", () => {
    let habbitCategory;
    beforeEach(() => {
      habbitCategory = {
        name: "Category 0",
        color: config.get("appColors")[0],
      };
    });

    const exec = async () => {
      return await request(server)
        .post("/api/habbits/categories")
        .set(config.get("authTokenName"), token)
        .send(habbitCategory);
    };
    it("Should return 401 if the user does not provide a valid token", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if the HabbitCategory does not pass validation", async () => {
      habbitCategory.name = 0;
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should save HabbitCategory to database if it is valid and user is signed in", async () => {
      const res = await exec();

      const habbitCategory = await HabbitCategory.findOne({
        userId: user._id,
        name: "Category 0",
      });
      expect(habbitCategory).not.toBeNull();
      expect(habbitCategory.color).toBe(config.get("appColors")[0]);
    });
  });

  describe("PUT /:id", () => {
    let habbitCategory;
    let sampleHabbitCategory;
    beforeEach(async () => {
      habbitCategory = {
        name: "Category 0",
        color: config.get("appColors")[0],
      };
      sampleHabbitCategory = new HabbitCategory(habbitCategory);
      sampleHabbitCategory.set({ userId: user._id });
      await sampleHabbitCategory.save();
    });

    const exec = async () => {
      return await request(server)
        .put(`/api/habbits/categories/${sampleHabbitCategory._id}`)
        .set(config.get("authTokenName"), token)
        .send(habbitCategory);
    };

    it("Should return 401 if the user does not provide a valid token", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if Object ID is invalid", async () => {
      const res = await request(server)
        .put(`/api/habbits/categories/1245`)
        .set(config.get("authTokenName"), token)
        .send(habbitCategory);
      expect(res.status).toBe(400);
    });
    it("Should return 404 if Object Id is not found", async () => {
      const res = await request(server)
        .put(`/api/habbits/categories/${mongoose.Types.ObjectId()}`)
        .set(config.get("authTokenName"), token)
        .send(habbitCategory);
      expect(res.status).toBe(404);
    });
    it("Should return 404 if the user does not own the HabbitCategory", async () => {
      token = new User({
        name: "Test Name",
        email: "test@test.com",
      }).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(404);
    });
    it("Should return 400 if the validation fails", async () => {
      habbitCategory.name = "a";
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should update the existing HabbitCategory if input is valid and user owns it", async () => {
      habbitCategory.name = "Changed Name";
      const res = await exec();

      const habbitCategorySearch = await HabbitCategory.findOne({
        userId: user._id,
        _id: sampleHabbitCategory._id,
        name: "Changed Name",
      });
      expect(habbitCategorySearch).not.toBeNull();
    });
  });

  describe("PATCH /:id", () => {
    let habbitCategory;
    let sampleHabbitCategory;
    beforeEach(async () => {
      habbitCategory = {
        name: "Category 1",
        color: config.get("appColors")[0],
      };
      sampleHabbitCategory = new HabbitCategory(habbitCategory);
      sampleHabbitCategory.set({ userId: user._id });
      await sampleHabbitCategory.save();
      delete habbitCategory.color;
    });

    const exec = async () => {
      return await request(server)
        .patch(`/api/habbits/categories/${sampleHabbitCategory._id}`)
        .set(config.get("authTokenName"), token)
        .send(habbitCategory);
    };

    it("Should return 401 if the user does not provide a valid token", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if Object ID is invalid", async () => {
      const res = await request(server)
        .patch(`/api/habbits/categories/1245`)
        .set(config.get("authTokenName"), token)
        .send(habbitCategory);
      expect(res.status).toBe(400);
    });
    it("Should return 404 if Object Id is not found", async () => {
      const res = await request(server)
        .patch(`/api/habbits/categories/${mongoose.Types.ObjectId()}`)
        .set(config.get("authTokenName"), token)
        .send(habbitCategory);

      expect(res.status).toBe(404);
    });
    it("Should return 404 if the user does not own the HabbitCategory", async () => {
      token = new User({
        name: "Test Name",
        email: "test@test.com",
      }).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(404);
    });
    it("Should return 400 if the validation fails", async () => {
      habbitCategory.name = "a";
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if any extra fields are added", async () => {
      habbitCategory.userId = user._id;
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should update the existing HabbitCategory if input is valid and user owns it", async () => {
      habbitCategory.name = "Changed Name";
      const res = await exec();

      const habbitCategorySearch = await HabbitCategory.findOne({
        userId: user._id,
        _id: sampleHabbitCategory._id,
        name: "Changed Name",
      });
      expect(habbitCategorySearch).not.toBeNull();
    });
  });

  describe("DELETE /:id", () => {
    let habbitCategory;
    let sampleHabbitCategory;
    let sampleHabbitCategory2;
    let replacedBy;
    beforeEach(async () => {
      habbitCategory = {
        userId: user._id,
        name: "Category 0",
        color: config.get("appColors")[0],
      };

      sampleHabbitCategory = new HabbitCategory(habbitCategory);
      sampleHabbitCategory.set({ userId: user._id });
      await sampleHabbitCategory.save();
      sampleHabbitCategory2 = new HabbitCategory(habbitCategory);
      sampleHabbitCategory2.set({ userId: user._id });
      await sampleHabbitCategory2.save();
      replacedBy = sampleHabbitCategory2._id;
    });
    const exec = async () => {
      return await request(server)
        .delete(`/api/habbits/categories/${sampleHabbitCategory._id}`)
        .set(config.get("authTokenName"), token)
        .send({ replacedBy: replacedBy });
    };
    it("Should return 401 if the token is invalid", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if replacedBy is missing", async () => {
      replacedBy = "";
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if replacedBy is invalid", async () => {
      replacedBy = "asdfasdf";
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if you try to delete the last category", async () => {
      await HabbitCategory.deleteOne({ _id: sampleHabbitCategory2._id });
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should delete the record if the user owns it", async () => {
      const res = await exec();
      const search = await HabbitCategory.findOne({
        _id: sampleHabbitCategory._id,
      });
      expect(search).toBeNull();
      expect(res.body.n).toBe(1);
      expect(res.body.deletedCount).toBe(1);
    });
  });
});
