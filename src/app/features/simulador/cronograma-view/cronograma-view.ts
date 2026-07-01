import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { SimulacionResponseDTO } from "../../../models/SimulacionResponseDTO";
import { CronogramaPagosDTO } from "../../../models/CronogramaPagosDTO";

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
export class CronogramaViewComponent {
  @Input() simulacionData!: SimulacionResponseDTO

  columnasMostradas: string[] = [
    'numero_mes',
    'saldo_inicial',
    'amortizacion',
    'interes',
    'seguro_vehicular',
    'seguro:desgravamen',
    'cuota_total',
    'saldo_final'
  ]

  dataSource: CronogramaPagosDTO[] = []

  ngOnInit(): void {
    if(!this.simulacionData){
      this.dataSource = [
        {numero_mes: 1, fecha_pago: '01/06/2026', saldo_inicial: 50000.00, amortizacion: 1041.67, interes: 171.67, seguro_vehicular: 12.50, seguro_desgravamen: 85.00, cuota_total: 1310.84, saldo_final: 48958.33},
        {numero_mes: 2, fecha_pago: '01/07/2026', saldo_inicial: 48958.33, amortizacion: 1041.67, interes: 171.67, seguro_vehicular: 12.50, seguro_desgravamen: 85.00, cuota_total: 1310.84, saldo_final: 47916.67},
        {numero_mes: 3, fecha_pago: '01/08/2026', saldo_inicial: 47916.67, amortizacion: 1041.67, interes: 171.67, seguro_vehicular: 12.50, seguro_desgravamen: 85.00, cuota_total: 1310.84, saldo_final: 46875.01}
      ]
    } else {
      this.dataSource = this.simulacionData.cronograma
    }
  }

  exportarPDF(){
    console.log("Iniciando exportacion a PDF segun la US07")
  }
}
