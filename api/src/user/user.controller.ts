import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Registers a new user account with name, email, and password',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User registration data',
    examples: {
      basic: {
        summary: 'Basic user registration',
        value: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'mySecurePassword123'
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'User successfully created',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user with email and password, returns JWT token',
  })
  @ApiBody({
    type: LoginUserDto,
    description: 'User login credentials',
    examples: {
      login: {
        summary: 'User login',
        value: {
          email: 'john.doe@example.com',
          password: 'mySecurePassword123'
        }
      }
    }
  })
  @ApiOkResponse({
    description: 'Login successful, returns user data and JWT token',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves a list of all registered users',
  })
  @ApiOkResponse({
    description: 'List of users retrieved successfully',
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific user',
    description: 'Retrieves a specific user by their ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User ID (UUID format)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({
    description: 'User retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user',
    description: 'Updates user information. Only provided fields will be updated.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User ID (UUID format)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User fields to update. All fields are optional.',
    examples: {
      updateName: {
        summary: 'Update only name',
        value: {
          name: 'John Smith'
        }
      },
      updateEmail: {
        summary: 'Update email',
        value: {
          email: 'john.smith@newdomain.com'
        }
      },
      updatePassword: {
        summary: 'Change password',
        value: {
          password: 'newSecurePassword789'
        }
      },
      fullUpdate: {
        summary: 'Update multiple fields',
        value: {
          name: 'John Alexander Smith',
          email: 'j.smith@company.com',
          password: 'brandNewPassword2024!'
        }
      }
    }
  })
  @ApiOkResponse({
    description: 'User updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiConflictResponse({
    description: 'Email already exists (when updating email)',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Permanently deletes a user account and all associated data',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User ID (UUID format)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiNoContentResponse({
    description: 'User deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}