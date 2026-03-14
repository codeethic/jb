import type { UserRole } from '../enums';
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    restaurantId: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface CreateUserDto {
    email: string;
    name: string;
    password: string;
    role: UserRole;
}
export interface UpdateUserDto {
    name?: string;
    role?: UserRole;
    active?: boolean;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface AuthResponse {
    accessToken: string;
    user: Omit<User, 'createdAt' | 'updatedAt'>;
}
//# sourceMappingURL=user.d.ts.map