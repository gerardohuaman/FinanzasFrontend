import {Component, inject} from "@angular/core";
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

  todosLosClientes:  Cliente[]  = [];
  todosLosVehiculos: Vehiculo[] = [];

  clientesFiltrados:  Cliente[]  = [];
  vehiculosFiltrados: Vehiculo[] = [];

  busquedaCliente:  string = '';
  busquedaVehiculo: string = '';

  clienteSeleccionado:  Cliente  | null = null;
  vehiculoSeleccionado: Vehiculo | null = null;
  // ── FORMULARIO ───────────────────────────────────
  inputDTO: SimulacionInputDTO = new SimulacionInputDTO();
  monedaSeleccionada: string = 'PEN';
  metodoAmortizacion: string = 'inteligente';

  // ── VALORES CALCULADOS VISUALMENTE ───────────────
  montoFinanciar:    number = 0;
  cuotaInicialMoneda: number = 0;
  cuotaBalonMoneda:   number = 0;

  // ── TIPO DE CAMBIO ───────────────────────────────
  tipoCambio: any = null;

  // ── RESULTADOS DEL BACKEND ───────────────────────
  cuotaMensual: number = 0;
  interesTotal: number = 0;
  van:  number = 0;
  tir:  number = 0;
  tcea: number = 0;

  constructor(
    private clienteService: ClienteService,
    private vehiculoService: VehiculoService,
    private simulacionService: SimulacionService
  ){}

  ngOnInit(): void {
    console.log("Ultimo cambio");
    this.inputDTO.porcentaje_inicial = 20.0
    this.inputDTO.tipo_tasa = 'TEA'
    this.inputDTO.meses_gracia = 0
    this.inputDTO.tasa_desgravamen = 0.03
    this.inputDTO.tasa_vehicular = 0.03
    this.inputDTO.plazo_meses = 48
    this.inputDTO.valor_tasa = 12.50

    this.clienteService.list().subscribe({
      next:  (data) => this.todosLosClientes = data,
      error: (err)  => console.error('Error al cargar clientes', err)
    });

    this.vehiculoService.list().subscribe({
      next:  (data) => this.todosLosVehiculos = data,
      error: (err)  => console.error('Error al cargar vehículos', err)
    });

    /*this.tipoCambioService.getUltimo().subscribe({
      next:  (data) => this.tipoCambio = data,
      error: (err)  => console.error('Error al cargar tipo de cambio', err)
    });*/
  }
  recalcularMontos(): void {

  }

  // Para el filtro
  onBuscarCliente(valor: string): void {
    const q = valor.trim().toLowerCase();
    if (q.length < 2) { this.clientesFiltrados = []; return; }
    this.clientesFiltrados = this.todosLosClientes.filter(c =>
        c.nombreCompleto.toLowerCase().includes(q) || c.dni.includes(q)
    );
  }

  onBuscarVehiculo(valor: string): void {
    const q = valor.trim().toLowerCase();
    if (q.length < 2) { this.vehiculosFiltrados = []; return; }
    this.vehiculosFiltrados = this.todosLosVehiculos.filter(v =>
        v.marca.toLowerCase().includes(q) || v.modelo.toLowerCase().includes(q)
    );
  }

  // ── SELECCIÓN ────────────────────────────────────
  seleccionarCliente(cliente: Cliente): void {
    this.clienteSeleccionado  = cliente;
    this.busquedaCliente      = cliente.nombreCompleto;
    this.inputDTO.id_cliente  = cliente.id_cliente;
    this.clientesFiltrados    = []; // cerrar dropdown
  }

  seleccionarVehiculo(vehiculo: Vehiculo): void {
    this.vehiculoSeleccionado  = vehiculo;
    this.busquedaVehiculo      = `${vehiculo.marca} ${vehiculo.modelo}`;
    this.inputDTO.id_vehiculo  = vehiculo.id_vehiculo;
    this.vehiculosFiltrados    = [];
  }
  setMoneda(moneda: string): void {
    this.monedaSeleccionada = moneda;
    this.recalcularMontos();
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
