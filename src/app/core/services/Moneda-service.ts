import {environment} from "../../../environments/environment";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Moneda} from "../../models/Moneda";

const base_url = environment.base

@Injectable ({
    providedIn: 'root'
})

export class MonedaService {
    private url = `${base_url}/moneda`
    constructor(private http: HttpClient){}
    list(){
        return this.http.get<Moneda[]>(`${this.url}`)
    }


}