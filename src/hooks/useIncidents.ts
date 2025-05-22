import { useState } from 'react';

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

export const useIncidents = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getIncidents = async (): Promise<Incidente[]> => {
    setLoading(true);
    try {
      const res = await fetch('/api/incidents');
      if (!res.ok) throw new Error('Error al obtener los incidentes');
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getIncidentById = async (id: number): Promise<Incidente | null> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/incidents/${id}`);
      if (!res.ok) throw new Error('Incidente no encontrado');
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createIncident = async (data: Incidente): Promise<Incidente | null> => {
    setLoading(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear el incidente');
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateIncident = async (id: number, data: Partial<Incidente>): Promise<Incidente | null> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar el incidente');
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteIncident = async (id: number): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/incidents/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar el incidente');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getIncidents,
    getIncidentById,
    createIncident,
    updateIncident,
    deleteIncident,
  };
};
