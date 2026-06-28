import { Rol } from "./Rol"

export class Usuario {
    id_usuario: number = 0
    username: string = ''
    password: string = ''
    nombreCompleto: string = ''
    roles: Rol[] = []
    enabled: boolean = true
}