import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GoogleOAuth20AuthGuard extends AuthGuard("google") {
	/* Use the default google AuthGuard from @nestjs/passport, no need to implement your own code. */
}
