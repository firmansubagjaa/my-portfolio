// File: /server/src/utils/sql.test.ts
import { describe, it, expect } from "bun:test";
import { escapeLike } from "./sql";

describe("escapeLike", () => {
	it("should escape percent sign", () => {
		expect(escapeLike("50%")).toBe("50\\%");
	});

	it("should escape underscore", () => {
		expect(escapeLike("_off")).toBe("\\_off");
	});

	it("should escape backslash", () => {
		expect(escapeLike("test\\")).toBe("test\\\\");
	});

	it("should escape multiple special characters", () => {
		expect(escapeLike("50%_off\\")).toBe("50\\%\\_off\\\\");
	});

	it("should return empty string unchanged", () => {
		expect(escapeLike("")).toBe("");
	});

	it("should return string without special chars unchanged", () => {
		expect(escapeLike("hello world")).toBe("hello world");
	});

	it("should escape only special characters", () => {
		expect(escapeLike("%_\\")).toBe("\\%\\_\\\\");
	});
});
