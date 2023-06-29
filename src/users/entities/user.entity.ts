import { Exclude } from "class-transformer";
import { Group } from "src/groups/entities/group.entity";
import { Role } from "src/roles/entities/role.entity";
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
export class User {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ unique: true })
	email: string;

	@Column()
	nickname: string;

	@Column()
	@Exclude()
	password: string;

	// @Column()
	// isActive: boolean;

	@Column({ nullable: true })
	isVerified: boolean;

	@ManyToMany(
		(type) => {
			return Role;
		},
		(role) => {
			return role.users;
		}
	)
	@JoinTable()
	roles: Role[];

	@OneToMany(
		(type) => {
			return Group;
		},
		(group) => {
			return group.owner;
		}
	)
	ownedGroups: Group[];

	@ManyToMany(
		(type) => {
			return Group;
		},
		(group) => {
			return group.users;
		}
	)
	@JoinTable()
	groups: Group[];

	@CreateDateColumn({ type: "timestamp with time zone" })
	createdDate: Date;

	@UpdateDateColumn({ type: "timestamp with time zone" })
	updatedDate: Date;
}
