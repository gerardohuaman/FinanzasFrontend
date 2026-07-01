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
import {Moneda} from "../../../models/Moneda";
import {MonedaService} from "../../../core/services/Moneda-service";

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
    private monedaService = inject(MonedaService);
    public  data          = inject<any>(MAT_DIALOG_DATA);

    form!: FormGroup;
    modoEdicion!: boolean;

    monedas: Moneda[] = [];
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
        this.monedaService.list().subscribe({
            next: (lista) => {
                this.monedas = lista;
                if (this.modoEdicion && this.data?.moneda) {
                    const monedaEncontrada = lista.find(
                        m => m.id_moneda === this.data.moneda.id_moneda
                    );
                    if (monedaEncontrada) {
                        this.form.patchValue({ moneda: monedaEncontrada });
                    }
                }
            },
            error: (err) => console.error('Error al cargar monedas', err)
        });
    }
    compararMoneda(m1: Moneda, m2: Moneda): boolean {
        return m1 && m2 ? m1.id_moneda === m2.id_moneda : m1 === m2;
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