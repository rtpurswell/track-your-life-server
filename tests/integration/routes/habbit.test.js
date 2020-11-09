const request = require("supertest");
const config = require("config");
const mongoose = require("mongoose");

const {Habbit} = require("../../../models/habbit");
const {User} = require("../../../models/user");

let server= require("../../../app");
let token;
let user;
describe("/api/habbit",()=>{
    beforeEach(()=>{   
        user = new User({name:"Test Name", email:"test@test.com"});
        token = user.generateAuthToken();
    });
    afterEach(async () => { 
        await Habbit.remove({});
    });
     
    describe("GET / ",()=>{
        const  exec =async () => {
            return await request(server).get("/api/habbits").set(config.get("authTokenName"),token);
        }
        it("Should get 401 error if token is invalid",async()=>{
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it("Should return all idea boards for the signed in user", async ()=>{
            await Habbit.insertMany([{
                userId:user._id,
                "name": "Habbit 8",
                "description": "Habbit 4 description",
                "color": config.get("appColors")[0],
                "categoryId": "5fa73f6dd611ec711ecab477"
            },
            {
                userId:user._id,
                "name": "Habbit 8",
                "description": "Habbit 4 description",
                "color": config.get("appColors")[0],
                "categoryId": "5fa73f6dd611ec711ecab477"
            },
            {
                userId:mongoose.Types.ObjectId(),
                "name": "Habbit 8",
                "description": "Habbit 4 description",
                "color": config.get("appColors")[0],
                "categoryId": "5fa73f6dd611ec711ecab477"
            }])
            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
        });
    });

    describe("GET /:id", ()=>{
        
        it("Should return 401 if the user does not provide a valid token", async ()=>{
            const res = await request(server).get(`/api/habbits/${mongoose.Types.ObjectId()}`).set(config.get("authTokenName"),"");
            expect(res.status).toBe(401);
        });
        it("Should return 400 if the object Id is invalid", async ()=> {
            const res = await request(server).get(`/api/habbits/1246`).set(config.get("authTokenName"),token);
            expect(res.status).toBe(400);

        });
        it("Should return 404 if the user is not the owner of the Habbit", async ()=>{
            const habbit = new Habbit({
                userId:mongoose.Types.ObjectId(),
                "name": "Habbit 8",
                "description": "Habbit 4 description",
                "color": config.get("appColors")[0],
                "categoryId": "5fa73f6dd611ec711ecab477"
            });
            await habbit.save()
            const res = await request(server).get(`/api/habbits/${habbit._id}`).set(config.get("authTokenName"),token);
            expect(res.status).toBe(404);

        });
        it("Should return 404 if it does not find an object with the given id",async ()=>{
            const habbit = new Habbit({
                userId:user._id,
                "name": "Habbit 8",
                "description": "Habbit 4 description",
                "color": config.get("appColors")[0],
                "categoryId": "5fa73f6dd611ec711ecab477"
            });
            await habbit.save()

           const res = await request(server).get(`/api/habbits/${mongoose.Types.ObjectId()}`).set(config.get("authTokenName"),token);
           expect(res.status).toBe(404);
        });
        it("Should return a valid Habbit if the user is signed in and provided an existing Id",async ()=>{
            const habbit = new Habbit({
                userId:user._id,
                "name": "Habbit 8",
                "description": "Habbit 4 description",
                "color": config.get("appColors")[0],
                "categoryId": "5fa73f6dd611ec711ecab477"
            });
            await habbit.save()

           const res = await request(server).get(`/api/habbits/${habbit._id}`).set(config.get("authTokenName"),token);
           expect(res.status).toBe(200);
           expect(res.body.description).toBe("Habbit 4 description");
        });
    });

    describe("POST /",()=>{
        let habbit;
        beforeEach(()=>{
             habbit = {
                "name": "Habbit 8",
                "description": "Habbit 4 description",
                "color": config.get("appColors")[0],
                "categoryId": "5fa73f6dd611ec711ecab477"
            };
        });
        
        const  exec =async () => {
            return await request(server).post("/api/habbits").set(config.get("authTokenName"),token).send(habbit);
        }
        it("Should return 401 if the user does not provide a valid token", async ()=>{
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it("Should return 400 if the Habbit does not pass validation", async ()=>{
            habbit.categoryId = 0;
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it("Should save Habbit to database if it is valid and user is signed in", async ()=>{
            const res = await exec();
            
            const habbit = await Habbit.findOne({userId:user._id, name:"Habbit 8"});
            expect(habbit).not.toBeNull();
            expect(habbit.description).toBe("Habbit 4 description");
        });

    });

    describe("PUT /:id",()=>{
        let habbit;
        let sampleHabbit;
        beforeEach(async ()=>{
             habbit = {
                "name": "Habbit 8",
                "description": "Habbit 4 description",
                "color": config.get("appColors")[0],
                "categoryId": "5fa73f6dd611ec711ecab477"
            };
             sampleHabbit =new Habbit(habbit);
            sampleHabbit.set({userId:user._id});
            await sampleHabbit.save();
        });
 
        const  exec =async () => {
            return await request(server).put(`/api/habbits/${sampleHabbit._id}`).set(config.get("authTokenName"),token).send(habbit);
        }

        it("Should return 401 if the user does not provide a valid token", async ()=>{
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it("Should return 400 if Object ID is invalid", async ()=>{
            const res = await request(server).put(`/api/habbits/1245`).set(config.get("authTokenName"),token).send(habbit);
            expect(res.status).toBe(400);
        });
        it("Should return 404 if Object Id is not found", async ()=>{
            const res = await request(server).put(`/api/habbits/${mongoose.Types.ObjectId()}`).set(config.get("authTokenName"),token).send(habbit);
            expect(res.status).toBe(404);
        });
        it("Should return 404 if the user does not own the Habbit", async ()=>{
            token = new User({name:"Test Name", email:"test@test.com"}).generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it("Should return 400 if the validation fails", async ()=>{
            habbit.name = "a";
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it("Should update the existing Habbit if input is valid and user owns it", async ()=> {
            habbit.name = "Changed Name";
            const res = await exec();

            const habbitSearch = await Habbit.findOne({userId:user._id, _id:sampleHabbit._id, name:"Changed Name"});
            expect(habbitSearch).not.toBeNull();
        });

    });

    describe("DELETE /:id",()=>{
        let habbit;
        let sampleHabbit;
        beforeEach(async ()=>{
             habbit = {
                "name": "Habbit 8",
                "description": "Habbit 4 description",
                "color": config.get("appColors")[0],
                "categoryId": "5fa73f6dd611ec711ecab477"
            };
             sampleHabbit =new Habbit(habbit);
            sampleHabbit.set({userId:user._id});
            await sampleHabbit.save();
        });
        const  exec =async () => {
            return await request(server).delete(`/api/habbits/${sampleHabbit._id}`).set(config.get("authTokenName"),token);
        }
        it("Should return 401 if the token is invalid",async ()=>{
            token ="";
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it("Should delete the record if the user owns it",async()=>{
            const res = await exec();

            const search = await Habbit.findOne({_id:sampleHabbit._id});
            expect(search).toBeNull();
            expect(res.body.n).toBe(1);
            expect(res.body.deletedCount).toBe(1);

        });
    });
});