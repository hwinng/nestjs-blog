/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User, UserRole } from '../models/user.interface';
import { from, Observable, throwError } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { UserEntity } from './../models/user.entity';
import { AuthService } from '../../auth/service/auth.service';
import {
    paginate,
    Pagination,
    IPaginationOptions,
  } from 'nestjs-typeorm-paginate';
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private authService: AuthService
    ){}

    create(user: User): Observable<User> {
        const {name, email, password, username, role} = user;
        return this.authService.hashPassword(password).pipe(
            switchMap((hashedPassword: string) => {
                const newUser = new UserEntity();
                newUser.name = name;
                newUser.username = username;
                newUser.email = email;
                newUser.password = hashedPassword;
                newUser.role = UserRole.USER;
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

    paginate(options: IPaginationOptions): Observable<Pagination<User>> {
        return from(paginate<User>(this.userRepository, options)).pipe(
            map((userPageable: Pagination<User>) => {
                userPageable.items.forEach(function(user){delete user.password});
                return userPageable;
            })
        );
      }

    deleteOne(id: number): Observable<any> {
        return from(this.userRepository.delete(id));
    }

    updateOne(id: number, user: User): Observable<UpdateResult> {
        delete user.email;
        delete user.password;
        delete user.role;
        return from(this.userRepository.update(id, user));
    }

    updateUserRole(id: number, user: User): Observable<UpdateResult> {
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