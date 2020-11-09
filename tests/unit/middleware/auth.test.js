const { default: expectCt } = require("helmet/dist/middlewares/expect-ct");
const jestConfig = require("../../../jest.config");
const auth = require("../../../middleware/auth");
const {User} = require("../../../models/user");

describe("Auth Middleware",()=>{
    it("Should send a 400 response if the token is not valid",()=>{
        const req = {
            header: jest.fn().mockReturnValue("InvalidToken")
        }
        const res = {};
            res.status= jest.fn().mockReturnValue(res);
            res.send= jest.fn(); 
        
        const next = jest.fn();
        auth(req,res,next);
        expect(res.status.mock.calls[0][0]).toBe(400);


    });
    it("Should populate req.user with the payload of a valid JWT",()=>{
        const token = new User({name:"Jake", email:"jake@test.com",password:"12345678"}).generateAuthToken();
        const req = {
            header: jest.fn().mockReturnValue(token)
        }
        const next = jest.fn();
        const res = {};
        auth(req,res,next);
        expect(req.user.name).toBe("Jake");
        expect(next.mock.calls.length).toBe(1);
    });

});