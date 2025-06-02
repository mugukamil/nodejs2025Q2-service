import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    HttpCode,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { v4 as uuidValidate } from "uuid";

@Controller("user")
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    getAll() {
        return this.userService.getAll();
    }

    @Get(":id")
    getById(@Param("id") id: string) {
        return this.userService.getById(id);
    }

    @Post()
    @HttpCode(201)
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Put(":id")
    @HttpCode(201)
    updatePassword(@Param("id") id: string, @Body() updatePasswordDto: UpdatePasswordDto) {
        return this.userService.updatePassword(id, updatePasswordDto);
    }

    @Delete(":id")
    @HttpCode(201)
    delete(@Param("id") id: string) {
        this.userService.delete(id);
    }
}
