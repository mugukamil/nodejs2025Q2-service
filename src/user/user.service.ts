import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return users.map(({ password, ...rest }) => rest);
  }

  async getById(id: string): Promise<Omit<User, 'password'>> {
    this.validateUUID(id);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    if (!dto.login || !dto.password) {
      throw new BadRequestException('Missing required fields');
    }
    const user = this.userRepository.create({
      login: dto.login,
      password: dto.password,
    });
    const savedUser = await this.userRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = savedUser;
    return rest;
  }

  async updatePassword(
    id: string,
    dto: UpdatePasswordDto,
  ): Promise<Omit<User, 'password'>> {
    this.validateUUID(id);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.password !== dto.oldPassword)
      throw new ForbiddenException('Old password is wrong');

    user.password = dto.newPassword;
    const updatedUser = await this.userRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = updatedUser;
    return rest;
  }

  async delete(id: string): Promise<void> {
    this.validateUUID(id);
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('User not found');
  }

  private validateUUID(id: string) {
    if (
      !/^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$/.test(
        id,
      )
    ) {
      throw new BadRequestException('Invalid UUID');
    }
  }
}
