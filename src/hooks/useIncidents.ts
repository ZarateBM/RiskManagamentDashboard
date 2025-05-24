import { useState } from 'react';
import IncidentService from '../services/Incidentservice';

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
    setError(null);
    try {
      const data = await IncidentService.getAll();
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al obtener incidentes');
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getIncidentById = async (id: number): Promise<Incidente | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await IncidentService.getById(id);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al obtener el incidente');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createIncident = async (incident: Incidente): Promise<Incidente | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await IncidentService.create(incident);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al crear el incidente');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateIncident = async (id: number, incident: Partial<Incidente>): Promise<Incidente | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await IncidentService.update(id, incident);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al actualizar el incidente');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteIncident = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await IncidentService.remove(id);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al eliminar el incidente');
      }
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
