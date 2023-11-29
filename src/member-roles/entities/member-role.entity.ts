import { Permissions } from "../../permissions/permissions.enum";
import { Member } from "../../members/entities/member.entity";
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity()
export class MemberRole {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column("simple-array", { nullable: true })
	permissions?: Permissions[];

	@ManyToMany(
		(type) => {
			return Member;
		},
		(member) => {
			return member.memberRoles;
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
