import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { Cliente } from "../../../models/Cliente";
import {Vehiculo} from "../../../models/Vehiculo";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {VehiculoService} from "../../../core/services/Vehiculo-service";
import { ClienteService } from "../../../core/services/Cliente-service";
import {ClienteDialogComponent} from "../cliente-dialog/cliente-dialog";
import {VehiculoDialogComponent} from "../vehiculo-dialog/vehiculo-dialog";


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
    this.dataSourceClientes.data = [
      {id_cliente:1,dni: '45892012', nombreCompleto: 'Carlos', telefono: '987 654 321',   email: 'c.ruiz@email.com',ingresos_mensuales: 4500.00 },
      {id_cliente:2,dni: '72103445', nombreCompleto: 'Mariana', telefono: '955 123 098',  email: 'm.santos_88@gmail.com', ingresos_mensuales: 6200.00 },
    ];
    //Para backend
    /*    this.clienteService.list().subscribe({
      next: (data) => {
        this.dataSourceClientes.data = data;
        this.dataSourceClientes.paginator = this.paginatorClientes;
      },
      error: (err) => console.error('Error al cargar clientes', err)
    });*/
  }

  aplicarFiltroCliente(event: Event){
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSourceClientes.filter = filterValue.trim().toLocaleLowerCase()
  }

  abrirModalNuevoCliente(){
    this.dialog.open(ClienteDialogComponent, {
      data: null
    }).afterClosed().subscribe(resultado => {
      if (!resultado) console.log('Crear:', resultado);

      const nuevoCliente: Cliente = {
        id_cliente: 0, //No se usa para backend
        dni: resultado.dni,
        nombreCompleto: resultado.nombreCompleto,
        telefono: resultado.telefono,
        email: resultado.email,
        ingresos_mensuales: resultado.ingresos_mensuales
      };
      this.clienteService.insert(nuevoCliente).subscribe({
        next: () => this.cargarClientes(),
        error: (err) => console.error('Error al registrar cliente', err)
      });
    });
  }
  abrirModalEditarCliente(cliente: any){
    this.dialog.open(ClienteDialogComponent, {
      data: cliente
    }).afterClosed().subscribe(resultado => {
      if (!resultado) return;

      const clienteActualizado: Cliente = {
        id_cliente: cliente.id_cliente,
        dni: resultado.dni,
        nombreCompleto: resultado.nombreCompleto,
        telefono: resultado.telefono,
        email: resultado.email,
        ingresos_mensuales: resultado.ingresos_mensuales
      };

      this.clienteService.update(clienteActualizado).subscribe({
        next: () => this.cargarClientes(),
        error: (err) => console.error('Error al actualizar cliente', err)
      });
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
    this.dialog.open(VehiculoDialogComponent, {
      data: null
    }).afterClosed().subscribe(resultado => {
      if (!resultado) return;

      const nuevoVehiculo: Vehiculo = {
        id_vehiculo: 0,//No se usa para backend
        marca: resultado.marca,
        modelo: resultado.modelo,
        precio_venta: resultado.precio_venta,
        moneda: resultado.moneda
      };

      this.vehiculoService.insert(nuevoVehiculo).subscribe({
        next: () => this.cargarVehiculos(),
        error: (err) => console.error('Error al registrar vehículo', err)
      });

    });
  }
  abrirModalEditarVehiculo(vehiculo: any){
    this.dialog.open(VehiculoDialogComponent, {
      data: vehiculo
    }).afterClosed().subscribe(resultado => {
      if (!resultado) return;

      const vehiculoActualizado: Vehiculo = {
        id_vehiculo: vehiculo.id_vehiculo,
        marca: resultado.marca,
        modelo: resultado.modelo,
        precio_venta: resultado.precio_venta,
        moneda: resultado.moneda
      };

      this.vehiculoService.update(vehiculoActualizado).subscribe({
        next: () => this.cargarVehiculos(),
        error: (err) => console.error('Error al actualizar vehículo', err)
      });
    });
  }
}
