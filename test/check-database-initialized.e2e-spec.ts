import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Client } from "pg";
import { AppModule } from "../src/app.module";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
	console.log(
		"Run 'pnpm exec prisma migrate reset' to reset the database before running this test."
	);
} else {
	console.error(
		"❌ Fatal! Running e2e tests in modes other than DEV is not allowed!"
	);
	process.exit(1);
}

describe("Drop database (e2e)", () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	}, 30000);

	it("By running 'pnpm exec prisma migrate reset', tables should be initialized, and table numbers should not be 0", async () => {
		const dbClient = new Client({
			host: process.env.DATABASE_HOST_DEV,
			port: parseInt(process.env.DATABASE_PORT_DEV),
			user: process.env.DATABASE_USERNAME_DEV,
			password: process.env.DATABASE_PASSWORD_DEV,
			database: process.env.DATABASE_DEV,
		});
		await dbClient.connect();
		const res = await dbClient.query(
			`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
		);
		expect(res.rows.length).not.toBe(0);
		expect(res.rows).toContainEqual({
			table_name: "ChituboxManualFeedback",
		});
		expect(res.rows).toContainEqual({ table_name: "MemberGroup" });
		expect(res.rows).toContainEqual({ table_name: "MemberRole" });
		expect(res.rows).toContainEqual({
			table_name: "MemberServerSetting",
		});
		expect(res.rows).toContainEqual({ table_name: "Member" });
		expect(res.rows).toContainEqual({
			table_name: "_MemberToMemberGroup",
		});
		expect(res.rows).toContainEqual({
			table_name: "_MemberToMemberRole",
		});
		await dbClient.end();
	}, 30000);

	it("All tables should be empty", async () => {
		const dbClient = new Client({
			host: process.env.DATABASE_HOST_DEV,
			port: parseInt(process.env.DATABASE_PORT_DEV),
			user: process.env.DATABASE_USERNAME_DEV,
			password: process.env.DATABASE_PASSWORD_DEV,
			database: process.env.DATABASE_DEV,
		});
		await dbClient.connect();
		const res = await dbClient.query(
			`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
		);
		for (const row of res.rows) {
			if (row.table_name !== "_prisma_migrations") {
				const res = await dbClient.query(
					`SELECT * FROM "${row.table_name}"`
				);
				expect(res.rows.length).toBe(0);
			}
		}
		await dbClient.end();
	}, 30000);
});
