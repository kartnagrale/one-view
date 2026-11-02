import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CurrentUser } from './models';

@Injectable({providedIn:'root'})
export class AuthService {
  private readonly tokenKey='agri-basic-token';
  private readonly userKey='agri-user';
  private userSubject=new BehaviorSubject<CurrentUser|null>(this.restoreUser());
  user$=this.userSubject.asObservable();
  constructor(private http:HttpClient){}

  login(username:string,password:string):Observable<CurrentUser>{
    const token=btoa(`${username}:${password}`); sessionStorage.setItem(this.tokenKey,token);
    return this.http.get<CurrentUser>('/api/v1/auth/me').pipe(tap(user=>{sessionStorage.setItem(this.userKey,JSON.stringify(user));this.userSubject.next(user);}));
  }
  logout(){sessionStorage.removeItem(this.tokenKey);sessionStorage.removeItem(this.userKey);this.userSubject.next(null);}
  token(){return sessionStorage.getItem(this.tokenKey);}
  user(){return this.userSubject.value;}
  isLoggedIn(){return !!this.token();}
  hasRole(role:string){return this.user()?.roles?.includes(role) ?? false;}
  private restoreUser():CurrentUser|null{try{return JSON.parse(sessionStorage.getItem(this.userKey)||'null');}catch{return null;}}
}
