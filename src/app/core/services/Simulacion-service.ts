import { SimulacionResponseDTO } from '../../models/SimulacionResponseDTO';
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { SimulacionInputDTO } from "../../models/SimulacionInputDTO";
import { Observable } from "rxjs";

const base_url = environment.base

@Injectable ({
    providedIn: 'root'
})

export class SimulacionService {
    private url = `${base_url}/simulaciones`

    constructor(private http: HttpClient){}

    createSimulation(inputDTO: SimulacionInputDTO): Observable<SimulacionResponseDTO> {
        return this.http.post<SimulacionResponseDTO>(`${this.url}/crear`, inputDTO)
    }

    list(): Observable<any[]> {
        return this.http.get<any[]>(this.url)
    }
}