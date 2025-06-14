import { supabase, type Bitacora } from './supabase';

class Logger {
  private static async logToDatabase(
    descripcion: string,
    tipo_evento: Bitacora['tipo_evento'],
    severidad: Bitacora['severidad'],
    usuario_id?: number
  ) {
    try {
      const { error } = await supabase.from("bitacora").insert({
        descripcion,
        tipo_evento,
        severidad,
        usuario_id: usuario_id || null,
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("[Logger Error]:", error);
    }
  }

  // Métodos públicos para diferentes tipos de eventos
  static async sistema(mensaje: string, severidad: Bitacora['severidad'] = "Informativo") {
    console.log(`[Sistema][${severidad}] ${mensaje}`);
    await this.logToDatabase(mensaje, "Sistema", severidad);
  }

  static async seguridad(mensaje: string, severidad: Bitacora['severidad'] = "Advertencia", usuario_id?: number) {
    console.log(`[Seguridad][${severidad}] ${mensaje}`);
    await this.logToDatabase(mensaje, "Seguridad", severidad, usuario_id);
  }

  static async operacion(mensaje: string, severidad: Bitacora['severidad'] = "Informativo", usuario_id?: number) {
    console.log(`[Operación][${severidad}] ${mensaje}`);
    await this.logToDatabase(mensaje, "Operación", severidad, usuario_id);
  }

  static async mantenimiento(mensaje: string, severidad: Bitacora['severidad'] = "Informativo", usuario_id?: number) {
    console.log(`[Mantenimiento][${severidad}] ${mensaje}`);
    await this.logToDatabase(mensaje, "Mantenimiento", severidad, usuario_id);
  }
}

export default Logger;