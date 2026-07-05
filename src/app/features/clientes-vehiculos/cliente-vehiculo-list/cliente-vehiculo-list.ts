import { CommonModule } from "@angular/common";
import {Component, inject, OnInit, ViewChild} from "@angular/core";
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
import {MonedaService} from "../../../core/services/Moneda-service";
import {Moneda} from "../../../models/Moneda";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTooltip} from "@angular/material/tooltip";


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
    MatDialogModule,
    MatCheckboxModule,
    MatTooltip
  ],
  templateUrl: "./cliente-vehiculo-list.html",
  styleUrl: "./cliente-vehiculo-list.css",
})
export class ClienteListComponent implements OnInit{
  //Clientes
  columnasClientes: string[] = ['dni', 'nombreCompleto', 'email', 'telefono', 'telefonoSecundario', 'aceptaTratamientoDatos', 'ingresos', 'acciones']
  dataSourceClientes = new MatTableDataSource<Cliente>([])
  @ViewChild('paginatorClientes') paginatorClientes!: MatPaginator
  //Vehiculos
  columnasVehiculos = ['id_vehiculo', 'marca', 'modelo', 'precio_venta', 'id_moneda', 'acciones'];
  dataSourceVehiculos = new MatTableDataSource<any>([]);
  @ViewChild('paginatorVehiculos') paginatorVehiculos!: MatPaginator;

  //Moneda
  private monedaService = inject(MonedaService);
  monedas: any[] = [];
  tabActiva: 'clientes' | 'vehiculos' = 'clientes';

  cambiarTab(tab: 'clientes' | 'vehiculos') {
    this.tabActiva = tab;
  }
  constructor(private clienteService: ClienteService,private vehiculoService: VehiculoService, private dialog: MatDialog ){}
  ngOnInit(): void {
    this.cargarClientes();
    this.cargarVehiculos();
    this.cargarMonedas();
    // Filtro personalizado para Clientes ojito solo nombre y DNI
    this.dataSourceClientes.filterPredicate = (data: Cliente, filter: string) => {
      const nombre = (data.nombreCompleto || '').toLowerCase();
      const dni = (data.dni || '').toString();
      return nombre.includes(filter) || dni.startsWith(filter);
    };

    // Filtro personalizado para Vehículos, solo para marca y modelo
    this.dataSourceVehiculos.filterPredicate = (data: any, filter: string) => {
      const marca = (data.marca || '').toLowerCase();
      const modelo = (data.modelo || '').toLowerCase();
      return marca.includes(filter) || modelo.includes(filter);
    };
  }
  ngAfterViewInit(): void {
    this.dataSourceClientes.paginator = this.paginatorClientes;
    this.dataSourceVehiculos.paginator = this.paginatorVehiculos;
  }

  //Monedas
  cargarMonedas(): void {
    this.monedaService.list().subscribe({
      next: (data) => this.monedas = data,
      error: (err) => console.error('Error al cargar monedas', err)
    });
  }
  obtenerCodigoMoneda(id_moneda: number): string {
    console.log('id_moneda recibido:', id_moneda, '| monedas cargadas:', this.monedas);
    return this.monedas.find(m => m.id_moneda === id_moneda)?.codigo_iso ?? '';
  }
  //Clientes
  cargarClientes(){
    this.clienteService.list().subscribe({
      next: (data) => {
        this.dataSourceClientes.data = data;
        this.dataSourceClientes.paginator = this.paginatorClientes;
      },
      error: (err) => console.error('Error al cargar clientes', err)
    });
  }

  aplicarFiltroCliente(event: Event){
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSourceClientes.filter = filterValue.trim().toLocaleLowerCase()
  }

  abrirModalNuevoCliente(){
    this.dialog.open(ClienteDialogComponent, { data: null }).afterClosed().subscribe(resultado => {
      if (!resultado) return;

      const nuevoCliente: Cliente = {
        id_cliente: 0,
        dni: resultado.dni,
        nombreCompleto: resultado.nombreCompleto,
        telefono: resultado.telefono,
        telefonoSecundario: resultado.telefonoSecundario,
        email: resultado.email,
        ingresos_mensuales: resultado.ingresos_mensuales,
        aceptaTratamientoDatos: resultado.aceptaTratamientoDatos
      };

      this.clienteService.insert(nuevoCliente).subscribe({
        next: () => this.cargarClientes(),
        error: (err) => console.error('Error al registrar cliente', err)
      });
    });
  }
  abrirModalEditarCliente(cliente: any){
    this.dialog.open(ClienteDialogComponent, { data: cliente }).afterClosed().subscribe(resultado => {
      if (!resultado) return;

      const clienteActualizado: Cliente = {
        id_cliente: cliente.id_cliente,
        dni: resultado.dni,
        nombreCompleto: resultado.nombreCompleto,
        telefono: resultado.telefono,
        telefonoSecundario: resultado.telefonoSecundario,   // ← agregar
        email: resultado.email,
        ingresos_mensuales: resultado.ingresos_mensuales,
        aceptaTratamientoDatos: resultado.aceptaTratamientoDatos  // ← agregar
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
        id_moneda: resultado.id_moneda
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
        id_moneda: resultado.id_moneda
      };

      this.vehiculoService.update(vehiculoActualizado).subscribe({
        next: () => this.cargarVehiculos(),
        error: (err) => console.error('Error al actualizar vehículo', err)
      });
    });
  }
}
