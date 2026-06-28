import { Cliente } from "./Cliente";
import { Historial_TipoCambio } from "./Historial_TipoCambio";
import { Usuario } from "./Usuario";
import { Vehiculo } from "./Vehiculo";

export class SimulacionInputDTO {
    id_usuario: number = 0
    id_cliente: number = 0
    id_vehiculo: number = 0
    id_tipo_cambio: number = 0
    porcentaje_inicial: number = 0
    porcentaje_balon: number = 0
    plazo_meses: number = 0
    tipo_tasa: string = ''
    valor_tasa: number = 0
    capitalizacion: string = ''
    meses_gracia: number = 0
    tipo_gracia: string = ''
    tasa_desgravamen: number = 0
    tasa_vehicular: number = 0
    cok: number = 0
}