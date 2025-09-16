export interface Provincia {
  Codigo_Provincia: number;
  Nombre_Provincia: string;
}

export interface Municipio {
  Codigo_Municipio: number;
  Nombre_Municipio: string;
}

export interface Medico {
  ID_Medico: number;
  Nombre_Medico: string;
  Llave_Publica_Medico: string;
  Telefono_Medico: string;
  Correo_Medico: string;
  Fecha_Creacion_Medico: string;
}

export interface Paciente {
  ID_Paciente: number;
  Codigo_Municipio: number;
  Nombre_Paciente: string;
  Telefono_Paciente: string;
  Correo_Paciente: string;
  Fecha_Creacion_Paciente: string;
}

export interface Farmacia {
  ID_Farmacia: number;
  Codigo_Municipio: number;
  Nombre_Farmacia: string;
}

export interface Clasificacion_Medicina {
  Codigo_Clasificacion_Medicina: number;
  Nombre_Clasificacion_Medicina: string;
}

export interface Medicina {
  ID_Medicina: number;
  Codigo_Clasificacion_Medicina: number;
  Nombre_Medicina: string;
}

export interface Receta {
  ID_Receta: number;
  ID_Paciente: number;
  ID_Medico: number;
  Fecha_Receta: string;
  Hash_Receta: string;
}

export interface Receta_Medicina {
  ID_Receta: number;
  Codigo_Medicina: number;
  Dosis: string;
}

export interface Dispensado {
  ID_Farmacia: number;
  ID_Receta: number;
  Fecha_Dispensado: string;
}

export interface Permitidos {
  ID_Paciente: number;
  ID_Medico: number;
  ID_Receta: number;
}
