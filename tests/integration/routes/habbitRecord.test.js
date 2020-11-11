//NEED TO ADD it Statements for if user tries to delete a record they do not own
//
const request = require("supertest");
const config = require("config");
const mongoose = require("mongoose");

const { HabbitRecord } = require("../../../models/habbitRecord");
const { User } = require("../../../models/user");

let server = require("../../../app");
let token;
let user;
describe("/api/habbits/records", () => {
  beforeEach(() => {
    user = new User({ name: "Test Name", email: "test@test.com" });
    token = user.generateAuthToken();
  });
  afterEach(async () => {
    await HabbitRecord.remove({});
  });

  describe("GET / ", () => {
    const exec = async () => {
      return await request(server)
        .get("/api/habbits/records")
        .set(config.get("authTokenName"), token);
    };
    it("Should get 401 error if token is invalid", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if the startDate is invalid", async () => {
      const res = await request(server)
        .get("/api/habbits/records")
        .set(config.get("authTokenName"), token)
        .query({ startDate: "asdfasdf", endDate: "2020-06-20" });
      expect(res.status).toBe(400);
    });
    it("Should return 400 if the endDate is invalid", async () => {
      const res = await request(server)
        .get("/api/habbits/records")
        .set(config.get("authTokenName"), token)
        .query({ startDate: "2020-05-20", endDate: "asdfasdf" });
      expect(res.status).toBe(400);
    });
    it("Should only return the habbit records that is within the date range", async () => {
      await HabbitRecord.insertMany([
        {
          userId: user._id,
          habbitId: "5fa74048d611ec711ecab478",
          date: "2020-05-01",
        },
        {
          userId: user._id,
          habbitId: "5fa74048d611ec711ecab478",
          date: "2020-06-01",
        },
        {
          userId: user._id,
          habbitId: "5fa74048d611ec711ecab478",
          date: "2020-07-01",
        },
      ]);
      const res = await request(server)
        .get("/api/habbits/records")
        .set(config.get("authTokenName"), token)
        .query({ startDate: "2020-05-20", endDate: "2020-06-20" });

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });
    it("Should return all habbit notes for the signed in user", async () => {
      await HabbitRecord.insertMany([
        {
          userId: user._id,
          habbitId: "5fa74048d611ec711ecab478",
          date: "2020-05-01",
        },
        {
          userId: user._id,
          habbitId: "5fa74048d611ec711ecab478",
          date: "2020-05-01",
        },
        {
          userId: mongoose.Types.ObjectId(),
          habbitId: "5fa74048d611ec711ecab478",
          date: "2020-05-01",
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
        .get(`/api/habbits/records/${mongoose.Types.ObjectId()}`)
        .set(config.get("authTokenName"), "");
      expect(res.status).toBe(401);
    });
    it("Should return 400 if the object Id is invalid", async () => {
      const res = await request(server)
        .get(`/api/habbits/records/1246`)
        .set(config.get("authTokenName"), token);
      expect(res.status).toBe(400);
    });
    it("Should return 404 if the user is not the owner of the Habbit Note", async () => {
      const habbitRecord = new HabbitRecord({
        userId: mongoose.Types.ObjectId(),
        habbitId: "5fa74048d611ec711ecab478",
      });
      await habbitRecord.save();
      const res = await request(server)
        .get(`/api/habbits/records/${habbitRecord._id}`)
        .set(config.get("authTokenName"), token);
      expect(res.status).toBe(404);
    });
    it("Should return 404 if it does not find an object with the given id", async () => {
      const habbitRecord = new HabbitRecord({
        userId: user._id,
        habbitId: "5fa74048d611ec711ecab478",
      });
      await habbitRecord.save();

      const res = await request(server)
        .get(`/api/habbits/records/${mongoose.Types.ObjectId()}`)
        .set(config.get("authTokenName"), token);
      expect(res.status).toBe(404);
    });
    it("Should return a valid HabbitRecord if the user is signed in and provided an existing Id", async () => {
      const habbitRecord = new HabbitRecord({
        userId: user._id,
        habbitId: "5fa74048d611ec711ecab478",
      });
      await habbitRecord.save();

      const res = await request(server)
        .get(`/api/habbits/records/${habbitRecord._id}`)
        .set(config.get("authTokenName"), token);
      expect(res.status).toBe(200);
      expect(res.body.habbitId.toString()).toBe("5fa74048d611ec711ecab478");
    });
  });

  describe("POST /", () => {
    let habbitRecord;
    beforeEach(() => {
      habbitRecord = {
        habbitId: "5fa74048d611ec711ecab478",
      };
    });

    const exec = async () => {
      return await request(server)
        .post("/api/habbits/records")
        .set(config.get("authTokenName"), token)
        .send(habbitRecord);
    };
    it("Should return 401 if the user does not provide a valid token", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if the HabbitRecord does not pass validation", async () => {
      habbitRecord.habbitId = 0;
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should save HabbitRecord to database if it is valid and user is signed in", async () => {
      const res = await exec();

      const habbitRecord = await HabbitRecord.findOne({
        userId: user._id,
        _id: res.body._id,
      });
      expect(habbitRecord).not.toBeNull();
      expect(habbitRecord.habbitId.toString()).toBe("5fa74048d611ec711ecab478");
    });
  });

  describe("PUT /:id", () => {
    let habbitRecord;
    let sampleHabbitRecord;
    beforeEach(async () => {
      habbitRecord = {
        habbitId: "5fa74048d611ec711ecab478",
      };
      sampleHabbitRecord = new HabbitRecord(habbitRecord);
      sampleHabbitRecord.set({ userId: user._id });
      await sampleHabbitRecord.save();
    });

    const exec = async () => {
      return await request(server)
        .put(`/api/habbits/records/${sampleHabbitRecord._id}`)
        .set(config.get("authTokenName"), token)
        .send(habbitRecord);
    };

    it("Should return 401 if the user does not provide a valid token", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if Object ID is invalid", async () => {
      const res = await request(server)
        .put(`/api/habbits/records/1245`)
        .set(config.get("authTokenName"), token)
        .send(habbitRecord);
      expect(res.status).toBe(400);
    });
    it("Should return 404 if Object Id is not found", async () => {
      const res = await request(server)
        .put(`/api/habbits/records/${mongoose.Types.ObjectId()}`)
        .set(config.get("authTokenName"), token)
        .send(habbitRecord);
      expect(res.status).toBe(404);
    });
    it("Should return 404 if the user does not own the HabbitRecord", async () => {
      token = new User({
        name: "Test Name",
        email: "test@test.com",
      }).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(404);
    });
    it("Should return 400 if the validation fails", async () => {
      habbitRecord.date = "a";
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should update the existing HabbitRecord if input is valid and user owns it", async () => {
      habbitRecord.date = "2021-01-01";
      const res = await exec();
      const habbitRecordSearch = await HabbitRecord.findOne({
        userId: user._id,
        _id: sampleHabbitRecord._id,
        date: "2021-01-01",
      });
      expect(habbitRecordSearch).not.toBeNull();
    });
  });

  describe("PATCH /:id", () => {
    let habbitRecord;
    let sampleHabbitRecord;
    beforeEach(async () => {
      habbitRecord = {
        date: "2021-01-01",
        habbitId: "5fa74048d611ec711ecab478",
      };
      sampleHabbitRecord = new HabbitRecord(habbitRecord);
      sampleHabbitRecord.set({ userId: user._id });
      await sampleHabbitRecord.save();
      delete habbitRecord.habbitId;
    });

    const exec = async () => {
      return await request(server)
        .patch(`/api/habbits/records/${sampleHabbitRecord._id}`)
        .set(config.get("authTokenName"), token)
        .send(habbitRecord);
    };

    it("Should return 401 if the user does not provide a valid token", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if Object ID is invalid", async () => {
      const res = await request(server)
        .patch(`/api/habbits/records/1245`)
        .set(config.get("authTokenName"), token)
        .send(habbitRecord);
      expect(res.status).toBe(400);
    });
    it("Should return 404 if Object Id is not found", async () => {
      const res = await request(server)
        .patch(`/api/habbits/records/${mongoose.Types.ObjectId()}`)
        .set(config.get("authTokenName"), token)
        .send(habbitRecord);
      expect(res.status).toBe(404);
    });
    it("Should return 404 if the user does not own the HabbitRecord", async () => {
      token = new User({
        name: "Test Name",
        email: "test@test.com",
      }).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(404);
    });
    it("Should return 400 if the validation fails", async () => {
      habbitRecord.date = "a";
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should return 400 if any fields are added", async () => {
      habbitRecord.extra = "a";
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should update the existing HabbitRecord if input is valid and user owns it", async () => {
      const res = await exec();
      const habbitRecordSearch = await HabbitRecord.findOne({
        userId: user._id,
        _id: sampleHabbitRecord._id,
        date: "2021-01-01",
      });
      expect(habbitRecordSearch).not.toBeNull();
    });
  });

  describe("DELETE /:id", () => {
    let habbitRecord;
    let sampleHabbitRecord;
    beforeEach(async () => {
      habbitRecord = {
        habbitId: "5fa74048d611ec711ecab478",
      };
      sampleHabbitRecord = new HabbitRecord(habbitRecord);
      sampleHabbitRecord.set({ userId: user._id });
      await sampleHabbitRecord.save();
    });
    const exec = async () => {
      return await request(server)
        .delete(`/api/habbits/records/${sampleHabbitRecord._id}`)
        .set(config.get("authTokenName"), token);
    };
    it("Should return 401 if the token is invalid", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should delete the record if the user owns it", async () => {
      const res = await exec();

      const search = await HabbitRecord.findOne({
        _id: sampleHabbitRecord._id,
      });
      expect(search).toBeNull();
      expect(res.body.n).toBe(1);
      expect(res.body.deletedCount).toBe(1);
    });
  });
});
