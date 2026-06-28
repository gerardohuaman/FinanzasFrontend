import { CronogramaPagosDTO } from "./CronogramaPagosDTO";

export class SimulacionResponseDTO {
    id_simulacion: number = 0;
    moneda_simulacion: string = '';
    precio_vehiculo_calculado: number = 0;
    cuota_inicial: number = 0;
    monto_financiado: number = 0;
    cuota_balon: number = 0;

    van: number = 0;
    tir: number = 0;
    tcea: number = 0;

    total_intereses: number = 0;
    total_seguro_desgravamen: number = 0;
    total_seguro_vehicular: number = 0;
    total_cuota_final: number = 0;

    cronograma: CronogramaPagosDTO[] = []
}