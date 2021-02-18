/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user.interface';
import { from, Observable, throwError } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { UserEntity } from './../models/user.entity';
import { AuthService } from '../../auth/service/auth.service'
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private authService: AuthService
    ){}

    create(user: User): Observable<User> {
        const {name, email, password, username} = user;
        return this.authService.hashPassword(password).pipe(
            switchMap((hashedPassword: string) => {
                const newUser = new UserEntity();
                newUser.name = name;
                newUser.username = username;
                newUser.email = email;
                newUser.password = hashedPassword;
                return from(this.userRepository.save(newUser)).pipe(
                    map((user: User) => {
                        const { password, ...result } = user;
                        return result;
                    }),
                    catchError(err => throwError(err))
                )
            })
        )
    }

    findOne(id: number): Observable<User> {
        return from(this.userRepository.findOne({id})).pipe(
            map((user: User) => {
                const {password, ...result} = user;
                return result;
            })
        );
    }

    findAll(): Observable<User[]> {
        return from(this.userRepository.find()).pipe(
            map((users: User[]) => {
                users.forEach(function(user) {delete user.password});
                return users;
            })
        );
    }

    deleteOne(id: number): Observable<any> {
        return from(this.userRepository.delete(id));
    }

    updateOne(id: number, user: User): Observable<any> {
        delete user.email;
        delete user.password;

        return from(this.userRepository.update(id, user));
    }

    findByMail(email: string): Observable<User> {
        return from(this.userRepository.findOne({email}));
    }

    login(user: User): Observable<string> {
        const {email, password} = user;
        return this.validateUser(email, password).pipe(
            switchMap((user: User) => {
                if(user) {
                    return this.authService.generateJWT(user).pipe(map((jwt: string) => jwt))
                } else {
                    return 'Unauthorized Credentials!'
                }
            })
        )
    }

    validateUser(email: string, password: string): Observable<User> {
        return this.findByMail(email).pipe(
            switchMap((user: User) => this.authService.comparePassword(password, user.password).pipe(
                map((match: boolean) => {
                    if(match) {
                        const {password, ...result} = user;
                        return result;
                    } else {
                        throw Error;
                    }
                })
            ))
        )
    }


}