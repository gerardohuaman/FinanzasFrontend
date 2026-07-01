import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

const base_url = environment.base

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private url = `${base_url}/login`

    constructor(private http: HttpClient){}

    login(credentials: any): Observable<any> {
        return this.http.post(this.url, credentials)
    }

    guardarToken(token: string){
        if(typeof window !== 'undefined' && window.sessionStorage){
            sessionStorage.setItem('token', token)
        }
    }

    getToken(): string | null {
        if(typeof window !== 'undefined' && window.sessionStorage){
            return sessionStorage.getItem('token')
        }
        return null
    }

    cerrarSesion() {
        if(typeof window !== 'undefined' && window.sessionStorage){
            sessionStorage.clear()
        }
    }

    isLoggedIn(): boolean{
        return this.getToken() !== null
    }
}