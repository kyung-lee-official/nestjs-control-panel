import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import request from "supertest";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
	console.log(
		"Note: you will need to verify the new email manually using the REST APIs."
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

describe("Change email flow (e2e)", () => {
	it("POST /member-auth/signin sign in as admin", async () => {
		const res = await req
			.post("/member-auth/signin")
			.send({
				email: process.env.E2E_TEST_ADMIN_EMAIL,
				password: "1234Abcd!",
			})
			.expect(201);
		adminAccessToken = res.body.accessToken;
	}, 30000);

	it("PATCH /member-auth/updateEmailRequest request to update email", async () => {
		const res = await req
			.patch("/member-auth/updateEmailRequest")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.send({
				newEmail: process.env.E2E_TEST_ADMIN_NEW_EMAIL,
			});
		expect(res.status).toBe(200);
		console.log("New email: ", process.env.E2E_TEST_ADMIN_NEW_EMAIL);
	});
});
