import util from "util";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
	console.log(
		"This test flow assumes that the server is seeded, the admin user is verified already, and test users has been created."
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
let testUser1: any;

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

describe("Transfer admin ownership flow", () => {
	it("POST /auth/signin sign in as admin and get ids of test users", async () => {
		const res = await req
			.post("/auth/signin")
			.send({
				email: process.env.E2E_TEST_ADMIN_EMAIL,
				password: "1234Abcd!",
			})
			.expect(201);
		adminAccessToken = res.body.accessToken;
		const usersRes = await req
			.get("/users")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200);
		console.log(util.inspect(usersRes.body, false, null, true));
		testUser1 = usersRes.body.find((user: any) => {
			return user.email === process.env.E2E_TEST_USER_1_EMAIL;
		});
	}, 30000);

	it("PATCH /users/transferOwnership/:id transfer admin ownership to test user 1", async () => {
		const res = await req
			.patch(`/users/transferOwnership/${testUser1.id}`)
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200);
	});

	it("POST /auth/signin sign in as test user 1", async () => {
		const res = await req
			.post("/auth/signin")
			.send({
				email: process.env.E2E_TEST_USER_1_EMAIL,
				password: "1234Abcd!",
			})
			.expect(201);
		testUser1AccessToken = res.body.accessToken;
		const usersRes = await req
			.get("/users")
			.set("Authorization", `Bearer ${testUser1AccessToken}`)
			.expect(200);
		console.log(util.inspect(usersRes.body, false, null, true));
	});

	it("Contains at least one test", () => {
		expect(true).toBe(true);
	});
});
