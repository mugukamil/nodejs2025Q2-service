import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from "@nestjs/common";
import { User } from "./user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { randomUUID } from "crypto";

@Injectable()
export class UserService {
    private users: User[] = [];

    getAll(): Omit<User, "password">[] {
        return this.users.map(({ password, ...rest }) => rest);
    }

    getById(id: string): Omit<User, "password"> {
        this.validateUUID(id);
        const user = this.users.find((u) => u.id === id);
        if (!user) throw new NotFoundException("User not found");
        const { password, ...rest } = user;
        return rest;
    }

    create(dto: CreateUserDto): Omit<User, "password"> {
        if (!dto.login || !dto.password) {
            throw new BadRequestException("Missing required fields");
        }
        const now = Date.now();
        const user: User = {
            id: randomUUID(),
            login: dto.login,
            password: dto.password,
            version: 1,
            createdAt: now,
            updatedAt: now,
        };
        this.users.push(user);
        const { password, ...rest } = user;
        return rest;
    }

    updatePassword(id: string, dto: UpdatePasswordDto): Omit<User, "password"> {
        this.validateUUID(id);
        const user = this.users.find((u) => u.id === id);
        if (!user) throw new NotFoundException("User not found");
        if (user.password !== dto.oldPassword)
            throw new ForbiddenException("Old password is wrong");
        user.password = dto.newPassword;
        user.version++;
        user.updatedAt = Date.now();
        const { password, ...rest } = user;
        return rest;
    }

    delete(id: string): void {
        this.validateUUID(id);
        const idx = this.users.findIndex((u) => u.id === id);
        if (idx === -1) throw new NotFoundException("User not found");
        this.users.splice(idx, 1);
    }

    private validateUUID(id: string) {
        if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
            throw new BadRequestException("Invalid UUID");
        }
    }
}
