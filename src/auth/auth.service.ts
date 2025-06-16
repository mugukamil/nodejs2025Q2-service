import {
    Injectable,
    UnauthorizedException,
    ForbiddenException,
    BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../user/user.entity";
import { SignUpDto, LoginDto, RefreshTokenDto, AuthResponseDto } from "./dto/auth.dto";

export interface JwtPayload {
    userId: string;
    login: string;
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async signUp(signUpDto: SignUpDto): Promise<{ message: string }> {
        const { login, password } = signUpDto;

        if (!login || !password || typeof login !== "string" || typeof password !== "string") {
            throw new BadRequestException("Login and password must be provided as strings");
        }

        // Check if user already exists
        const existingUser = await this.userRepository.findOne({ where: { login } });
        if (existingUser) {
            throw new BadRequestException("User with this login already exists");
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = this.userRepository.create({
            login,
            password: hashedPassword,
        });

        await this.userRepository.save(user);

        return { message: "User registered successfully" };
    }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { login, password } = loginDto;

        if (!login || !password || typeof login !== "string" || typeof password !== "string") {
            throw new BadRequestException("Login and password must be provided as strings");
        }

        // Find user
        const user = await this.userRepository.findOne({ where: { login } });
        if (!user) {
            throw new ForbiddenException("Authentication failed");
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ForbiddenException("Authentication failed");
        }

        // Generate tokens
        const payload: JwtPayload = { userId: user.id, login: user.login };
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);

        return {
            accessToken,
            refreshToken,
        };
    }

    async refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
        const { refreshToken } = refreshTokenDto;

        if (!refreshToken) {
            throw new UnauthorizedException("Refresh token is required");
        }

        try {
            // Verify refresh token
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
            }) as JwtPayload;

            // Validate user still exists
            const user = await this.userRepository.findOne({ where: { id: payload.userId } });
            if (!user) {
                throw new ForbiddenException("User not found");
            }

            // Generate new tokens
            const newPayload: JwtPayload = { userId: user.id, login: user.login };
            const accessToken = this.generateAccessToken(newPayload);
            const newRefreshToken = this.generateRefreshToken(newPayload);

            return {
                accessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            throw new ForbiddenException("Invalid or expired refresh token");
        }
    }

    private generateAccessToken(payload: JwtPayload): string {
        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
            expiresIn: this.configService.get<string>("JWT_ACCESS_EXPIRES_IN"),
        });
    }

    private generateRefreshToken(payload: JwtPayload): string {
        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
            expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN"),
        });
    }

    async validateUser(payload: JwtPayload): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: payload.userId } });
        if (!user) {
            throw new UnauthorizedException("User not found");
        }
        return user;
    }
}
