import { Moneda } from "./Moneda"

export class Vehiculo {
    id_vehiculo: number = 0
    marca: string = ''
    modelo: string = ''
    precio_venta: number = 0
    moneda: Moneda = new Moneda()
}