import { Component } from "@angular/core";
import { AuthService } from "../../../core/services/auth";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatSidenav, MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";

@Component({
  selector: "app-layout",
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: "./layout.html",
  styleUrl: "./layout.css",
})
export class LayoutComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  cerrarSesion(){
    this.authService.cerrarSesion()
    this.router.navigate(['/login'])
  }
}
