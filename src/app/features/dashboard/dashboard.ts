import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { ClienteService } from "../../core/services/Cliente-service";
import { VehiculoService } from "../../core/services/Vehiculo-service";
import { SimulacionService } from "../../core/services/Simulacion-service";
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: "./dashboard.html",
  styleUrl: "./dashboard.css",
})
export class DashboardComponent implements OnInit {
  columnasRecientes: string[] = ['cliente', 'vehiculo', 'monto', 'cronograma']
  totalClientes: number = 0
  totalVehiculos: number = 0
  valorFlotaUSD: number = 0
  actividadReciente: any[] = []

  constructor(
    private clienteService: ClienteService,
    private vehiculoService: VehiculoService,
    private simulacionService: SimulacionService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.cargarMetricasSistema()
  }

  cargarMetricasSistema(): void {
    this.clienteService.list().subscribe({
      next: (clientes: any[]) => {
        this.totalClientes = clientes.length
      },
      error: (err) => console.error('Error al recuperar clientes-vehiculos para el dashboard', err)
    })

    this.vehiculoService.list().subscribe({
      next: (vehiculos) => {
        this.totalVehiculos = vehiculos.length
        this.valorFlotaUSD = vehiculos.reduce((acumulador, v) => acumulador + (v.precio_venta || 0), 0)
      },
      error: (err) => console.error('Error al recuperar vehiculos para el dashboard', err)
    })

    this.simulacionService.list().subscribe({
      next: (simulaciones) => {
        this.actividadReciente = simulaciones
            .sort((a,b) => b.id - a.id)
            .slice(0, 5)
      },
      error: (err) => console.error('Error al recuperar transacciones recientes', err)
    })
  }

  irAlCronograma(simulacionId: number): void{
    this.router.navigate(['/cronograma', simulacionId])
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
}
