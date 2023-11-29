import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "../entities/member.entity";

@Injectable()
export class IsVerifiedGuard implements CanActivate {
	constructor(
		@InjectRepository(Member)
		private membersRepository: Repository<Member>
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		let { user: member } = context.switchToHttp().getRequest();
		const dbMember = await this.membersRepository.findOne({
			where: {
				id: member.id,
			},
		});
		if (dbMember.isVerified) {
			return true;
		} else {
			throw new ForbiddenException("Member is not verified");
		}
	}
}
