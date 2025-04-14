import { Module } from "@nestjs/common";
import { SalesDataModule } from "./sales-data/sales-data.module";

@Module({
	imports: [SalesDataModule],
	providers: [],
})
export class RetailModule {}
