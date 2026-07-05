import { Injectable, inject } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

const base_url = environment.base;

@Injectable({ providedIn: 'root' })
export class HistorialTipoCambioService {
    private url  = `${base_url}/historial_tipo_cambio`;
    private http = inject(HttpClient);

    getUltimo(): Observable<any> {
        return this.http.get<any>(`${this.url}/ultimo`);
    }
}