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
import {MatTooltipModule} from "@angular/material/tooltip";
import {HistorialTipoCambioService} from "../../../core/services/HistorialTipoCambio-service";

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
    MatRadioModule,
    MatTooltipModule
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
  //Entradas de datos para simulacro
  inputDTO: SimulacionInputDTO = new SimulacionInputDTO();
  monedaSeleccionada: string = 'PEN';

  cuotaInicialMoneda: number = 0;
  cuotaBalonMoneda:   number = 0;
  //Para el historial tipo de cambio ojo
  precioConvertido: number = 0;
  tipoCambio: any = null;

  respuestaSimulacion: SimulacionResponseDTO | null = null
  previewData: SimulacionResponseDTO | null = null

  private inputSubject = new Subject<void>()
  private sub?: Subscription

  private clienteService = inject(ClienteService)
  private vehiculoService = inject(VehiculoService)
  private monedaService = inject(MonedaService)
  private simulacionService = inject(SimulacionService)
  private tipoCambioService = inject(HistorialTipoCambioService);
  private router = inject(Router)
  private cdr = inject(ChangeDetectorRef)

  ngOnInit(): void {
    this.inputDTO.id_tipo_cambio = 1;
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
    this.inputDTO.cok = 1.0;

    this.clienteService.list().subscribe({
      next: (data) => { this.clientes = data; this.todosLosClientes = data; },
      error: (err) => console.error('Error al cargar clientes', err)
    });

    this.vehiculoService.list().subscribe({
      next: (data) => { this.vehiculos = data; this.todosLosVehiculos = data; },
      error: (err) => console.error('Error al cargar vehículos', err)
    });

    this.monedaService.list().subscribe({
      next: (data) => this.monedas = data,
      error: (err) => console.error('Error al cargar monedas', err)
    });

    this.tipoCambioService.getUltimo().subscribe({
      next: (data) => {
        this.tipoCambio = data;
        this.inputDTO.id_tipo_cambio = data.id_tipo_cambio;
      },
      error: (err) => console.error('Error al cargar tipo de cambio', err)
    });

    this.sub = this.inputSubject.pipe(debounceTime(500)).subscribe(() => {
      this.solicitarPreview();
    });
  }

  ngOnDestroy(): void {
    if(this.sub) this.sub.unsubscribe()
  }

  onCambioDatos(): void {
    //Para los decimales, solo 4
    this.inputDTO.tasa_desgravamen   = this.redondear4(this.inputDTO.tasa_desgravamen);
    this.inputDTO.tasa_vehicular     = this.redondear4(this.inputDTO.tasa_vehicular);
    this.inputDTO.valor_tasa         = this.redondear4(this.inputDTO.valor_tasa);
    this.inputDTO.porcentaje_inicial = this.redondear4(this.inputDTO.porcentaje_inicial);
    this.inputDTO.porcentaje_balon   = this.redondear4(this.inputDTO.porcentaje_balon);

    this.inputSubject.next();
  }

  private redondear4(valor: number): number {
    return Math.round(valor * 10000) / 10000;
  }

  recalcularMontos(): void {
    if (!this.vehiculoSeleccionado) return;
    const precioOriginal = this.vehiculoSeleccionado.precio_venta;
    const monedaVehiculo = this.vehiculoSeleccionado.id_moneda;

    if (monedaVehiculo === 2 && this.monedaSeleccionada === 'PEN') {
      this.precioConvertido = this.tipoCambio
          ? precioOriginal * this.tipoCambio.valor_venta
          : precioOriginal;
    } else if (monedaVehiculo === 1 && this.monedaSeleccionada === 'USD') {
      this.precioConvertido = this.tipoCambio
          ? precioOriginal / this.tipoCambio.valor_compra
          : precioOriginal;
    } else {
      this.precioConvertido = precioOriginal; // misma moneda
    }

    this.cuotaInicialMoneda = this.precioConvertido * (this.inputDTO.porcentaje_inicial / 100);
    this.cuotaBalonMoneda   = this.precioConvertido * (this.inputDTO.porcentaje_balon   / 100);
  }

  // Para el filtro
  onBuscarCliente(q: string): void {
    this.clienteSeleccionado = null;
    this.inputDTO.id_cliente = 0;
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
    this.onCambioDatos();
  }

  onBuscarVehiculo(q: string): void {
    this.vehiculoSeleccionado = null;
    this.inputDTO.id_vehiculo = 0;

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
    this.onCambioDatos();
  }

  onTipoGraciaChange(valor: string): void {
    this.inputDTO.tipo_gracia = valor;
    if (valor === 'SIN_GRACIA') {
      this.inputDTO.meses_gracia = 0;
    }
    this.onCambioDatos();
  }
  seleccionarCliente(cliente: Cliente): void {
    this.clienteSeleccionado  = cliente;
    this.busquedaCliente      = `${cliente.nombreCompleto} - ${cliente.dni}`;
    this.inputDTO.id_cliente  = cliente.id_cliente;
    this.clientesFiltrados    = []; 

    this.onCambioDatos();
  }

  seleccionarVehiculo(vehiculo: Vehiculo): void {
    this.vehiculoSeleccionado  = vehiculo;
    this.busquedaVehiculo      = `${vehiculo.marca} - ${vehiculo.modelo} - ${vehiculo.id_moneda == 2 ? '$ ' : 'S/'} ${vehiculo.precio_venta}`;
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

    if (moneda === 'PEN') {
      this.inputDTO.id_tipo_cambio = 1;
    } else if (moneda === 'USD') {
      this.inputDTO.id_tipo_cambio = 2;
    }

    this.recalcularMontos();
    this.onCambioDatos();
  }
  solicitarPreview(): void {
    if(!this.inputDTO.id_vehiculo || !this.inputDTO.plazo_meses) return;

    this.simulacionService.previewSimulation(this.inputDTO).subscribe({
      next: (res: any) => {
        this.previewData = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.log('Faltan parametros para la proyeccion matematica', err)
    });
  }
  calcular(){
    if (!this.formularioValido) {
      alert('Completa todos los campos requeridos correctamente antes de continuar.');
      return;
    }
    this.simulacionService.createSimulation(this.inputDTO).subscribe({
      next: (response: SimulacionResponseDTO) => {
        this.respuestaSimulacion = response;
        this.router.navigate(['/cronograma', response.id_simulacion], {
          state: {
            simulacion: response,
            cliente: this.clienteSeleccionado,
            vehiculo: this.vehiculoSeleccionado,
            inputDTO: this.inputDTO
          }
        });
      },
      error: (err: any) => {
        alert("Error al procesar y guardar la simulacion");
      }
    });
  }
  get montoFinanciar(): number {
    return this.precioConvertido - this.cuotaInicialMoneda;
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
    return this.previewData ? this.redondear4(this.previewData.tir * 100) : 0;
  }

  get tcea(): number {
    return this.previewData ? this.redondear4(this.previewData.tcea * 100) : 0;
  }



  //VAlidaciones

  get errorValorTasa(): string | null {
    if (this.inputDTO.valor_tasa > 113.16) {
      return 'La tasa no puede superar 113.16% (límite SBS)';
    }
    if (this.inputDTO.valor_tasa <= 0) {
      return 'La tasa debe ser mayor a 0';
    }
    return null;
  }

  get errorPlazoMeses(): string | null {
    if (this.inputDTO.plazo_meses < 12 || this.inputDTO.plazo_meses > 72) {
      return 'El plazo deben estar entre 12 y 72 meses';
    }
    return null;
  }

  get errorMesesGracia(): string | null {
    if (this.inputDTO.tipo_gracia === 'SIN_GRACIA') return null;
    if (this.inputDTO.meses_gracia < 1 || this.inputDTO.meses_gracia > 6) {
      return 'Los meses de gracia deben estar entre 1 y 6';
    }
    return null;
  }

  get errorPorcentajeInicial(): string | null {
    if (this.inputDTO.porcentaje_inicial < 10 || this.inputDTO.porcentaje_inicial > 40) {
      return 'La cuota inicial debe estar entre 10% y 40%';
    }
    return null;
  }

  get errorPorcentajeBalon(): string | null {
    if (this.inputDTO.porcentaje_balon < 10 || this.inputDTO.porcentaje_balon > 40) {
      return 'La cuota balón debe estar entre 10% y 40%';
    }
    return null;
  }

  get errorClienteVehiculo(): string | null {
    if (!this.clienteSeleccionado) return 'Selecciona un cliente';
    if (!this.vehiculoSeleccionado) return 'Selecciona un vehículo';
    return null;
  }
  get errorTasaDesgravamen(): string | null {
    if (this.inputDTO.tasa_desgravamen <= 0) {
      return 'La tasa de desgravamen debe ser mayor a 0';
    }
    if (this.inputDTO.tasa_desgravamen > 1) {
      return 'La tasa de desgravamen no puede superar 1%';
    }
    return null;
  }

  get errorTasaVehicular(): string | null {
    if (this.inputDTO.tasa_vehicular <= 0) {
      return 'La tasa vehicular debe ser mayor a 0';
    }
    if (this.inputDTO.tasa_vehicular > 1) {
      return 'La tasa vehicular no puede superar 1%';
    }
    return null;
  }
  //Para inputs validos
  get formularioValido(): boolean {
    const valido = !this.errorValorTasa
        && !this.errorPlazoMeses
        && !this.errorMesesGracia
        && !this.errorPorcentajeInicial
        && !this.errorPorcentajeBalon
        && !this.errorTasaDesgravamen
        && !this.errorTasaVehicular
        && !this.errorClienteVehiculo
        && !!this.previewData;

    return valido;
  }
  get tasaAplicadaLabel(): string {
    if (!this.tipoCambio || !this.vehiculoSeleccionado) return '';

    if (this.vehiculoSeleccionado.id_moneda === 2 && this.monedaSeleccionada === 'PEN') {
      return `Tipo venta: S/ ${this.tipoCambio.valor_venta}`;
    }
    if (this.vehiculoSeleccionado.id_moneda === 1 && this.monedaSeleccionada === 'USD') {
      return `Tipo compra: S/ ${this.tipoCambio.valor_compra}`;
    }
    return '';
  }
}
