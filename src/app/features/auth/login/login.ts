
import { AfterViewInit, Component, NgZone } from "@angular/core";
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
import { environment } from "../../../../environments/environment";

declare var grecaptcha: any
const siteKey = environment.recaptchaSiteKey

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
export class LoginComponent implements AfterViewInit{
  username: string = ''
  password: string = ''
  rememberMe: boolean = false
  hasError: boolean = false
  errorMessage: string = ''

  captchaResolved: boolean = false
  captchaToken: string | null = null

  widgetId: number | null = null

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ){}

  ngAfterViewInit(): void {
    this.renderizarCaptcha()
  }

  renderizarCaptcha() {
    if (typeof grecaptcha !== 'undefined' && grecaptcha.render) {
      try {
        this.widgetId = grecaptcha.render('recaptcha-container', {
          'sitekey': siteKey, 
          'callback': (token: string) => {
            this.ngZone.run(() => {
              this.captchaResolved = true;
              this.captchaToken = token;
              this.hasError = false;
            });
          },
          'expired-callback': () => {
            this.ngZone.run(() => {
              this.captchaResolved = false;
              this.captchaToken = null;
            });
          }
        });
      } catch (e) {
        console.error('El captcha ya estaba renderizado o hubo un error', e);
      }
    } else {
      setTimeout(() => this.renderizarCaptcha(), 100);
    }
  }

  onLogin(){
    this.hasError = false

    if(!this.username || !this.password){
      this.hasError = true
      this.errorMessage = 'Por favor, completa todos los campos'
      return
    }

    if(!this.captchaResolved || !this.captchaToken) {
      this.hasError = true
      this.errorMessage = 'Por favor, verifica que no eres un robot.'
      return
    }

    const credentials = {username: this.username, password: this.password}

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response && response.jwttoken) {
          this.authService.guardarToken(response.jwttoken)
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
