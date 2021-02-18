/* eslint-disable prettier/prettier */
import { User } from './../../../dist/user/models/user.interface.d';
import { Observable, from, of } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService){ }
    
    generateJWT(user: User): Observable<string> {
        return from(this.jwtService.signAsync({user}));
    }

    hashPassword(password: string): Observable<string> {
        return from<string>(bcrypt.hash(password, 12))
    }

    comparePassword(newPwd: string, hashedPw: string): Observable<any | boolean> {
        return of<any | boolean>(bcrypt.compare(newPwd, hashedPw))
    }
}
