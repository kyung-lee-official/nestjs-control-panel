import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
	console.log(
		"This test flow assumes that the server is seeded, and the test user 1 is verified already."
	);
} else {
	console.error(
		"❌ Fatal! Running e2e tests in modes other than DEV is not allowed!"
	);
	process.exit(1);
}

let app: INestApplication;
let adminAccessToken: string;

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
}, 30000);

describe("Test user flow, after test user verification (e2e)", () => {
	it("Contains at least one test", () => {
		expect(true).toBe(true);
	});
});

describe("Test user flow, finally disable sign up in server settings and delete the user (e2e)", () => {
	it("DELETE /users/:id should be successful", async () => {
		const req = request(app.getHttpServer());
		const res = await req
			.post("/auth/signin")
			.send({
				email: process.env.E2E_TEST_EMAIL,
				password: "1234Abcd!",
			})
			.expect(201);
		adminAccessToken = res.body.accessToken;
		await req
			.patch("/server-settings")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.send({
				allowPublicSignUp: false,
				allowGoogleSignIn: false,
			})
			.expect(200);
		await req
			.get("/server-settings/isSignUpAvailable")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200)
			.expect({ isSignUpAvailable: false });
		const user1Res = await req
			.get("/users?email=" + process.env.E2E_TEST_TEST_USER_1_EMAIL)
			.set("Authorization", `Bearer ${adminAccessToken}`);
		console.log(user1Res.body);
		await req
			.delete(`/users/${user1Res.body[0].id}`)
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200);
	});
});
