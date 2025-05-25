// IncidentService.ts
import axios, { AxiosInstance } from 'axios';

export interface Incidente {
  idIncidente?: number;
  idCategoria: number;
  titulo: string;
  severidad: string;
  descripcion: string;
  estadoIncidente: string;
  fechaIncidente: string;
  accionesTomadas: string;
  idUsuarioRegistro: number;
  fechaRegistro?: string;
  registroEstado?: boolean;
}


class IncidentService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api/incidents',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAll(): Promise<Incidente[]> {
    const response = await this.api.get<Incidente[]>('/');
    return response.data;
  }

  async getById(id: number): Promise<Incidente> {
    const response = await this.api.get<Incidente>(`/${id}`);
    return response.data;
  }

  async create(data: Incidente): Promise<Incidente> {
    const response = await this.api.post<Incidente>('/', data);
    return response.data;
  }

  async update(id: number, data: Partial<Incidente>): Promise<Incidente> {
    const response = await this.api.put<Incidente>(`/${id}`, data);
    return response.data;
  }

  async remove(id: number): Promise<void> {
    await this.api.delete(`/${id}`);
  }
}

export default new IncidentService();