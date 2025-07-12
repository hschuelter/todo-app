import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { LoginUserDto } from '../user/dto/login-user.dto';
// import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginUserDto) {
    const { email, password } = loginDto;
    
    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, name: user.name };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

//   async register(registerDto: RegisterDto) {
//     const { email, password, username } = registerDto;

//     // Check if user already exists
//     const existingUser = await this.userRepository.findOne({ where: { email } });
//     if (existingUser) {
//       throw new ConflictException('User with this email already exists');
//     }

//     // Hash password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     // Create user
//     const user = this.userRepository.create({
//       email,
//       password: hashedPassword,
//       username,
//     });

//     const savedUser = await this.userRepository.save(user);

//     // Generate JWT token
//     const payload = { sub: savedUser.id, email: savedUser.email, username: savedUser.username };
//     const access_token = this.jwtService.sign(payload);

//     return {
//       access_token,
//       user: {
//         id: savedUser.id,
//         email: savedUser.email,
//         username: savedUser.username,
//       },
//     };
//   }
}
