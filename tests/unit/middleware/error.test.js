const error = require("../../../middleware/error");
const winston = require("winston");

describe("Error Middleware", () => {
  it("Should call winston error and return res.status of 500", () => {
    winston.error = jest.fn();
    const req = {};
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();
    const next = {};
    const err = new Error("error message");
    error(err, req, res, next);
    expect(res.status.mock.calls[0][0]).toBe(500);
    expect(winston.error.mock.calls[0][0]).toBe("error message");
  });
});
