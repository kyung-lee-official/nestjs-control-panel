import util from "util";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
	console.log(
		"This test flow assumes that the server is seeded, the admin member is verified already, and test members has been created."
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
let testMember1AccessToken: string;
let testMember1: any;

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
	it("POST /member-auth/signin sign in as admin and get ids of test members", async () => {
		const res = await req
			.post("/member-auth/signin")
			.send({
				email: process.env.E2E_TEST_ADMIN_EMAIL,
				password: "1234Abcd!",
			})
			.expect(201);
		adminAccessToken = res.body.accessToken;
		const membersRes = await req
			.get("/members")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200);
		console.log(util.inspect(membersRes.body, false, null, true));
		testMember1 = membersRes.body.find((member: any) => {
			return member.email === process.env.E2E_TEST_MEMBER_1_EMAIL;
		});
	}, 30000);

	it("PATCH /members/transferOwnership/:id transfer admin ownership to test member 1", async () => {
		const res = await req
			.patch(`/members/transferOwnership/${testMember1.id}`)
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200);
	});

	it("POST /member-auth/signin sign in as test member 1", async () => {
		const res = await req
			.post("/member-auth/signin")
			.send({
				email: process.env.E2E_TEST_MEMBER_1_EMAIL,
				password: "1234Abcd!",
			})
			.expect(201);
		testMember1AccessToken = res.body.accessToken;
		const membersRes = await req
			.get("/members")
			.set("Authorization", `Bearer ${testMember1AccessToken}`)
			.expect(200);
		console.log(util.inspect(membersRes.body, false, null, true));
	});

	it("Contains at least one test", () => {
		expect(true).toBe(true);
	});
});
