import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { SimulacionResponseDTO } from "../../../models/SimulacionResponseDTO";
import { CronogramaPagosDTO } from "../../../models/CronogramaPagosDTO";
import { ActivatedRoute } from "@angular/router";
import { SimulacionService } from "../../../core/services/Simulacion-service";

@Component({
  selector: "app-cronograma-view",
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: "./cronograma-view.html",
  styleUrl: "./cronograma-view.css",
})
export class CronogramaViewComponent implements OnInit{
  @Input() simulacionData!: any

  columnasMostradas: string[] = [
    'numero_mes',
    'saldo_inicial',
    'amortizacion',
    'interes',
    'seguro_vehicular',
    'seguro_desgravamen',
    'cuota_total',
    'saldo_final'
  ]

  dataSource: any[] = []

  private route = inject(ActivatedRoute)
  private simulacionService = inject(SimulacionService)

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id')
      if(idStr){
        this.cargarDatos(Number(idStr))
      } else if(this.simulacionData){
        this.dataSource = this.simulacionData.cronograma || []
      } else {
        this.simulacionData = null
      }
    })
  }

  cargarDatos(id: number) {
    this.simulacionData.list().subscribe({
      next: (simulaciones: any[]) => {
        const encontrada = simulaciones.find(s => s.id_simulacion === id || s.id === id)
        if(encontrada){
          this.simulacionData = encontrada
          this.dataSource = encontrada.cronograma || []
        }
      },
      error: (err: any) => console.error('Error al cargar la simulacion:', err)
    })
  }

  exportarPDF(){
    window.print()
    //console.log("Iniciando exportacion a PDF segun la US07")
  }

  // ==========================================
  // GETTERS DINÁMICOS PARA EVITAR HARDCODEO
  // ==========================================
  
  get idCredito(): string {
    return this.simulacionData?.id_simulacion || '8842';
  }

  get clienteNombre(): string {
    return this.simulacionData?.cliente?.nombreCompleto || 'Cliente Referencial';
  }

  get clienteIniciales(): string {
    const parts = this.clienteNombre.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return this.clienteNombre.substring(0, 2).toUpperCase();
  }

  get clienteDniMask(): string {
    const dni = this.simulacionData?.cliente?.dni;
    if (!dni) return '09***411';
    return dni.substring(0, 2) + '***' + dni.substring(dni.length - 3);
  }

  get vehiculoNombre(): string {
    if (!this.simulacionData?.vehiculo) return 'Vehículo Estándar 2024';
    return `${this.simulacionData.vehiculo.marca} ${this.simulacionData.vehiculo.modelo}`;
  }

  get simboloMoneda(): string {
    return (this.simulacionData?.moneda_simulacion === 'USD' || this.simulacionData?.vehiculo?.moneda?.codigo_iso === 'USD') ? '$' : 'S/';
  }

  get nombreMoneda(): string {
    return this.simboloMoneda === '$' ? 'USD' : 'PEN';
  }

  get plazoMeses(): number {
    return this.simulacionData?.plazo_meses || (this.dataSource.length ? this.dataSource.length : 48);
  }

  get montoFinanciado(): number {
    return this.simulacionData?.monto_financiado || 50000;
  }

  get totalCuota(): number {
    if (!this.dataSource || this.dataSource.length === 0) return 61609.48;
    return this.dataSource.reduce((acc, c) => acc + (c.cuota_total || 0), 0);
  }

  get interesTotal(): number {
    if (this.simulacionData?.total_intereses) return this.simulacionData.total_intereses;
    if (!this.dataSource || this.dataSource.length === 0) return 8068.49;
    return this.dataSource.reduce((acc, c) => acc + (c.interes || 0), 0);
  }

  get cuotaMensualFija(): number {
    if (!this.dataSource || this.dataSource.length === 0) return 1310.84;
    return this.dataSource[0].cuota_total;
  }

  get ultimaCuota(): number {
    if (!this.dataSource || this.dataSource.length === 0) return 10589.65;
    return this.dataSource[this.dataSource.length - 1].cuota_total;
  }

  get temAprox(): number {
    if (this.simulacionData?.valor_tasa) {
      return (Math.pow(1 + (this.simulacionData.valor_tasa / 100), 1/12) - 1) * 100;
    }
    return 0.9864; // Fallback visual
  }
}
