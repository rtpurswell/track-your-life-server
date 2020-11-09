const request = require("supertest");
const config = require("config");
const mongoose = require("mongoose");

const {TodoBoard} = require("../../../models/todoBoard");
const {User} = require("../../../models/user");


let server= require("../../../app");
let token;
let user;

describe("/api/todos",()=>{

    beforeEach(()=>{ 
        user = new User({name:"Test Name", email:"test@test.com"});
        token = user.generateAuthToken();
    });
    afterEach(async ()=>{
        await TodoBoard.remove(); 
        
    });

    describe("GET / ", ()=>{
        
        const exec = async ()=>{
            return await request(server).get("/api/todos").set(config.get("authTokenName"),token);
        }

        it("Should return 401 if the token is not valid", async ()=>{
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);

        });
        it("Should return all Todo Boards for the current user", async ()=>{
            await TodoBoard.insertMany([{
                userId:user._id,
                "name": "Todo Board1",
                "description": "My first Board",
                "color": config.get("appColors")[0],
                "todos": [
                    {
                        "name": "Todo 1",
                        "description": "My First Todo",
                        "color": config.get("appColors")[0],
                        "completed": false
                    }
                ]
            },{
                userId:user._id,
                "name": "Todo Board1",
                "description": "My first Board",
                "color": config.get("appColors")[0],
                "todos": [
                    {
                        "name": "Todo 1",
                        "description": "My First Todo",
                        "color": config.get("appColors")[0],
                        "completed": false
                    }
                ]
            },{
                userId:mongoose.Types.ObjectId(),
                "name": "Todo Board1",
                "description": "My first Board",
                "color": config.get("appColors")[0],
                "todos": [
                    {
                        "name": "Todo 1",
                        "description": "My First Todo",
                        "color": config.get("appColors")[0],
                        "completed": false
                    }
                ]
            }])
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);

        });
    });
    describe("GET /:id ", ()=>{

        it("Should return 401 if the user does not provide a valid token", async ()=>{
            const res = await request(server).get(`/api/todos/${mongoose.Types.ObjectId()}`).set(config.get("authTokenName"),"");
            expect(res.status).toBe(401);
        });
        it("Should return 400 if the object Id is invalid", async ()=> {
            const res = await request(server).get(`/api/todos/1246`).set(config.get("authTokenName"),token);
            expect(res.status).toBe(400);

        });
        it("Should return 404 if the user is not the owner of the TodoBoard", async ()=>{
            const todoBoard = new TodoBoard({
                userId:mongoose.Types.ObjectId(),
                "name": "Todo Board1",
                "description": "My first Board",
                "color": config.get("appColors")[0],
                "todos": [
                    {
                        "name": "Todo 1",
                        "description": "My First Todo",
                        "color": config.get("appColors")[0],
                        "completed": false
                    }
                ]
            });
            await todoBoard.save()
            const res = await request(server).get(`/api/todos/${todoBoard._id}`).set(config.get("authTokenName"),token);
            expect(res.status).toBe(404);

        });
        it("Should return 404 if it does not find an object with the given id",async ()=>{
            const todoBoard = new TodoBoard({
                userId:user._id,
                "name": "Todo Board1",
                "description": "My first Board",
                "color": config.get("appColors")[0],
                "todos": [
                    {
                        "name": "Todo 1",
                        "description": "My First Todo",
                        "color": config.get("appColors")[0],
                        "completed": false
                    }
                ]
            });
            await todoBoard.save()

           const res = await request(server).get(`/api/todos/${mongoose.Types.ObjectId()}`).set(config.get("authTokenName"),token);
           expect(res.status).toBe(404);
        });
        it("Should return a valid TodoBoard if the user is signed in and provided an existing Id",async ()=>{
            const todoBoard = new TodoBoard({
                userId:user._id,
                "name": "Todo Board1",
                "description": "My first Board",
                "color": config.get("appColors")[0],
                "todos": [
                    {
                        "name": "Todo 1",
                        "description": "My First Todo",
                        "color": config.get("appColors")[0],
                        "completed": false
                    }
                ]
            });
            await todoBoard.save()

           const res = await request(server).get(`/api/todos/${todoBoard._id}`).set(config.get("authTokenName"),token);
           expect(res.status).toBe(200);
           expect(res.body.description).toBe("My first Board");
        });

    });
    
    describe("POST / ", ()=>{
        let todoBoard;
        beforeEach(()=>{
             todoBoard = {
                "name": "Todo Board1",
                "description": "My first Board",
                "color": config.get("appColors")[0],
                "todos": [
                    {
                        "name": "Todo 1",
                        "description": "My First Todo",
                        "color": config.get("appColors")[0],
                        "completed": false
                    }
                ]
            }
        });
        
        const  exec =async () => {
            return await request(server).post("/api/todos").set(config.get("authTokenName"),token).send(todoBoard);
        }
        it("Should return 401 if the user does not provide a valid token", async ()=>{
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it("Should return 400 if the TodoBoard does not pass validation", async ()=>{
            todoBoard.name = 0;
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it("Should save TodoBoard to database if it is valid and user is signed in", async ()=>{
            const res = await exec();
            const todoBoard = await TodoBoard.findOne({userId:user._id, _id:res.body._id});
            expect(todoBoard).not.toBeNull();
            expect(todoBoard.todos[0].description).toBe("My First Todo");
        });

    });
    describe("PUT /:id ", ()=>{
        let todoBoard;
        let sampleTodoBoard;
        beforeEach(async ()=>{
             todoBoard = {
                "name": "Todo Board1",
                "description": "My first Board",
                "color": config.get("appColors")[0],
                "todos": [
                    {
                        "name": "Todo 1",
                        "description": "My First Todo",
                        "color": config.get("appColors")[0],
                        "completed": false
                    }
                ]
            };
             sampleTodoBoard =new TodoBoard(todoBoard);
            sampleTodoBoard.set({userId:user._id});
            await sampleTodoBoard.save();
        });
 
        const  exec =async () => {
            return await request(server).put(`/api/todos/${sampleTodoBoard._id}`).set(config.get("authTokenName"),token).send(todoBoard);
        }

        it("Should return 401 if the user does not provide a valid token", async ()=>{
           
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it("Should return 400 if Object ID is invalid", async ()=>{
            const res = await request(server).put(`/api/todos/1245`).set(config.get("authTokenName"),token).send(todoBoard);
            expect(res.status).toBe(400);
        });
        it("Should return 404 if Object Id is not found", async ()=>{

            const res = await request(server).put(`/api/todos/${mongoose.Types.ObjectId()}`).set(config.get("authTokenName"),token).send(todoBoard);
            expect(res.status).toBe(404);
        });
        it("Should return 404 if the user does not own the TodoBoard", async ()=>{
            token = new User({name:"Test Name", email:"test@test.com"}).generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(404);
        });
        it("Should return 400 if the validation fails", async ()=>{
            todoBoard.name = "a";
            const res = await exec();
            expect(res.status).toBe(400);
        });
        it("Should update the existing TodoBoard if input is valid and user owns it", async ()=> {
            todoBoard.name = "Changed Name";
            const res = await exec();

            const todoBoardSearch = await TodoBoard.findOne({userId:user._id, _id:sampleTodoBoard._id, name:"Changed Name"});
            expect(todoBoardSearch).not.toBeNull();
        });
    });
    describe("DELETE /:id ", ()=>{
        let todoBoard;
        let sampleTodoBoard;
        beforeEach(async ()=>{
             todoBoard = {
                "name": "Todo Board1",
                "description": "My first Board",
                "color": config.get("appColors")[0],
                "todos": [
                    {
                        "name": "Todo 1",
                        "description": "My First Todo",
                        "color": config.get("appColors")[0],
                        "completed": false
                    }
                ]
            };
             sampleTodoBoard =new TodoBoard(todoBoard);
            sampleTodoBoard.set({userId:user._id});
            await sampleTodoBoard.save();
        });
        const  exec =async () => {
            return await request(server).delete(`/api/todos/${sampleTodoBoard._id}`).set(config.get("authTokenName"),token);
        }
        it("Should return 401 if the token is invalid",async ()=>{
            token ="";
            const res = await exec();
            expect(res.status).toBe(401);
        });
        it("Should delete the record if the user owns it",async()=>{
            const res = await exec();

            const search = await TodoBoard.findOne({_id:sampleTodoBoard._id});
            expect(search).toBeNull();
            expect(res.body.n).toBe(1);
            expect(res.body.deletedCount).toBe(1);

        });
    });
    


});