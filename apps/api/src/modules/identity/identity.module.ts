import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './application/auth.service';
import { UserService } from './application/user.service';
import { AuthController } from './interface/auth.controller';
import { UserController } from './interface/user.controller';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/jwt-auth.guard';
import { PermissionsGuard } from './infrastructure/permissions.guard';
import { OwnershipScope } from './infrastructure/ownership.scope';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'fallback-secret-change-me',
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
      },
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    JwtAuthGuard,
    PermissionsGuard,
    OwnershipScope,
  ],
  exports: [
    JwtAuthGuard,
    PermissionsGuard,
    OwnershipScope,
    AuthService,
    UserService,
  ],
})
export class IdentityModule {}
