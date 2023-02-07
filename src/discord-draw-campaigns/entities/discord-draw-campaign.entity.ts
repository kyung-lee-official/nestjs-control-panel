import { ChituboxOrder } from "src/chitubox-orders/entities/chitubox-order.entity";
import { DiscordDrawRecord } from "src/discord-draw-records/entities/discord-draw-record.entity";
import { Column, CreateDateColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class DiscordDrawCampaign {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	description: string;

	@Column()
	rule;

	/**
	 * nullable, only required when rule type is `N_CHANCES`
	 */
	@Column({ nullable: true, type: "time without time zone" })
	drawStartDate: Date;

	/**
	 * nullable, only required when rule type is `N_CHANCES`
	 */
	@Column({ nullable: true, type: "time without time zone" })
	drawEndDate: Date;

	@Column({ type: "time without time zone" })
	paidStartDate: Date;

	@Column({ type: "time without time zone" })
	paidEndDate: Date;

	@OneToMany(
		() => DiscordDrawRecord,
		(discordDrawRecord) => discordDrawRecord.discordDrawCampaign,
	)
	discordDrawRecords: DiscordDrawRecord[];

	@OneToMany(
		() => ChituboxOrder,
		(ChituboxOrder) => ChituboxOrder.discordDrawCampaign
	)
	chituboxOrders: ChituboxOrder[];

	@CreateDateColumn()
	createdDate: Date;

	@UpdateDateColumn()
	updatedDate: Date;
}
