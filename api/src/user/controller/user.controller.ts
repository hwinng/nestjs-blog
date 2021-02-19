/* eslint-disable prettier/prettier */
import { UserService } from './../service/user.service';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Query } from '@nestjs/common';
import { User } from '../models/user.interface';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UpdateResult } from 'typeorm';
import { hasRoles } from 'src/auth/decorators/roles.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Pagination } from 'nestjs-typeorm-paginate';
import { UserRole } from './../models/user.interface';


@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService){}

    @Post()
    create(@Body() user: User): Observable<User | unknown> {
        return this.userService.create(user).pipe(
            map((user: User) => user),
            catchError(err => of({error: err.message}))
        );
    }

    @Post('login')
    login(@Body() user: User): Observable<unknown> {
        return this.userService.login(user).pipe(
            map((jwt: string) => {
                return {accessToken: jwt}
            })
        )
    }

    @Get(':id')
    findOne(@Param('id') id: string): Observable<User> {
        return this.userService.findOne(Number(id));
    }

    @Get()
    index(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('username') username: string,
    ): Observable<Pagination<User>> {
        limit = limit > 100 ? 100 : limit;

        if (username === null || username === undefined) {
            return this.userService.paginate({
                page: Number(page),
                limit: Number(limit),
                route: 'http://localhost:3000/users',
            });
        } else {
            return this.userService.paginateFilterByUsername({
                page: Number(page),
                limit: Number(limit),
                route: 'http://localhost:3000/users',
            }, {username})
        }
    }

    @Delete(':id')
    deleteOne(@Param('id') id: string): Observable<User> {
        return this.userService.deleteOne(Number(id));
    }

    @Put(':id')
    updateOne(@Body() user: User, @Param('id') id: number): Observable<UpdateResult> {
        return this.userService.updateOne(Number(id), user);
    }

    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id/role')
    updateUserRole(@Param('id') id: string, @Body() user: User): Observable<UpdateResult> {
        return this.userService.updateUserRole(Number(id), user);
    }
}
