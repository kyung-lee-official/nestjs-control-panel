import { DiscordDrawCampaign } from "src/discord-draw-campaigns/entities/discord-draw-campaign.entity";
import { Column, CreateDateColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class DiscordDrawRecord {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(
		() => DiscordDrawCampaign,
		(discordDrawCampaign) => discordDrawCampaign.discordDrawRecords
	)
	discordDrawCampaign: DiscordDrawCampaign;

	@Column()
	discordUserId: string;

	@Column()
	chituboxOrderId: string;

	@Column()
	isHit: boolean;

	@CreateDateColumn({ type: "timestamp with time zone" })
	createdDate: Date;

	@UpdateDateColumn({ type: "timestamp with time zone" })
	updatedDate: Date;
}
