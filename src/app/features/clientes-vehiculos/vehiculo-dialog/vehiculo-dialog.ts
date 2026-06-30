import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-vehiculo-dialog',
    templateUrl: './vehiculo-dialog.html',
    imports: [
        ReactiveFormsModule,
        MatIcon,
        MatFormField,
        MatLabel,
        MatError,
        MatInput,
        MatSelect,
        MatOption,
        MatButton,
        NgIf,
        NgFor
    ],
    styleUrls: ['./vehiculo-dialog.css']
})
export class VehiculoDialogComponent implements OnInit {

    private fb            = inject(FormBuilder);
    private dialogRef     = inject(MatDialogRef<VehiculoDialogComponent>);
    /*private monedaService = inject(MonedaService);*/
    public  data          = inject<any>(MAT_DIALOG_DATA);

    form!: FormGroup;
    modoEdicion!: boolean;

    marcas: string[] = ['Toyota', 'Kia', 'Hyundai', 'Nissan', 'Chevrolet', 'Ford', 'Honda', 'Mazda'];
    monedas: string[] = [];
    cargandoMonedas = true;

    ngOnInit(): void {
        this.modoEdicion = !!this.data;

        this.form = this.fb.group({
            marca:   [this.data?.marca   ?? '',   Validators.required],
            modelo:  [this.data?.modelo  ?? '',   Validators.required],
            moneda:  [this.data?.moneda  ?? '',   Validators.required],
            version: [this.data?.version ?? '',   Validators.required],
            precio:  [this.data?.precio  ?? null, [Validators.required, Validators.min(1000)]]
        });

        this.cargarMonedas();
    }

    private cargarMonedas(): void {
        /*this.monedaService.obtenerMonedas().subscribe({
            next: (lista) => {
                this.monedas = lista;
                this.cargandoMonedas = false;
            },
            error: (err) => {
                console.error('Error al cargar monedas', err);
                this.cargandoMonedas = false;
            }
        });*/
    }

    confirmar(): void {
        if (this.form.valid) {
            const resultado = {
                ...this.form.getRawValue(),
                ...(this.modoEdicion && { id: this.data.id })
            };
            this.dialogRef.close(resultado);
        } else {
            this.form.markAllAsTouched();
        }
    }

    cancelar(): void {
        this.dialogRef.close();
    }
}