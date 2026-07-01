import { Component } from "@angular/core";
import { SimulacionInputDTO } from "../../../models/SimulacionInputDTO";
import { Vehiculo } from "../../../models/Vehiculo";
import { ClienteService } from "../../../core/services/Cliente-service";
import { VehiculoService } from "../../../core/services/Vehiculo-service";
import { SimulacionService } from "../../../core/services/Simulacion-service";
import { Cliente } from "../../../models/Cliente";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatRadioModule } from "@angular/material/radio";

@Component({
  selector: "app-simulador-config",
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatRadioModule
  ],
  templateUrl: "./simulador-config.html",
  styleUrl: "./simulador-config.css",
})
export class SimuladorConfigComponent {
  inputDTO: SimulacionInputDTO = new SimulacionInputDTO()

  clientes: Cliente[] = []
  vehiculos: Vehiculo[] = []

  monedaSeleccionada: string = 'PEN'
  metodoAmortizacion: string = 'francés'
  precioVehiculo: number = 25000
  montoFinanciar: number = 16000
  cuotaMensual: number = 2007.86
  interesTotal: number = 20777.30
  van: number = 1500.00
  tir: number = 13.15
  tcea: number = 14.20

  constructor(
    private clienteService: ClienteService,
    private vehiculoService: VehiculoService,
    private simulacionService: SimulacionService
  ){}

  ngOnInit(): void {
    this.clienteService.list().subscribe(data => this.clientes = data)
    this.vehiculoService.list().subscribe(data => this.vehiculos = data)

    this.inputDTO.porcentaje_inicial = 20.0
    this.inputDTO.tipo_tasa = 'TEA'
    this.inputDTO.meses_gracia = 0
    this.inputDTO.tasa_desgravamen = 0.03
    this.inputDTO.tasa_vehicular = 0.03
    this.inputDTO.plazo_meses = 48
    this.inputDTO.valor_tasa = 12.50
  }

  setMoneda(moneda: string){
    
  }

  calcular(){
    console.log("Enviando datos al backend:", this.inputDTO)

    this.simulacionService.createSimulation(this.inputDTO).subscribe({
      next: (response) => {
        console.log("Respuesta del servidor:", response)
      },
      error: (err) => {
        alert("Error al calcular la simulacion. Revisa los datos.")
      }
    })
  }
}
