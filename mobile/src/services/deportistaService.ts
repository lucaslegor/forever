import api from '../config/api';
import type { ApiResponse, DeportistaProfile } from '../types/auth';

export const deportistaService = {
  getMiPerfil: async (): Promise<ApiResponse<DeportistaProfile>> => {
    const response = await api.get<ApiResponse<DeportistaProfile>>('/deportistas/mi-perfil');
    return response.data;
  },
};
