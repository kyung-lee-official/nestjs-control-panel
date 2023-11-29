import { Exclude } from "class-transformer";
import { MemberGroup } from "../../member-groups/entities/member-group.entity";
import { MemberRole } from "../../member-roles/entities/member-role.entity";
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity()
export class Member {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ unique: true })
	email: string;

	@Column()
	nickname: string;

	@Column()
	@Exclude()
	password: string;

	@Column({ nullable: true })
	isVerified: boolean;

	@Column({ nullable: true })
	isFrozen: boolean;

	@ManyToMany(
		(type) => {
			return MemberRole;
		},
		(memberRole) => {
			return memberRole.members;
		}
	)
	@JoinTable()
	memberRoles: MemberRole[];

	@OneToMany(
		(type) => {
			return MemberGroup;
		},
		(group) => {
			return group.owner;
		}
	)
	ownedGroups: MemberGroup[];

	@ManyToMany(
		(type) => {
			return MemberGroup;
		},
		(group) => {
			return group.members;
		}
	)
	@JoinTable()
	memberGroups: MemberGroup[];

	@CreateDateColumn({ type: "timestamp with time zone" })
	createdDate: Date;

	@UpdateDateColumn({ type: "timestamp with time zone" })
	updatedDate: Date;
}
