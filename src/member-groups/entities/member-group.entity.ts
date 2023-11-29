import { Member } from "../../members/entities/member.entity";
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity()
export class MemberGroup {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@ManyToOne((type) => Member, (member) => member.ownedGroups)
	owner: Member;

	@ManyToMany(
		(type) => {
			return Member;
		},
		(member) => {
			return member.memberGroups;
		},
		{
			onDelete: "CASCADE",
		}
	)
	members: Member[];

	@CreateDateColumn({ type: "timestamp with time zone" })
	createdDate: Date;

	@UpdateDateColumn({ type: "timestamp with time zone" })
	updatedDate: Date;
}
