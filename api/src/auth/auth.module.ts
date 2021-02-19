import { UserModule } from './../user/user.module';
import { JwtStrategy } from './guards/jwt-strategy';
import { JwtAuthGuard } from './guards/jwt-guards';
/* eslint-disable prettier/prettier */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './service/auth.service'
import { RolesGuard } from './guards/roles.guards';
@Module({
    imports: [
        forwardRef(() => UserModule),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: '10000s'
                }
            })
        })
    ],
    providers: [AuthService, JwtAuthGuard, RolesGuard, JwtStrategy],
    exports: [AuthService]
})
export class AuthModule {}
