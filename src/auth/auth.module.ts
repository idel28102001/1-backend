import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { config } from '../common/config';
import { TokenService } from './services/token.service';
import { VerifyService } from './services/verify.service';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => config.getJwtConfig(),
    }),
  ],
  providers: [AuthService, JwtStrategy, TokenService, VerifyService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
