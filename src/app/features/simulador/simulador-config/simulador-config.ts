import {ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from "@angular/core";
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
import { SimulacionResponseDTO } from "../../../models/SimulacionResponseDTO";
import { debounceTime, Subject, Subscription } from "rxjs";
import { MonedaService } from "../../../core/services/Moneda-service";
import { Router } from "@angular/router";
import { Moneda } from "../../../models/Moneda";

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
export class SimuladorConfigComponent implements OnInit, OnDestroy{


  clientes: Cliente[] = []
  vehiculos: Vehiculo[] = []
  monedas: Moneda[] = []

  precioVehiculoSeleccionado: number = 0

  
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
  metodoAmortizacion: string = 'frances';

  // ── VALORES CALCULADOS VISUALMENTE ───────────────
  //montoFinanciar:    number = 0;
  cuotaInicialMoneda: number = 0;
  cuotaBalonMoneda:   number = 0;

  // ── TIPO DE CAMBIO ───────────────────────────────
  tipoCambio: any = null;

  // ── RESULTADOS DEL BACKEND ───────────────────────
  /*
  cuotaMensual: number = 0;
  interesTotal: number = 0;
  van:  number = 0;
  tir:  number = 0;
  tcea: number = 0;
  */

  respuestaSimulacion: SimulacionResponseDTO | null = null
  previewData: SimulacionResponseDTO | null = null

  private inputSubject = new Subject<void>()
  private sub?: Subscription

  private clienteService = inject(ClienteService)
  private vehiculoService = inject(VehiculoService)
  private monedaService = inject(MonedaService)
  private simulacionService = inject(SimulacionService)
  private router = inject(Router)
  private cdr = inject(ChangeDetectorRef)

  ngOnInit(): void {
    this.clienteService.list().subscribe(data => this.clientes = data)
    this.vehiculoService.list().subscribe(data => this.vehiculos = data)
    this.monedaService.list().subscribe(data => this.monedas = data)

    this.inputDTO.porcentaje_inicial = 20.0
    this.inputDTO.porcentaje_balon = 30.0
    this.inputDTO.tipo_tasa = 'TEA'
    this.inputDTO.capitalizacion = 'MENSUAL'
    this.inputDTO.meses_gracia = 0
    this.inputDTO.tipo_gracia = 'SIN_GRACIA'
    this.inputDTO.tasa_desgravamen = 0.03
    this.inputDTO.tasa_vehicular = 0.03
    this.inputDTO.plazo_meses = 48
    this.inputDTO.valor_tasa = 12.50

    this.sub = this.inputSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.solicitarPreview()
    })

    this.clienteService.list().subscribe({
      next:  (data) => this.todosLosClientes = data,
      error: (err)  => console.error('Error al cargar clientes', err)
    });

    this.vehiculoService.list().subscribe({
      next:  (data) => this.todosLosVehiculos = data,
      error: (err)  => console.error('Error al cargar vehículos', err)
    });
    
    

    this.monedaService.list().subscribe({
      next:  (data) => this.tipoCambio = data,
      error: (err)  => console.error('Error al cargar tipo de cambio', err)
    });
  }

  ngOnDestroy(): void {
    if(this.sub) this.sub.unsubscribe()
  }

  onCambioDatos(): void {
    this.inputSubject.next()
  }

  onVehiculoChange(vehiculoId: number): void {
    const v = this.vehiculos.find(x => x.id_vehiculo === vehiculoId)
    if(v){
      this.precioVehiculoSeleccionado = v.precio_venta
      const monedaVehiculo = this.monedas.find(m => m.id_moneda === v.id_moneda)
      this.monedaSeleccionada = monedaVehiculo ? monedaVehiculo.codigo_iso : 'PEN'
      this.onCambioDatos()
    }
  }

  solicitarPreview(): void {
    if(!this.inputDTO.id_vehiculo || !this.inputDTO.plazo_meses) return;

    this.simulacionService.previewSimulation(this.inputDTO).subscribe({
      next: (res: any) => {
        this.previewData = res;
        this.cdr.detectChanges(); //
      },
      error: (err: any) => console.log('Faltan parametros para la proyeccion matematica', err)
    });
  }

  verCronograma(): void {
    if(this.respuestaSimulacion && this.respuestaSimulacion.id_simulacion){
      this.router.navigate(['/cronograma', this.respuestaSimulacion.id_simulacion])
    }
  }

  recalcularMontos(): void {
    if(this.vehiculoSeleccionado){
      this.cuotaInicialMoneda = this.vehiculoSeleccionado.precio_venta * (this.inputDTO.porcentaje_inicial / 100)
      this.cuotaBalonMoneda = this.vehiculoSeleccionado.precio_venta * (this.inputDTO.porcentaje_balon / 100)
    }
  }

  // Para el filtro
  onBuscarCliente(q: string): void {
    q = (q || '').trim().toLowerCase();
    if (q.length < 2) { 
      this.clientesFiltrados = []; 
      return; 
    }
    this.clientesFiltrados = this.todosLosClientes.filter(c => {
      const nombreFormateado = c.nombreCompleto ? c.nombreCompleto.toLowerCase() : '';
      const dniStr = c.dni ? c.dni.toString().toLowerCase() : '';
      
      return nombreFormateado.includes(q) || dniStr.includes(q);
    });
  }

  onBuscarVehiculo(q: string): void {
    q = (q || '').trim().toLowerCase();
    if (q.length < 2) { 
      this.vehiculosFiltrados = []; 
      return; 
    }
    this.vehiculosFiltrados = this.todosLosVehiculos.filter(v => {
      const marca = v.marca ? v.marca.toLowerCase() : '';
      const modelo = v.modelo ? v.modelo.toLowerCase() : '';
      
      return marca.includes(q) || modelo.includes(q);
    });
  }

  seleccionarCliente(cliente: Cliente): void {
    this.clienteSeleccionado  = cliente;
    this.busquedaCliente      = `${cliente.nombreCompleto} ${cliente.dni}`;
    this.inputDTO.id_cliente  = cliente.id_cliente;
    this.clientesFiltrados    = []; 

    this.onCambioDatos();
  }

  seleccionarVehiculo(vehiculo: Vehiculo): void {
    this.vehiculoSeleccionado  = vehiculo;
    this.busquedaVehiculo      = `${vehiculo.marca} ${vehiculo.modelo}`;
    this.inputDTO.id_vehiculo  = vehiculo.id_vehiculo;
    this.precioVehiculoSeleccionado = vehiculo.precio_venta; 
    this.vehiculosFiltrados    = [];

    const monedaVehiculo = this.monedas.find(m => m.id_moneda === vehiculo.id_moneda);
    this.monedaSeleccionada = monedaVehiculo ? monedaVehiculo.codigo_iso : 'PEN';

    this.recalcularMontos();
    this.onCambioDatos();
  }
  setMoneda(moneda: string): void {
    this.monedaSeleccionada = moneda;
    this.recalcularMontos();
    this.onCambioDatos()
  }
  
  calcular(){
    this.simulacionService.createSimulation(this.inputDTO).subscribe({
      next: (response: SimulacionResponseDTO) => {
        this.respuestaSimulacion = response
        this.router.navigate(['/cronograma', response.id_simulacion])
      },
      error: (err: any) => {
        alert("Error al procesar y guardar la simulacion")
      }
    })
  }
  

  get montoFinanciar(): number {
    return this.previewData ? this.previewData.monto_financiado : 0;
  }

  get cuotaMensual(): number {
    if (this.previewData?.cronograma && this.previewData.cronograma.length > 0) {
      return this.previewData.cronograma[0].cuota_total;
    }
    return 0;
  }

  get interesTotal(): number {
    return this.previewData ? this.previewData.total_intereses : 0;
  }

  get van(): number {
    return this.previewData ? this.previewData.van : 0;
  }

  get tir(): number {
    return this.previewData ? this.previewData.tir : 0;
  }

  get tcea(): number {
    return this.previewData ? this.previewData.tcea : 0;
  }
}
