import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Cliente } from "../../models/Cliente";
import { Observable } from "rxjs";

const base_url = environment.base;

@Injectable({
    providedIn: 'root'
})
export class ClienteService {
    private url = `${base_url}/cliente`

    constructor(private http: HttpClient) {}

    list(): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(`${this.url}`)
    }

    insert(cliente: Cliente){
        return this.http.post(`${this.url}/registrar`, cliente)
    }

    update(cliente: Cliente){
        return this.http.put(`${this.url}`, cliente, {
            responseType: 'text'
        })
    }
}