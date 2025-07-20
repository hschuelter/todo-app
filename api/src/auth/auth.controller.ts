import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticates a user with email and password, returns JWT token'
  })
  @ApiBody({ 
    type: LoginUserDto,
    description: 'User login credentials',
    examples: {
      login: {
        summary: 'User login',
        value: {
          email: 'user@example.com',
          password: 'mySecurePassword123'
        }
      }
    }
  })
  @ApiOkResponse({ 
    description: 'Login successful, returns user data and JWT token'
  })
  async login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'User registration',
    description: 'Registers a new user account with name, email, and password'
  })
  @ApiBody({ 
    type: CreateUserDto,
    description: 'User registration data',
    examples: {
      basic: {
        summary: 'Basic user registration',
        value: {
          name: 'John Doe',
          email: 'user@example.com',
          password: 'mySecurePassword123'
        }
      }
    }
  })
  @ApiCreatedResponse({ 
    description: 'User successfully created'
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}