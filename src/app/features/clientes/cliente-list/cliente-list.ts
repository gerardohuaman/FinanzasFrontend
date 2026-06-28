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

@Component({
  selector: "app-cliente-list",
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule
  ],
  templateUrl: "./cliente-list.html",
  styleUrl: "./cliente-list.css",
})
export class ClienteListComponent implements OnInit{
  columnasMostradas: string[] = ['dni', 'nombreCompleto', 'email', 'telefono', 'ingresos', 'fecha', 'acciones']
  dataSource = new MatTableDataSource<Cliente>([])

  @ViewChild(MatPaginator) paginator!: MatPaginator

  constructor(private clienteService: ClienteService){}

  ngOnInit(): void {
    this.cargarClientes()
  }

  cargarClientes(){
    this.clienteService.list().subscribe({
      next: (data) => {
        this.dataSource.data = data
        this.dataSource.paginator = this.paginator
      },
      error: (err) => console.error('Error al mapear base de datos de clientes', err)
    })
  }

  aplicarFiltro(event: Event){
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLocaleLowerCase()
  }

  abrirModalNuevoCliente(){
    console.log("Abrir modal para registrar nuevo cliente")
  }
}
