const request = require("supertest");
const config = require("config");
const mongoose = require("mongoose");

const { IdeaBoard } = require("../../../models/ideaBoard");
const { User } = require("../../../models/user");

let server = require("../../../app");
let token;
let user;

describe("/api/ideas", () => {
  beforeEach(() => {
    user = new User({ name: "Test Name", email: "test@test.com" });
    token = user.generateAuthToken();
  });
  afterEach(async () => {
    await IdeaBoard.remove({});
  });

  describe("GET /", () => {
    const exec = async () => {
      return await request(server)
        .get("/api/ideas")
        .set(config.get("authTokenName"), token);
    };
    it("Should get 401 error if token is invalid", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return all idea boards for the signed in user", async () => {
      await IdeaBoard.insertMany([
        {
          userId: user._id,
          name: "Idea Board 2",
          description: "test 2",
          color: config.get("appColors")[0],
          ideas: [
            {
              name: "Idea1",
              color: "red",
              description: "Thi is it",
              notes: [
                {
                  color: "red",
                  description: "idea Note",
                },
              ],
            },
          ],
          notes: [
            {
              color: "red",
              description: "Note 1",
            },
            {
              color: "red",
              description: "Note 2",
            },
          ],
        },
        {
          userId: user._id,
          name: "Idea Board 3",
          description: "test 3",
          color: config.get("appColors")[0],
          ideas: [
            {
              name: "Idea1",
              color: "red",
              description: "Thi is it",
              notes: [
                {
                  color: "red",
                  description: "idea Note",
                },
              ],
            },
          ],
          notes: [
            {
              color: "red",
              description: "Note 1",
            },
            {
              color: "red",
              description: "Note 2",
            },
          ],
        },
        {
          userId: mongoose.Types.ObjectId(),
          name: "Idea Board 3",
          description: "test 3",
          color: config.get("appColors")[0],
          ideas: [
            {
              name: "Idea1",
              color: "red",
              description: "Thi is it",
              notes: [
                {
                  color: "red",
                  description: "idea Note",
                },
              ],
            },
          ],
          notes: [
            {
              color: "red",
              description: "Note 1",
            },
            {
              color: "red",
              description: "Note 2",
            },
          ],
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
        .get(`/api/ideas/${mongoose.Types.ObjectId()}`)
        .set(config.get("authTokenName"), "");
      expect(res.status).toBe(401);
    });
    it("Should return 400 if the object Id is invalid", async () => {
      const res = await request(server)
        .get(`/api/ideas/1246`)
        .set(config.get("authTokenName"), token);
      expect(res.status).toBe(400);
    });
    it("Should return 404 if the user is not the owner of the IdeaBoard", async () => {
      const ideaBoard = new IdeaBoard({
        userId: mongoose.Types.ObjectId(),
        name: "Idea Board 2",
        description: "test 2",
        color: config.get("appColors")[0],
        ideas: [
          {
            name: "Idea1",
            color: "red",
            description: "Thi is it",
            notes: [
              {
                color: "red",
                description: "idea Note",
              },
            ],
          },
        ],
        notes: [
          {
            color: "red",
            description: "Note 1",
          },
          {
            color: "red",
            description: "Note 2",
          },
        ],
      });
      await ideaBoard.save();
      const res = await request(server)
        .get(`/api/ideas/${ideaBoard._id}`)
        .set(config.get("authTokenName"), token);
      expect(res.status).toBe(404);
    });
    it("Should return 404 if it does not find an object with the given id", async () => {
      const ideaBoard = new IdeaBoard({
        userId: user._id,
        name: "Idea Board 2",
        description: "test 2",
        color: config.get("appColors")[0],
        ideas: [
          {
            name: "Idea1",
            color: "red",
            description: "Thi is it",
            notes: [
              {
                color: "red",
                description: "idea Note",
              },
            ],
          },
        ],
        notes: [
          {
            color: "red",
            description: "Note 1",
          },
          {
            color: "red",
            description: "Note 2",
          },
        ],
      });
      await ideaBoard.save();

      const res = await request(server)
        .get(`/api/ideas/${mongoose.Types.ObjectId()}`)
        .set(config.get("authTokenName"), token);
      expect(res.status).toBe(404);
    });
    it("Should return a valid IdeaBoard if the user is signed in and provided an existing Id", async () => {
      const ideaBoard = new IdeaBoard({
        userId: user._id,
        name: "Idea Board 2",
        description: "test 2",
        color: config.get("appColors")[0],
        ideas: [
          {
            name: "Idea1",
            color: "red",
            description: "Thi is it",
            notes: [
              {
                color: "red",
                description: "idea Note",
              },
            ],
          },
        ],
        notes: [
          {
            color: "red",
            description: "Note 1",
          },
          {
            color: "red",
            description: "Note 2",
          },
        ],
      });
      await ideaBoard.save();

      const res = await request(server)
        .get(`/api/ideas/${ideaBoard._id}`)
        .set(config.get("authTokenName"), token);
      expect(res.status).toBe(200);
      expect(res.body.description).toBe("test 2");
    });
  });

  describe("POST /", () => {
    let ideaBoard;
    beforeEach(() => {
      ideaBoard = {
        name: "Idea Board 2",
        description: "test 2",
        color: config.get("appColors")[0],
        ideas: [
          {
            name: "Idea1",
            color: config.get("appColors")[0],
            description: "Thi is it",
            notes: [
              {
                color: config.get("appColors")[0],
                description: "idea Note",
              },
            ],
          },
        ],
        notes: [
          {
            color: config.get("appColors")[0],
            description: "Note 1",
          },
          {
            color: config.get("appColors")[0],
            description: "Note 2",
          },
        ],
      };
    });

    const exec = async () => {
      return await request(server)
        .post("/api/ideas")
        .set(config.get("authTokenName"), token)
        .send(ideaBoard);
    };
    it("Should return 401 if the user does not provide a valid token", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if the IdeaBoard does not pass validation", async () => {
      ideaBoard.name = 0;
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should save IdeaBoard to database if it is valid and user is signed in", async () => {
      const res = await exec();

      const ideaBoard = await IdeaBoard.findOne({
        userId: user._id,
        name: "Idea Board 2",
      });
      expect(ideaBoard).not.toBeNull();
      expect(ideaBoard.notes[0].color).toBe(config.get("appColors")[0]);
    });
  });

  describe("PUT /:id", () => {
    let ideaBoard;
    let sampleIdeaBoard;
    beforeEach(async () => {
      ideaBoard = {
        name: "Idea Board 2",
        description: "test 2",
        color: config.get("appColors")[0],
        ideas: [
          {
            name: "Idea1",
            color: config.get("appColors")[0],
            description: "Thi is it",
            notes: [
              {
                color: config.get("appColors")[0],
                description: "idea Note",
              },
            ],
          },
        ],
        notes: [
          {
            color: config.get("appColors")[0],
            description: "Note 1",
          },
          {
            color: config.get("appColors")[0],
            description: "Note 2",
          },
        ],
      };
      sampleIdeaBoard = new IdeaBoard(ideaBoard);
      sampleIdeaBoard.set({ userId: user._id });
      await sampleIdeaBoard.save();
    });

    const exec = async () => {
      return await request(server)
        .put(`/api/ideas/${sampleIdeaBoard._id}`)
        .set(config.get("authTokenName"), token)
        .send(ideaBoard);
    };

    it("Should return 401 if the user does not provide a valid token", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should return 400 if Object ID is invalid", async () => {
      const res = await request(server)
        .put(`/api/ideas/1245`)
        .set(config.get("authTokenName"), token)
        .send(ideaBoard);
      expect(res.status).toBe(400);
    });
    it("Should return 404 if Object Id is not found", async () => {
      const res = await request(server)
        .put(`/api/ideas/${mongoose.Types.ObjectId()}`)
        .set(config.get("authTokenName"), token)
        .send(ideaBoard);
      expect(res.status).toBe(404);
    });
    it("Should return 404 if the user does not own the IdeaBoard", async () => {
      token = new User({
        name: "Test Name",
        email: "test@test.com",
      }).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(404);
    });
    it("Should return 400 if the validation fails", async () => {
      ideaBoard.name = "a";
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("Should update the existing IdeaBoard if input is valid and user owns it", async () => {
      ideaBoard.name = "Changed Name";
      const res = await exec();

      const ideaBoardSearch = await IdeaBoard.findOne({
        userId: user._id,
        _id: sampleIdeaBoard._id,
        name: "Changed Name",
      });
      expect(ideaBoardSearch).not.toBeNull();
    });
  });

  describe("DELETE /:id", () => {
    let ideaBoard;
    let sampleIdeaBoard;
    beforeEach(async () => {
      ideaBoard = {
        name: "Idea Board 2",
        description: "test 2",
        color: config.get("appColors")[0],
        ideas: [
          {
            name: "Idea1",
            color: config.get("appColors")[0],
            description: "Thi is it",
            notes: [
              {
                color: config.get("appColors")[0],
                description: "idea Note",
              },
            ],
          },
        ],
        notes: [
          {
            color: config.get("appColors")[0],
            description: "Note 1",
          },
          {
            color: config.get("appColors")[0],
            description: "Note 2",
          },
        ],
      };
      sampleIdeaBoard = new IdeaBoard(ideaBoard);
      sampleIdeaBoard.set({ userId: user._id });
      await sampleIdeaBoard.save();
    });
    const exec = async () => {
      return await request(server)
        .delete(`/api/ideas/${sampleIdeaBoard._id}`)
        .set(config.get("authTokenName"), token);
    };
    it("Should return 401 if the token is invalid", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it("Should delete the record if the user owns it", async () => {
      const res = await exec();

      const search = await IdeaBoard.findOne({ _id: sampleIdeaBoard._id });
      expect(search).toBeNull();
      expect(res.body.n).toBe(1);
      expect(res.body.deletedCount).toBe(1);
    });
  });
});
