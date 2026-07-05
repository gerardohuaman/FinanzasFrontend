import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";

@Component({
  selector: "app-export-pdf-dialog",
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: "./export-pdf-dialog.html",
  styleUrl: "./export-pdf-dialog.css",
})
export class ExportPdfDialogComponent {

  columnasMostradas: string[] = [
    'numero_mes', 'saldo_inicial', 'amortizacion', 'interes',
    'seguro_vehicular', 'seguro_desgravamen', 'cuota_total', 'saldo_final'
  ]

  constructor(
    public dialogRef: MatDialogRef<ExportPdfDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){}
}
