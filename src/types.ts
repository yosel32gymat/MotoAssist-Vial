/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  taxPct?: number; // e.g. 7, 10, 15, or 0
}

export interface DesgloseItbms {
  base: number;
  rate: string; // "Exento", "7%", "10%", "15%"
  tax: number;
}

export interface Motorizado {
  id?: string;
  name: string;
  vehiclePlate: string; // Placa del vehículo
  vehicleModel?: string; // e.g., "Honda Cargo 150", "Yamaha YBR"
  phone?: string;
  status: "activo" | "inactivo";
  userId: string; // Creador o usuario administrador de la flota
  createdAt: string;
}

export interface VehicleIncident {
  id: string;
  motorizadoId: string;
  date: string;
  description: string;
  severity: "baja" | "media" | "alta";
  status: "pendiente" | "resuelto";
}

export interface Invoice {
  id?: string;
  issuer: string;
  date: string;
  invoiceNumber: string;
  total: number;
  tax: number;
  paymentMethod: string;
  items: InvoiceItem[];
  imageUrl: string; // Base64 representation of the invoice thermal image
  userId: string;
  createdAt: string; // ISO 8601 string or Timestamp string

  // Nuevos campos detallados adicionales de la factura adjunta (AUTO CENTRO S.A.)
  issuerRuc?: string; // RUC Emisor dgi (e.g., "603-203-124985 DV 01")
  issuerAddress?: string; // Dirección física o avenida
  invoiceType?: string; // e.g., "Comprobante Auxiliar de Factura Electrónica" or "Factura de Operación Interna"
  serial?: string; // Número de serie o consecutivo
  sucursal?: string; // Sucursal (e.g., "0010")
  ptoFact?: string; // Punto de Facturación (e.g., "001")
  receiverName?: string; // DORA GUERRA o similar
  receiverRuc?: string; // RUC/CIP del cliente (e.g., "8-306-599 DV")
  receiverType?: string; // Consumidor final, etc.
  subtotal?: number; // Subtotal antes de ITBMS
  itbms?: number; // Total de tasa ITBMS
  desgloseItbms?: DesgloseItbms[]; // Desglose ITBMS (Exento, 7%, 10%, 15%)
  qrUrl?: string; // dgi-fep portal URL para verificación
  accessKey?: string; // Clave de acceso o código de barra / CUFE
  seller?: string; // Nombre del vendedor (e.g., "VICTOR CRUZ")
  accountNumber?: string; // Cuenta de cliente (e.g., "C00000000032057")
  comments?: string; // Comentarios o dirección de entrega (e.g., "DOMICILIO BRISAS DEL GOLF")
  motorizadoId?: string; // ID del motorizado asignado que subió o incurrió en el gasto
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}
