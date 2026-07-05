import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import {CronogramaService} from "../../../core/services/Cronograma-service";

import {ExportPdfDialogComponent} from '../export-pdf-dialog/export-pdf-dialog'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-cronograma-view",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    
  ],
  templateUrl: "./cronograma-view.html",
  styleUrl: "./cronograma-view.css",
})
export class CronogramaViewComponent implements OnInit {

  columnasMostradas: string[] = [
    'numero_mes', 'saldo_inicial', 'amortizacion', 'interes',
    'seguro_vehicular', 'seguro_desgravamen', 'cuota_total', 'saldo_final'
  ];

  dataSource: any[] = [];

  // Para mi estimada el STATE
  simulacionData: any = null;
  clienteData:    any = null;
  vehiculoData:   any = null;
  inputDTOData:   any = null;
  tieneDatos: boolean = false;
  private route             = inject(ActivatedRoute);
  private router            = inject(Router);
  private cronogramaService = inject(CronogramaService);
  private cdr               = inject(ChangeDetectorRef);
  private dialog            = inject(MatDialog)

  constructor() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state) {
      this.simulacionData = nav.extras.state['simulacion'];
      this.clienteData    = nav.extras.state['cliente'];
      this.vehiculoData   = nav.extras.state['vehiculo'];
      this.inputDTOData   = nav.extras.state['inputDTO'];
      if (this.simulacionData?.cronograma) {
        this.dataSource = this.simulacionData.cronograma;
      }
      this.tieneDatos = true;
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        this.cargarCronograma(Number(idStr));
      }
    });
  }

  cargarCronograma(id: number): void {
    this.cronogramaService.obtenerPorSimulacion(id).subscribe({
      next: (cuotas: any[]) => {
        this.dataSource = cuotas
        this.cdr.detectChanges()
      },
      error: (err: any) => console.error('Error al cargar el cronograma:', err)
    });
  }

  exportarPDF(): void {
    const dialogRef = this.dialog.open(ExportPdfDialogComponent, {
      width: '1100px',
      maxWidth: '95vw',
      panelClass: 'custom-pdf-dialog',
      data: {
        clienteNombre: this.clienteNombre,
        vehiculo: this.vehiculoNombre,
        moneda: this.simboloMoneda,
        monto: this.montoFinanciado,
        plazo: this.plazoMeses,
        cuotas: this.dataSource,
        totalAmortizacion: this.totalAmortizacion,
        sumInteres: this.sumInteres,
        sumSeguroVehicular: this.sumSeguroVehicular,
        sumSeguroDesgravamen: this.sumSeguroDesgravamen,
        sumCuotaTotal: this.sumCuotaTotal
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.generarDocumentoFinal()
      }
    })
  }

  private generarDocumentoFinal(): void {
    setTimeout(() => {
      const element = document.getElementById('pdf-content');
      if (!element) return;

      const btn = document.querySelector('.btn-exportar') as HTMLButtonElement;
      const textoOriginal = btn ? btn.innerHTML : '';
      if (btn) btn.innerHTML = 'Generando documento...';

      const originalWidth = element.style.width;
      const originalMargin = element.style.margin;
      
      element.style.width = '1200px'; 
      element.style.margin = '0 auto';

      html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#F8FAFC',
        ignoreElements: (node) => node.classList && node.classList.contains('ignorar-pdf')
      }).then((canvas) => {
        
        element.style.width = originalWidth;
        element.style.margin = originalMargin;

        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210; 
        const pageHeight = 297;
        
        const marginX = 12; 
        const contentWidth = pdfWidth - (marginX * 2);
        
        const imgHeight = (canvas.height * contentWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 15; 

        pdf.addImage(imgData, 'PNG', marginX, position, contentWidth, imgHeight);
        heightLeft -= (pageHeight - position); 

        while (heightLeft > 0) {
          position = position - pageHeight; 
          pdf.addPage(); 
          pdf.addImage(imgData, 'PNG', marginX, position, contentWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        const nombreLimpio = this.clienteNombre ? this.clienteNombre.replace(/[^a-zA-Z0-9]/g, '_') : 'Cliente';
        pdf.save(`Cronograma_${nombreLimpio}.pdf`);

        if (btn) btn.innerHTML = textoOriginal;
      }).catch(err => {
         console.error('Error al generar PDF:', err);
        
         element.style.width = originalWidth;
         element.style.margin = originalMargin;
         if (btn) btn.innerHTML = textoOriginal;
      });
    }, 150);
  }

  get clienteNombre(): string {
    return this.clienteData?.nombreCompleto
        || this.simulacionData?.cliente?.nombreCompleto
        || 'Cliente';
  }

  get clienteIniciales(): string {
    const parts = this.clienteNombre.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return this.clienteNombre.substring(0, 2).toUpperCase();
  }

  get clienteDniMask(): string {
    const dni = this.clienteData?.dni || this.simulacionData?.cliente?.dni;
    if (!dni) return '*****';
    return dni.substring(0, 2) + '***' + dni.substring(dni.length - 3);
  }

  get vehiculoNombre(): string {
    const v = this.vehiculoData || this.simulacionData?.vehiculo;
    if (!v) return 'Vehículo';
    return `${v.marca} ${v.modelo}`;
  }

  get simboloMoneda(): string {

    if (this.vehiculoData?.id_moneda === 2) return '$';

    if (this.simulacionData?.vehiculo?.moneda?.id_moneda === 2) return '$';
    if (this.simulacionData?.vehiculo?.moneda?.codigo_iso === 'USD') return '$';

    if (this.simulacionData?.moneda_simulacion === 'USD') return '$';

    return 'S/';
  }


  get nombreMoneda(): string {
    return this.simboloMoneda === '$' ? 'USD' : 'PEN';
  }

  get plazoMeses(): number {
    return this.inputDTOData?.plazo_meses
        || this.simulacionData?.plazo_meses
        || this.dataSource.length;
  }

  get montoFinanciado(): number {
    if (this.simulacionData?.monto_financiado) {
      return this.simulacionData.monto_financiado;
    }
    const vehiculo = this.vehiculoData || this.simulacionData?.vehiculo;
    const porcentajeInicial = this.inputDTOData?.porcentaje_inicial
        || this.simulacionData?.porcentaje_inicial
        || 0;
    if (vehiculo) {
      const precio = vehiculo.precio_venta || 0;
      return precio - (precio * (porcentajeInicial / 100));
    }
    return 0;
  }

  get totalCuota(): number {
    if (this.simulacionData?.total_cuota_final) return this.simulacionData.total_cuota_final;
    return this.dataSource.reduce((acc, c) => acc + (c.cuota_total || 0), 0);
  }
  get cuotaMensualFija(): number {
    if (!this.dataSource?.length) return 0;
    return this.dataSource[0].cuota_total;
  }

  get ultimaCuota(): number {
    if (!this.dataSource?.length) return 0;
    return this.dataSource[this.dataSource.length - 1].cuota_total;
  }

  get temAprox(): number {
    const valorTasa = this.inputDTOData?.valor_tasa || this.simulacionData?.valor_tasa;
    if (!valorTasa) return 0;
    return (Math.pow(1 + (valorTasa / 100), 1/12) - 1) * 100;
  }
  get totalSeguroVehicular(): number {
    if (this.simulacionData?.total_seguro_vehicular) {
      return this.simulacionData.total_seguro_vehicular;
    }
    return this.dataSource.reduce((acc, c) => acc + (c.seguro_vehicular || 0), 0);
  }

  get totalSeguroDesgravamen(): number {
    if (this.simulacionData?.total_seguro_desgravamen) {
      return this.simulacionData.total_seguro_desgravamen;
    }
    return this.dataSource.reduce((acc, c) => acc + (c.seguro_desgravamen || 0), 0);
  }

  get interesTotal(): number {
    if (this.simulacionData?.total_intereses) {
      return this.simulacionData.total_intereses;
    }
    return this.dataSource.reduce((acc, c) => acc + (c.interes || 0), 0);
  }

//Las realaes mañas

  get tipoPeriodoGracia(): string {
    const tipo = this.inputDTOData?.tipo_gracia || this.simulacionData?.tipo_gracia || 'SIN_GRACIA';
    switch (tipo) {
      case 'TOTAL':   return 'TOTAL';
      case 'PARCIAL': return 'PARCIAL';
      default:        return 'SIN';
    }
  }

  get mesesGraciaTexto(): string {
    const meses = this.inputDTOData?.meses_gracia || this.simulacionData?.meses_gracia || 0;
    return meses > 0 ? `${meses} meses` : 'Sin gracia';
  }

  //Suma de la tabla
  get totalAmortizacion(): number { return this.dataSource.reduce((acc, c) => acc + (c.amortizacion || 0), 0); }
  get sumInteres(): number { return this.dataSource.reduce((acc, c) => acc + (c.interes || 0), 0); }
  get sumSeguroVehicular(): number { return this.dataSource.reduce((acc, c) => acc + (c.seguro_vehicular || 0), 0); }
  get sumSeguroDesgravamen(): number { return this.dataSource.reduce((acc, c) => acc + (c.seguro_desgravamen || 0), 0); }
  get sumCuotaTotal(): number { return this.dataSource.reduce((acc, c) => acc + (c.cuota_total || c.cuotaTotal || 0), 0); }
}

