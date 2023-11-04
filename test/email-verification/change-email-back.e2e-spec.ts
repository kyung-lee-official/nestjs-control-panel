import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import request from "supertest";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
	console.log("Note: this test should only run after the change-email-new.e2e-spec.ts test has been run, and the new email has been verified.");
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

describe("Change email back flow (e2e)", () => {
	it("POST /auth/signin sign in as admin", async () => {
		const res = await req
			.post("/auth/signin")
			.send({
				email: process.env.E2E_TEST_ADMIN_NEW_EMAIL,
				password: "1234Abcd!",
			})
			.expect(201);
		adminAccessToken = res.body.accessToken;
	}, 30000);

	it("PATCH /auth/update-email-request request to update email", async () => {
		const res = await req
			.patch("/auth/update-email-request")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.send({
				newEmail: process.env.E2E_TEST_ADMIN_EMAIL
			});
		expect(res.status).toBe(200);
	});
});