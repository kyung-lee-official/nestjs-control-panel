import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
	console.log(
		"❕Make sure to verify the user from the email before starting this test"
	);
} else {
	console.error(
		"❌ Fatal! Running e2e tests in modes other than DEV is not allowed!"
	);
	process.exit(1);
}

let app: INestApplication;
let req: request.SuperTest<request.Test>;
let accessToken: string;

beforeAll(async () => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	app = moduleFixture.createNestApplication();
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
		})
	);
	app.enableCors();
	await app.init();
	req = request(app.getHttpServer());
}, 15000);

describe("Seed flow, after verification (e2e)", () => {
	it("POST /auth/signin", async () => {
		const res = await req.post("/auth/signin").send({
			email: process.env.E2E_TEST_ADMIN_EMAIL,
			password: "1234Abcd!",
		});
		expect(res.status).toBe(201);
		accessToken = res.body.accessToken;
	}, 15000);

	it("GET /users/me user should be verified", async () => {
		const res = await req
			.get("/users/me")
			.set("Authorization", `Bearer ${accessToken}`);
		expect(res.status).toBe(200);
		expect(res.body.email).toBe(process.env.E2E_TEST_ADMIN_EMAIL);
		expect(res.body.password).toBe(undefined);
		expect(res.body.nickname).toBe(process.env.E2E_TEST_ADMIN_NICKNAME);
		expect(res.body.groups[0].name).toBe("everyone");
		expect(res.body.ownedGroups[0].name).toBe("everyone");
		expect(res.body.roles[0].name).toBe("admin");
		expect(res.body.isVerified).toBe(true);
	}, 15000);

	it("GET /roles should return 'admin' and 'default' given the user is already verified", async () => {
		const res = await req
			.get("/roles")
			.set("Authorization", `Bearer ${accessToken}`);
		expect(res.status).toBe(200);
		expect(res.body[0].name).toBe("admin");
		expect(res.body[1].name).toBe("default");
	}, 15000);

	it("Contains at least one test", () => {
		expect(true).toBe(true);
	});
});
