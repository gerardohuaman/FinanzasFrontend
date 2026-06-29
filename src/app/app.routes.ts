import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { LayoutComponent } from './shared/components/layout/layout';
import { ClienteListComponent } from './features/clientes-vehiculos/cliente-vehiculo-list/cliente-vehiculo-list';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {
        path: '',
        component: LayoutComponent,
        children: [
            {path: 'clientes', component: ClienteListComponent},
            {path: '', redirectTo: 'clientes', pathMatch: 'full'}
        ]
    }
];
