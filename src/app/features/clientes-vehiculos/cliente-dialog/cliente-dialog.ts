import { Component, inject, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {MatIcon} from "@angular/material/icon";
import {MatError, MatFormField, MatHint, MatInput, MatLabel} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {NgIf} from "@angular/common";

@Component({
    selector: 'app-cliente-dialog',
    templateUrl: './cliente-dialog.html',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatIcon,
        MatFormField,
        MatLabel,
        MatError,
        MatInput,
        MatButton,
        MatHint,
        NgIf
    ],
    styleUrls: ['./cliente-dialog.css']
})

export class ClienteDialogComponent implements OnInit {
    private fb         = inject(FormBuilder);
    private dialogRef  = inject(MatDialogRef<ClienteDialogComponent>);
    public  data       = inject<any>(MAT_DIALOG_DATA);

    form!: FormGroup;
    modoEdicion!: boolean;

    ngOnInit(): void {
        this.modoEdicion = !!this.data;

        this.form = this.fb.group({
            nombre: [
                this.data?.nombre ?? '',
                Validators.required
            ],
            apellido: [
                this.data?.apellido ?? '',
                Validators.required
            ],
            dni: [
                { value: this.data?.dni ?? '', disabled: this.modoEdicion },
                [Validators.required, Validators.pattern(/^\d{8}$/)]
            ],
            telefono: [
                this.data?.telefono ?? '',
                Validators.required
            ],
            email: [
                this.data?.email ?? '',
                [Validators.required, Validators.email]
            ],
            ingresos_mensuales: [
                this.data?.ingresos_mensuales ?? null,
                [Validators.required, Validators.min(0)]
            ]
        });
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