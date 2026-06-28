import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Vehiculo } from "../../models/Vehiculo";

const base_url = environment.base

@Injectable({
    providedIn: 'root'
})
export class VehiculoService {
    private url = `${base_url}/vehiculo`

    constructor(private http: HttpClient){}

    list() {
        return this.http.get<Vehiculo[]>(`${this.url}`)
    }

    insert(vehiculo: Vehiculo){
        return this.http.post(`${this.url}/registrarVehiculo`, vehiculo)
    }

    update(vehiculo: Vehiculo){
        return this.http.put(`${this.url}`, vehiculo, {
            responseType: 'text'
        })
    }
}