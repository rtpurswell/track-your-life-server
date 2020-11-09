const request = require("supertest");
const config = require("config");
const mongoose = require("mongoose");

const {HabbitNote} = require("../../../models/habbitNote");
const {User} = require("../../../models/user");

let server= require("../../../app");
let token;
let user;
describe("/api/habbits/notes",()=>{
    beforeEach(()=>{   
        user = new User({name:"Test Name", email:"test@test.com"});
        token = user.generateAuthToken();
    });
    afterEach(async () => { 
        await HabbitNote.remove({});
    });
     
    describe("GET / ",()=>{
        const  exec =async () => {
            return await request(server).get("/api/habbits/notes").set(config.get("authTokenName"),token);
        }
        it("Should get 401 error if token is invalid",async()=>{
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it("Should return 400 if the startDate is invalid",async()=>{
            const res = await request(server).get("/api/habbits/notes").set(config.get("authTokenName"),token).query({startDate:"asdfasdf",endDate:"2020-06-20"});
            expect(res.status).toBe(400);
        });
        it("Should return 400 if the endDate is invalid",async()=>{
            const res = await request(server).get("/api/habbits/notes").set(config.get("authTokenName"),token).query({startDate:"2020-05-20",endDate:"asdfasdf"});
            expect(res.status).toBe(400);

        });
        it("Should only return the habbit that is within the date range",async()=>{
            await HabbitNote.insertMany([{
                userId:user._id,
                "description":"Test Note",
                "categoryId":"5fa74048d611ec711ecab478",
                "date" : "2020-05-01"
            },
            {
                userId:user._id,
                "description":"Test Note",
                "categoryId":"5fa74048d611ec711ecab478",
                "date" : "2020-06-01"
            },
            {
                userId:user._id,
                "description":"Test Note",
                "categoryId":"5fa74048d611ec711ecab478",
                "date" : "2020-07-01"
            }]);
            const res = await request(server).get("/api/habbits/notes").set(config.get("authTokenName"),token).query({startDate:"2020-05-20",endDate:"2020-06-20"});

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1)
        });
        it("Should return all habbit notes for the signed in user", async ()=>{
            await HabbitNote.insertMany([{
                userId:user._id,
                "description":"Test Note",
                "categoryId":"5fa74048d611ec711ecab478"
            },
            {
                userId:user._id,
                "description":"Test Note",
                "categoryId":"5fa74048d611ec711ecab478"
            },
            {
                userId:mongoose.Types.ObjectId(),
                "description":"Test Note",
                "categoryId":"5fa74048d611ec711ecab478"
            }]);
            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
        });
    });

    describe("GET /:id", ()=>{
        
        it("Should return 401 if the user does not provide a valid token", async ()=>{
            const res = await request(server).get(`/api/habbits/notes/${mongoose.Types.ObjectId()}`).set(config.get("authTokenName"),"");
            expect(res.status).toBe(401);
        });
        it("Should return 400 if the object Id is invalid", async ()=> {
            const res = await request(server).get(`/api/habbits/notes/1246`).set(config.get("authTokenName"),token);
            expect(res.status).toBe(400);

        });
        it("Should return 404 if the user is not the owner of the Habbit Note", async ()=>{
            const habbitNote = new HabbitNote({
                userId:mongoose.Types.ObjectId(),
                "description":"Test Note",
                "categoryId":"5fa74048d611ec711ecab478"
            });
            await habbitNote.save()
            const res = await request(server).get(`/api/habbits/notes/${habbitNote._id}`).set(config.get("authTokenName"),token);
            expect(res.status).toBe(404);

        });
        it("Should return 404 if it does not find an object with the given id",async ()=>{
            const habbitNote = new HabbitNote({
                userId:user._id,
                "description":"Test Note",
                "categoryId":"5fa74048d611ec711ecab478"
            });
            await habbitNote.save()

           const res = await request(server).get(`/api/habbits/notes/${mongoose.Types.ObjectId()}`).set(config.get("authTokenName"),token);
           expect(res.status).toBe(404);
        });
        it("Should return a valid HabbitNote if the user is signed in and provided an existing Id",async ()=>{
            const habbitNote = new HabbitNote({
                userId:user._id,
                "description":"Test Note",
                "categoryId":"5fa74048d611ec711ecab478"
            });
            await habbitNote.save()

           const res = await request(server).get(`/api/habbits/notes/${habbitNote._id}`).set(config.get("authTokenName"),token);
           expect(res.status).toBe(200);
           expect(res.body.description).toBe("Test Note");
        });
    });

    describe("POST /",()=>{
        let habbitNote;
        beforeEach(()=>{
             habbitNote = {
                "description":"Test Note",
                "categoryId":"5fa74048d611ec711ecab478"
            };
        });
        
        const  exec =async () => {
            return await request(server).post("/api/habbits/notes").set(config.get("authTokenName"),token).send(habbitNote);
        }
        it("Should return 401 if the user does not provide a valid token", async ()=>{
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it("Should return 400 if the HabbitNote does not pass validation", async ()=>{
            habbitNote.categoryId = 0;
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it("Should save HabbitNote to database if it is valid and user is signed in", async ()=>{
            const res = await exec();
            
            const habbitNote = await HabbitNote.findOne({userId:user._id, categoryId:"5fa74048d611ec711ecab478"});
            expect(habbitNote).not.toBeNull();
            expect(habbitNote.description).toBe("Test Note");
        });

    });

    describe("PUT /:id",()=>{
        let habbitNote;
        let sampleHabbitNote;
        beforeEach(async ()=>{
             habbitNote = {
                "description":"Test Note",
                "categoryId":"5fa74048d611ec711ecab478"
            };
             sampleHabbitNote =new HabbitNote(habbitNote);
            sampleHabbitNote.set({userId:user._id});
            await sampleHabbitNote.save();
        });
 
        const  exec =async () => {
            return await request(server).put(`/api/habbits/notes/${sampleHabbitNote._id}`).set(config.get("authTokenName"),token).send(habbitNote);
        }

        it("Should return 401 if the user does not provide a valid token", async ()=>{
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it("Should return 400 if Object ID is invalid", async ()=>{
            const res = await request(server).put(`/api/habbits/notes/1245`).set(config.get("authTokenName"),token).send(habbitNote);
            expect(res.status).toBe(400);
        });
        it("Should return 404 if Object Id is not found", async ()=>{
            const res = await request(server).put(`/api/habbits/notes/${mongoose.Types.ObjectId()}`).set(config.get("authTokenName"),token).send(habbitNote);
            expect(res.status).toBe(404);
        });
        it("Should return 404 if the user does not own the HabbitNote", async ()=>{
            token = new User({name:"Test Name", email:"test@test.com"}).generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it("Should return 400 if the validation fails", async ()=>{
            habbitNote.name = "a";
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it("Should update the existing HabbitNote if input is valid and user owns it", async ()=> {
            habbitNote.description = "Changed Description";
            const res = await exec();
            const habbitNoteSearch = await HabbitNote.findOne({userId:user._id, _id:sampleHabbitNote._id, description:"Changed Description"});
            expect(habbitNoteSearch).not.toBeNull();
        });

    });

    describe("DELETE /:id",()=>{
        let habbitNote;
        let sampleHabbitNote;
        beforeEach(async ()=>{
             habbitNote = {
                "description":"Test Note",
                "categoryId":"5fa74048d611ec711ecab478"
            };
             sampleHabbitNote =new HabbitNote(habbitNote);
            sampleHabbitNote.set({userId:user._id});
            await sampleHabbitNote.save();
        });
        const  exec =async () => {
            return await request(server).delete(`/api/habbits/notes/${sampleHabbitNote._id}`).set(config.get("authTokenName"),token);
        }
        it("Should return 401 if the token is invalid",async ()=>{
            token ="";
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it("Should delete the record if the user owns it",async()=>{
            const res = await exec();

            const search = await HabbitNote.findOne({_id:sampleHabbitNote._id});
            expect(search).toBeNull();
            expect(res.body.n).toBe(1);
            expect(res.body.deletedCount).toBe(1);

        });
    });
});