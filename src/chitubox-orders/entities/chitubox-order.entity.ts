import { DiscordDrawCampaign } from "../../discord-draw-campaigns/entities/discord-draw-campaign.entity";
import { Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export class ChituboxOrder {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(
		() => DiscordDrawCampaign,
		(discordDrawCampaign) => discordDrawCampaign.chituboxOrders
	)
	discordDrawCampaign: DiscordDrawCampaign;

	@Column()
	chituboxOrderId: string;

	@Column()
	email: string;

	@Column({ type: "timestamp with time zone" })
	paidDate: Date;
}
