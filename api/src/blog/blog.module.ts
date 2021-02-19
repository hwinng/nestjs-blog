import { UserModule } from './../user/user.module';
import { AuthModule } from './../auth/auth.module';
import { BlogEntity } from './models/blog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([BlogEntity]), AuthModule, UserModule],
})
export class BlogModule {}
