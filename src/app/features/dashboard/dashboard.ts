import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { ClienteService } from "../../core/services/Cliente-service";
import { VehiculoService } from "../../core/services/Vehiculo-service";
import { SimulacionService } from "../../core/services/Simulacion-service";
import { Router, RouterLink } from "@angular/router";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
  ],
  templateUrl: "./dashboard.html",
  styleUrl: "./dashboard.css",
})
export class DashboardComponent implements OnInit {
  columnasRecientes: string[] = ['cliente', 'vehiculo', 'monto', 'cronograma']
  totalClientes: number = 0
  totalVehiculos: number = 0
  valorFlotaUSD: number = 0

  dataSource = new MatTableDataSource<any>([])

  @ViewChild(MatPaginator) paginator!: MatPaginator

  actividadReciente: any[] = []

  constructor(
    private clienteService: ClienteService,
    private vehiculoService: VehiculoService,
    private simulacionService: SimulacionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ){}

  ngOnInit(): void {
    this.cargarMetricasSistema()
  }

  ngAfterViewInit(){
    this.dataSource.paginator = this.paginator
  }

  cargarMetricasSistema(): void {
    this.clienteService.list().subscribe({
      next: (clientes: any[]) => {
        this.totalClientes = clientes.length
        this.cdr.detectChanges()
      },
      error: (err) => console.error('Error al recuperar clientes-vehiculos para el dashboard', err)
    })

    this.vehiculoService.list().subscribe({
      next: (vehiculos) => {
        this.totalVehiculos = vehiculos.length
        this.valorFlotaUSD = vehiculos.reduce((acumulador, v) => acumulador + (v.precio_venta || 0), 0)
        this.cdr.detectChanges()
      },
      error: (err) => console.error('Error al recuperar vehiculos para el dashboard', err)
    })

    this.simulacionService.list().subscribe({
      next: (simulaciones) => {
        const ordenadas = simulaciones.sort((a,b) => b.id_simulacion - a.id_simulacion)
        this.dataSource.data = ordenadas
        this.cdr.detectChanges()
      },
      error: (err) => console.error('Error al recuperar transacciones recientes', err)
    })
  }

  irAlCronograma(element: any): void{
    this.router.navigate(['/cronograma', element.id_simulacion],{
      state: {
        simulacion: element,
        cliente: element.cliente,
        vehiculo: element.vehiculo
      }
    })
  }

  getInitials(nombreCompleto: string): string {
    if (!nombreCompleto) return 'C';
    const parts = nombreCompleto.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  maskDni(dni: string): string {
    if (!dni || dni.length < 6) return dni || 'No reg.';
    return dni.substring(0, 2) + '***' + dni.substring(dni.length - 3);
  }

  calcularMontoFinanciado(simulacion: any): number {
    if(!simulacion || !simulacion.vehiculo) return 0

    const precio = simulacion.vehiculo.precio_venta || 0
    const porcentajeInicial = simulacion.porcentaje_inicial || 0

    return precio -(precio * (porcentajeInicial / 100))
  }

  getSimboloMoneda(idMoneda: number): string {
    return idMoneda === 2 ? '$' : 'S/'
  }
}
