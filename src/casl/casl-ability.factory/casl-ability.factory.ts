import { AbilityBuilder, ExtractSubjectType, InferSubjects, MongoAbility, createMongoAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChituboxManualFeedback } from "src/chitubox-manual-feedbacks/entities/chitubox-manual-feedback-record.entity";
import { Group } from "src/groups/entities/group.entity";
import { Role } from "src/roles/entities/role.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";

export enum Actions {
	CREATE = "CREATE",
	READ = "READ",
	UPDATE = "UPDATE",
	DELETE = "DELETE",
}

export type Subjects = InferSubjects<
	typeof User |
	typeof Role |
	typeof Group |
	typeof ChituboxManualFeedback
> | "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) { }
	async defineAbilityFor(user: User): Promise<AppAbility> {
		const requester = await this.usersRepository.findOne({
			where: {
				id: user.id
			},
			relations: [
				"groups",
				"ownedGroups"
			]
		});
		const abilityBuilder = new AbilityBuilder<AppAbility>(createMongoAbility);
		const { can, cannot, build } = abilityBuilder;
		const ownedGroupIds = requester.ownedGroups.map((ownedGroup) => {
			return ownedGroup.id;
		});
		can(Actions.READ, User, {
			groups: {
				$elemMatch: {
					id: {
						$in: ownedGroupIds
					}
				}
			}
		});
		cannot(Actions.DELETE, User);
		const ability = build({
			detectSubjectType: (object) => {
				return object.constructor as ExtractSubjectType<Subjects>;
			}
		});
		return ability;
	}
}
