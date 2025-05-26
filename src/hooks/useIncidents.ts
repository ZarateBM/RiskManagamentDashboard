import { useCallback, useState, useEffect } from 'react';
import IncidentService from '../services/Incidentservice';
import { useSession } from './useSession';

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
  const [incidents, setIncidents] = useState<Incidente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useSession(); 

  // Carga inicial automática al montar
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Función para obtener todos los incidentes y actualizar el estado
  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await IncidentService.getAll();
      setIncidents(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al obtener incidentes');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getIncidents = fetchIncidents; // alias si quieres usarlo externamente

  const getIncidentById = useCallback(async (id: number): Promise<Incidente | null> => {
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
  }, []);

  const createIncident = useCallback(async (incident: Incidente): Promise<Incidente | null> => {
    setLoading(true);
    setError(null);
    try {
        if (!user) {
        throw new Error("No hay usuario en sesión");
      }

        const incidentToCreate = {
        ...incident,
        idUsuarioRegistro: user?.idUsuario, 
      };
      const data = await IncidentService.create(incidentToCreate);
      // Actualizar lista tras crear
      await fetchIncidents();
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
  }, [fetchIncidents]);

  const updateIncident = useCallback(async (id: number, incident: Partial<Incidente>): Promise<Incidente | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await IncidentService.update(id, incident);
      // Actualizar lista tras actualizar
      await fetchIncidents();
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
  }, [fetchIncidents]);

  const deleteIncident = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await IncidentService.remove(id);
      // Actualizar lista tras eliminar
      await fetchIncidents();
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
  }, [fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    getIncidents,
    getIncidentById,
    createIncident,
    updateIncident,
    deleteIncident,
  };
};
