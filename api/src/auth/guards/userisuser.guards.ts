import { Observable } from 'rxjs';
/* eslint-disable prettier/prettier */
import { UserService } from './../../user/service/user.service';
import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from '@nestjs/common';
import { User } from 'src/user/models/user.interface';
import { map } from 'rxjs/operators';


@Injectable()
export class UserIsUser implements CanActivate {
    constructor(
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
    ){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const {params} = request;
        const {user} = request.user;
        return this.userService
            .findOne(user.id)
            .pipe(
                map((user: User) => {
                    let hasPermission = false;
                    if (user.id === Number(params.id)) {
                        hasPermission = true;
                    }
                    return user && hasPermission
                })
            )
    }
}