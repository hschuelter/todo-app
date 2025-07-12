import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      } else if (info instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      } else {
        throw new UnauthorizedException('Authentication failed');
      }
    }
    return user;
  }
}