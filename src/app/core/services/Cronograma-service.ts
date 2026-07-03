import { Injectable, inject } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

const base_url = environment.base;

@Injectable({ providedIn: 'root' })
export class CronogramaPagosService {
    private url = `${base_url}/cronograma`;
    private http = inject(HttpClient);

    obtenerPorSimulacion(idSimulacion: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.url}/${idSimulacion}`);
    }
}