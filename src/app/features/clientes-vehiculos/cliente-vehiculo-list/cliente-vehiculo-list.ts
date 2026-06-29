import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { Cliente } from "../../../models/Cliente";
import { ClienteService } from "../../../core/services/Cliente-service";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import {VehiculoService} from "../../../core/services/Vehiculo-service";
import {ClienteDialogComponent} from "../cliente-dialog/cliente-dialog";
import {MatDialog, MatDialogModule} from '@angular/material/dialog';

@Component({
  selector: "app-cliente-vehiculo-list",
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule,
      MatDialogModule
  ],
  templateUrl: "./cliente-vehiculo-list.html",
  styleUrl: "./cliente-vehiculo-list.css",
})
export class ClienteListComponent implements OnInit{
  //Clientes
  columnasClientes: string[] = ['dni', 'nombreCompleto', 'email', 'telefono', 'ingresos', 'acciones']
  dataSourceClientes = new MatTableDataSource<Cliente>([])
  @ViewChild('paginatorClientes') paginatorClientes!: MatPaginator
  //Vehiculos
  columnasVehiculos = ['codigo', 'marca', 'modelo', 'precio', 'moneda', 'acciones'];
  dataSourceVehiculos = new MatTableDataSource<any>([]);
  @ViewChild('paginatorVehiculos') paginatorVehiculos!: MatPaginator;

  tabActiva: 'clientes' | 'vehiculos' = 'clientes';

  cambiarTab(tab: 'clientes' | 'vehiculos') {
    this.tabActiva = tab;
  }
  constructor(private clienteService: ClienteService,private vehiculoService: VehiculoService, private dialog: MatDialog ){}
  ngOnInit(): void {
    this.cargarClientes();
    this.cargarVehiculos();
  }
  ngAfterViewInit(): void {
    this.dataSourceClientes.paginator = this.paginatorClientes;
    this.dataSourceVehiculos.paginator = this.paginatorVehiculos;
  }
  //Clientes
  cargarClientes(){
    this.clienteService.list().subscribe({
      next: (data) => {
        this.dataSourceClientes.data = data
        this.dataSourceClientes.paginator = this.paginatorClientes
      },
      error: (err) => console.error('Error al mapear base de datos de clientes-vehiculos', err)
    })
  }

  aplicarFiltroCliente(event: Event){
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSourceClientes.filter = filterValue.trim().toLocaleLowerCase()
  }

  abrirModalNuevoCliente(){
    this.dialog.open(ClienteDialogComponent, {
      data: null
    }).afterClosed().subscribe(resultado => {
      if (resultado) console.log('Crear:', resultado);
    });
  }

  //Vehiculos
  cargarVehiculos() {
    this.vehiculoService.list().subscribe({
      next: (data) => {
        this.dataSourceVehiculos.data = data
        this.dataSourceVehiculos.paginator = this.paginatorVehiculos
      },
      error: (err) => console.error('Error al mapear base de datos de vehiculos', err)
    })
  }
  aplicarFiltroVehiculos(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSourceVehiculos.filter = valor.trim().toLowerCase();
  }
  abrirModalNuevoVehiculo() {
    console.log("Abrir modal para registrar nuevo vehículo")
  }
}
