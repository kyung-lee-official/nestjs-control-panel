import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
	console.log(
		"This test flow assumes that the server is seeded, and the admin user is verified already."
	);
	console.log(
		"If the test user is already signed up, run test-user-after-verification.e2e-spec.ts to delete the user before running this test."
	);
} else {
	console.error(
		"❌ Fatal! Running e2e tests in modes other than DEV is not allowed!"
	);
	process.exit(1);
}

let app: INestApplication;
let req: request.SuperTest<request.Test>;
let adminAccessToken: string;
let testUser1AccessToken: string;

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
}, 30000);

describe("Test user flow, before test user verification (e2e)", () => {
	it("GET /auth/isSeeded should be true", async () => {
		const res = await req.get("/auth/isSeeded").expect(200);
		expect(res.body.isSeeded).toBe(true);
	});

	it("POST /auth/signup should be false given server setting doesn't allow sign up", async () => {
		const res = await req
			.post("/auth/signup")
			.send({
				email: process.env.E2E_TEST_USER_1_EMAIL,
				nickname: process.env.E2E_TEST_USER_1_NICKNAME,
				password: "1234Abcd!",
			})
			.expect(403);
	});

	it("POST /auth/signin sign in as admin and change server settings to allow sign up", async () => {
		const res = await req
			.post("/auth/signin")
			.send({
				email: process.env.E2E_TEST_ADMIN_EMAIL,
				password: "1234Abcd!",
			})
			.expect(201);
		adminAccessToken = res.body.accessToken;
		await req
			.patch("/server-settings")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.send({
				allowPublicSignUp: true,
				allowGoogleSignIn: false,
			})
			.expect(200);
		await req
			.get("/server-settings/isSignUpAvailable")
			.expect(200)
			.expect({ isSignUpAvailable: true });
	}, 30000);

	it("POST /auth/signup sign up test user 1", async () => {
		const user1Res = await req
			.post("/auth/signup")
			.send({
				email: process.env.E2E_TEST_USER_1_EMAIL,
				nickname: process.env.E2E_TEST_USER_1_NICKNAME,
				password: "1234Abcd!",
			})
			.expect(201);
		expect(user1Res.body.email).toBe(process.env.E2E_TEST_USER_1_EMAIL);
		expect(user1Res.body.password).toBe(undefined);
		expect(user1Res.body.nickname).toBe(
			process.env.E2E_TEST_USER_1_NICKNAME
		);
		expect(user1Res.body.groups[0].name).toBe("everyone");
		expect(user1Res.body.ownedGroups).toBe(undefined);
		expect(user1Res.body.roles[0].name).toBe("default");
		expect(user1Res.body.isVerified).toBe(null);
	});

	it("POST /auth/signup sign up as test user 2", async () => {
		const req = request(app.getHttpServer());
		const user2Res = await req
			.post("/auth/signup")
			.send({
				email: process.env.E2E_TEST_USER_2_EMAIL,
				nickname: process.env.E2E_TEST_USER_2_NICKNAME,
				password: "1234Abcd!",
			})
			.expect(201);
		expect(user2Res.body.email).toBe(process.env.E2E_TEST_USER_2_EMAIL);
		expect(user2Res.body.password).toBe(undefined);
		expect(user2Res.body.nickname).toBe(
			process.env.E2E_TEST_USER_2_NICKNAME
		);
		expect(user2Res.body.groups[0].name).toBe("everyone");
		expect(user2Res.body.ownedGroups).toBe(undefined);
		expect(user2Res.body.roles[0].name).toBe("default");
		expect(user2Res.body.isVerified).toBe(null);
	});

	it("Contains at least one test", () => {
		expect(true).toBe(true);
	});
});
