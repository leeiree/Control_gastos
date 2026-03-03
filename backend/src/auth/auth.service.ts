import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(email: string, password: string, name: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('El email ya está registrado');
    }

    const newUser = await this.usersService.create({ email, password, name });
    const { password: _, ...result } = newUser.toObject();
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const isValid = await this.usersService.validatePassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const { password: _, ...result } = user.toObject();
    return result;
  }
}