import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../src/app.module";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
	console.log(
		"This test flow assumes that the server is seeded, and the admin member is verified already."
	);
	console.log(
		"This test flow signs in as admin, and then disable sign up in server settings and delete the member."
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

describe("Check server status and disable sign up", () => {
	it("POST /member-auth/signin sign in as admin", async () => {
		const res = await req
			.post("/member-auth/signin")
			.send({
				email: process.env.E2E_TEST_ADMIN_EMAIL,
				password: "1234Abcd!",
			})
			.expect(201);
		adminAccessToken = res.body.accessToken;
	});

	it("PATCH /member-server-settings disable sign up in server settings", async () => {
		await req
			.patch("/member-server-settings")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.send({
				allowPublicSignUp: false,
				allowGoogleSignIn: false,
			})
			.expect(200);
		await req
			.get("/member-server-settings/isSignUpAvailable")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200)
			.expect({ isSignUpAvailable: false });
	});

	it("DELETE /members/:id delete test members should be successful", async () => {
		const member1Res = await req
			.get("/members?email=" + process.env.E2E_TEST_MEMBER_1_EMAIL)
			.set("Authorization", `Bearer ${adminAccessToken}`);
		console.log(member1Res.body);
		await req
			.delete(`/members/${member1Res.body[0].id}`)
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200);
		const member2Res = await req
			.get("/members?email=" + process.env.E2E_TEST_MEMBER_2_EMAIL)
			.set("Authorization", `Bearer ${adminAccessToken}`);
		console.log(member2Res.body);
		await req
			.delete(`/members/${member2Res.body[0].id}`)
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200);
	});
});
