import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        // Allow requests to specific public routes without authentication
        const publicRoutes = ["/auth/signup", "/auth/login", "/auth/refresh", "/doc", "/"];
        const url = request.url;

        if (publicRoutes.includes(url) || url.startsWith("/doc")) {
            return true;
        }

        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            throw err || new UnauthorizedException("Unauthorized");
        }
        return user;
    }
}
