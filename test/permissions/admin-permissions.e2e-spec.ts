import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../src/app.module";
import { inspect } from "../test-utils";
import TestAgent from "supertest/lib/agent";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
	console.log(
		"This test assume the server is seeded and the admin is verified already."
	);
} else {
	console.error(
		"❌ Fatal! Running e2e tests in modes other than DEV is not allowed!"
	);
	process.exit(1);
}

let app: INestApplication;
let req: TestAgent<request.Test>;
let adminAccessToken: string;
let everyoneGroup: any;

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

describe("admin permissions test flow", () => {
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

	let adminRes: request.Response;
	it("GET /member-auth/me and log admin", async () => {
		adminRes = await req
			.get("/members/me")
			.expect(200)
			.set("Authorization", `Bearer ${adminAccessToken}`);
		console.log("admin: ", inspect(adminRes.body));
	});

	it("PATCH /members/freeze admin should be forbidden to freeze himself", async () => {
		const res = await req
			.patch(`/members/${adminRes.body.id}/freeze`)
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.send({
				isFrozen: true,
			})
			.expect(403);
	});

	it("DELETE /members/:id admin should be forbidden to delete himself", async () => {
		const res = await req
			.delete(`/members/${adminRes.body.id}`)
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(403);
		console.log("Delete admin response: ", inspect(res.body));
	});
});

describe("member-group test flow for admin", () => {
	let adminRes: request.Response;
	it("PATCH /member-groups/ remove admin from the 'everyone' member-group should fail", async () => {
		adminRes = await req
			.get("/members/me")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200);
		const getMemberGroupsRes = await req
			.get("/member-groups")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200);
		everyoneGroup = getMemberGroupsRes.body.find(
			(group) => group.name === "everyone"
		);
		const memberIds = everyoneGroup.members
			.filter((member) => member.id !== adminRes.body.id)
			.map((member) => member.id);
		const res = await req
			.patch(`/member-groups/${everyoneGroup.id}`)
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.send({
				memberIds: memberIds,
			})
			.expect(403);
		console.log("Update group response", inspect(res.body));
	});

	let createdMemberGroup1: any;
	let createdMemberGroup2: any;
	it("CREATE /member-groups/ create a member-group, automatically named as 'New Group'", async () => {
		const res = await req
			.post("/member-groups")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(201);
		expect(res.body.name).toBe("New Group");
		createdMemberGroup1 = res.body;
	});

	it("CREATE /member-groups/ create another member-group, automatically named as 'New Group1'", async () => {
		const res = await req
			.post("/member-groups")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(201);
		expect(res.body.name).toBe("New Group1");
		createdMemberGroup2 = res.body;
	});

	it("admin should own the created member-groups", async () => {
		expect(createdMemberGroup1.ownerId).toBe(adminRes.body.id);
		expect(createdMemberGroup2.ownerId).toBe(adminRes.body.id);
	});

	it("PATCH /member-groups/ remove admin from the 'New Group1' member-group should fail", async () => {
		const getMemberGroupsRes = await req
			.get("/member-groups")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200);
		const newGroup1 = getMemberGroupsRes.body.find(
			(group) => group.name === "New Group1"
		);
		const memberIds = newGroup1.members
			.filter((member) => member.id !== adminRes.body.id)
			.map((member) => member.id);
		const res = await req
			.patch(`/member-groups/${newGroup1.id}`)
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.send({
				memberIds: memberIds,
			})
			.expect(403);
	});

	it("DELETE /member-groups/ delete the created member-groups", async () => {
		await req
			.delete(`/member-groups/${createdMemberGroup1.id}`)
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200);
		await req
			.delete(`/member-groups/${createdMemberGroup2.id}`)
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200);
	});
});

let testMemberRes: request.Response;
describe(`Create a member test member '${process.env.E2E_TEST_MEMBER_3_NAME}' flow`, () => {
	it("POST /members/create create a member manually by email", async () => {
		const upperCaseEmail =
			process.env.E2E_TEST_MEMBER_3_EMAIL.toUpperCase();
		testMemberRes = await req
			.post("/members/create")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.send({
				email: upperCaseEmail,
				name: process.env.E2E_TEST_MEMBER_3_NAME,
				password: "1234Abcd!",
			});
		expect(testMemberRes.status).toBe(201);
		console.log("Create member response: ", inspect(testMemberRes.body));
	});

	it("POST /members/create email should be saved as all-lower cases.", async () => {
		const lowerCaseEmail =
			process.env.E2E_TEST_MEMBER_3_EMAIL.toLowerCase();
		expect(testMemberRes.body.email).toBe(lowerCaseEmail);
	});

	it("POST /members/create test member should belongs to the 'everyone' member-group", async () => {
		expect(testMemberRes.body.memberGroups[0].name).toBe("everyone");
	});

	it("POST /members/create test member should have the 'default' member-role", async () => {
		expect(testMemberRes.body.memberRoles[0].name).toBe("default");
	});
});

describe(`member-group test flow for '${process.env.E2E_TEST_MEMBER_3_NAME}'`, () => {
	it("GET /member-groups get all member-groups", async () => {
		const res = await req
			.get("/member-groups")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200);
		everyoneGroup = res.body.find((group) => group.name === "everyone");
	});

	it("PATCH /member-groups/ remove test member from the 'everyone' member-group should fail", async () => {
		const updatedEveryoneGroup = {
			...everyoneGroup,
			members: everyoneGroup.members.filter(
				(member) => member.id !== testMemberRes.body.id
			),
		};
		const res = await req
			.patch(`/member-groups/${everyoneGroup.id}`)
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.send(updatedEveryoneGroup)
			.expect(403);
		console.log(
			"Remove test member from 'everyone' member-group response: ",
			inspect(res.body)
		);
	});
});

describe(`Delete the test member '${process.env.E2E_TEST_MEMBER_3_NAME}'`, () => {
	it("DELETE /members/:id delete the test member", async () => {
		const testMemberId = testMemberRes.body.id;
		const res = await req
			.delete(`/members/${testMemberId}`)
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200);
	});
});
