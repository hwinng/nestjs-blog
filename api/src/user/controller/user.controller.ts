/* eslint-disable prettier/prettier */
import { UserService } from './../service/user.service';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { User } from '../models/user.interface';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Controller('users')
export class UserController {

    constructor(private userService: UserService){}

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
    findOne(@Param() params): Observable<User> {
        return this.userService.findOne(params.id);
    }

    @Get()
    findAll(): Observable<User[]> {
        return this.userService.findAll();
    }

    @Delete(':id')
    deleteOne(@Param('id') id: string): Observable<User> {
        return this.userService.deleteOne(Number(id));
    }

    @Put(':id')
    updateOne(@Body() user: User, @Param('id') id: number): Observable<any> {
        return this.userService.updateOne(Number(id), user);
    }
}
