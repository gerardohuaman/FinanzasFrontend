import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { LayoutComponent } from './shared/components/layout/layout';
import { ClienteListComponent } from './features/clientes-vehiculos/cliente-vehiculo-list/cliente-vehiculo-list';
import {DashboardComponent} from "./features/dashboard/dashboard";
import { CronogramaViewComponent } from './features/simulador/cronograma-view/cronograma-view';
import {SimuladorConfigComponent} from "./features/simulador/simulador-config/simulador-config";


export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},

    {
        path: '',
        component: LayoutComponent,
        children: [
            {path: 'dashboard', component: DashboardComponent},
            {path: 'clientes', component: ClienteListComponent},
            {path: 'simulador', component: SimuladorConfigComponent},
            {path: 'cronograma',component: CronogramaViewComponent},
            {path: '', redirectTo: 'clientes', pathMatch: 'full'}

        ]
    },
    {path: '**', redirectTo: 'login'}
];
