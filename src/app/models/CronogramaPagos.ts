import { Simulacion } from "./SImulacion"

export class CronogramaPagos {
    id_cuota: number = 0
    simulacion: Simulacion = new Simulacion()
    numero_mes: number = 0
    fecha_pago: Date = new Date()
    saldo_inicial: number = 0
    amortizacion: number = 0
    interes: number = 0
    s_desgravamen: number = 0
    s_vehicular: number = 0
    cuota_total: number = 0
    saldo_final: number = 0
}