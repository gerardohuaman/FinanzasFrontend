import { Cliente } from "./Cliente"
import { Historial_TipoCambio } from "./Historial_TipoCambio"
import { Usuario } from "./Usuario"
import { Vehiculo } from "./Vehiculo"

export class Simulacion {
    id_simulacion: number = 0
    usuario: Usuario = new Usuario()
    cliente: Cliente = new Cliente()
    vehiculo: Vehiculo = new Vehiculo()
    historialTipoCambio: Historial_TipoCambio = new Historial_TipoCambio()
    fecha_registro: Date = new Date()
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
    van: number = 0
    tir: number = 0
    cok: number = 0
    tcea: number = 0
}