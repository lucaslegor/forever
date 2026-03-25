import { LoginDTO, RegisterDTO } from '../types/requests';
import { AuthResponse } from '../types/responses';
export declare class AuthService {
    login(data: LoginDTO): Promise<AuthResponse>;
    register(data: RegisterDTO): Promise<AuthResponse>;
    private generateToken;
    private handleFailedLogin;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map