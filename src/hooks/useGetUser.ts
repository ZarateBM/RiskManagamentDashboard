// src/hooks/useUsers.ts
import { useState, useEffect } from "react";
import axios from "axios";
import { User } from "@/types/User"; // ajusta si el path es diferente

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<User[]>("/api/users"); // tipamos la respuesta
        setUsers(res.data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { users, loading };
}
