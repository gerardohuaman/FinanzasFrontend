
import { Component } from "@angular/core";
import { AuthService } from "../../../core/services/auth";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import {MatCheckbox} from "@angular/material/checkbox";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckbox
  ],
  templateUrl: "./login.html",
  styleUrl: "./login.css",
})
export class LoginComponent {
  username: string = ''
  password: string = ''
  rememberMe: boolean = false
  hasError: boolean = false
  errorMessage: string = ''

  captchaResolved: boolean = false
  captchaToken: string | null = null

  constructor(
    private authService: AuthService,
    private router: Router
  ){}


  onLogin(){
    this.hasError = false

    if(!this.username || !this.password){
      this.hasError = true
      this.errorMessage = 'Por favor, completa todos los campos'
      return
    }



    const credentials = {username: this.username, password: this.password}

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response && response.jwttoken) {
          this.authService.guardarToken(response.jwttoken)
          console.log ("Hola mundo");
          this.router.navigate(['/clientes'])
        }
      },
      error: (err) => {
        this.hasError = true
        this.errorMessage = 'Credenciales incorrectas.'
        console.error('Error de login', err)
      }
    })
  }
}
