/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Invoice, Motorizado } from "../types";

/**
 * Exporta un listado de facturas térmicas a un formato de archivo CSV compatible con Excel.
 * De forma opcional, permite filtrar y seleccionar qué columnas exportar.
 * Añade la marca de orden de bytes (BOM) UTF-8 para garantizar que Excel abra correctamente los acentos y símbolos.
 */
export function exportInvoicesToCSV(
  invoices: Invoice[], 
  motorizadosList?: Motorizado[], 
  selectedFields?: string[]
) {
  const allHeaders = [
    "ID Interno",
    "Establecimiento",
    "RUC Emisor",
    "Dirección Emisor",
    "Tipo Factura",
    "Nº Ticket/Factura",
    "Serie / Sucursal",
    "Cliente Receptor",
    "RUC Cliente",
    "Vendedor",
    "Asignado a (Motorizado)",
    "Método Pago",
    "Producto/Servicio",
    "Cantidad",
    "Precio Unitario",
    "Total Producto",
    "Impuestos (ITBMS / IVA)",
    "Subtotal Ticket",
    "Total Ticket",
    "Clave de Acceso / CUFE",
    "Comentarios / Dirección Brisas",
    "Fecha Emisión",
    "Fecha Registro"
  ];

  // Determinar índices de campos activos
  const activeFields = selectedFields && selectedFields.length > 0 ? selectedFields : allHeaders;
  const activeIndexes = activeFields
    .map(field => allHeaders.indexOf(field))
    .filter(idx => idx !== -1);

  // Generar encabezados seleccionados
  const csvHeaders = activeIndexes.map(idx => allHeaders[idx]);

  // Estructurar filas: expandimos cada artículo de la factura en una fila para nivel de detalle óptimo en Excel
  const rawRows: string[][] = [];

  const getMotorizadoName = (id?: string) => {
    if (!id || !motorizadosList) return "Sin asignar";
    const mot = motorizadosList.find(m => m.id === id);
    return mot ? mot.name : "Sin asignar";
  };

  for (const inv of invoices) {
    const safeId = inv.id || "Local-" + Math.random().toString(36).substr(2, 5);
    const safeIssuer = (inv.issuer || "Desconocido").replace(/;/g, ",").replace(/"/g, '""');
    const safeIssuerRuc = (inv.issuerRuc || "").replace(/;/g, ",").replace(/"/g, '""');
    const safeIssuerAddress = (inv.issuerAddress || "").replace(/;/g, ",").replace(/"/g, '""');
    const safeInvoiceType = (inv.invoiceType || "").replace(/;/g, ",").replace(/"/g, '""');
    const safeDate = inv.date || "";
    const safeInvoiceNumber = (inv.invoiceNumber || "").replace(/;/g, ",").replace(/"/g, '""');
    const safeSerial = `${inv.serial || ""} (Suc:${inv.sucursal || ""} - Pto:${inv.ptoFact || ""})`.replace(/;/g, ",").replace(/"/g, '""');
    const safeReceiverName = (inv.receiverName || "").replace(/;/g, ",").replace(/"/g, '""');
    const safeReceiverRuc = (inv.receiverRuc || "").replace(/;/g, ",").replace(/"/g, '""');
    const safeSeller = (inv.seller || "").replace(/;/g, ",").replace(/"/g, '""');
    const safeMotorizado = getMotorizadoName(inv.motorizadoId).replace(/;/g, ",").replace(/"/g, '""');
    const safePaymentMethod = (inv.paymentMethod || "").replace(/;/g, ",").replace(/"/g, '""');
    const safeTax = String(inv.tax || 0);
    const safeSubtotal = String(inv.subtotal || (inv.total - inv.tax) || 0);
    const safeTotal = String(inv.total || 0);
    const safeAccessKey = (inv.accessKey || "").replace(/;/g, ",").replace(/"/g, '""');
    const safeComments = (inv.comments || "").replace(/;/g, ",").replace(/"/g, '""');
    const safeCreatedAt = inv.createdAt ? String(inv.createdAt).split("T")[0] : "";

    if (inv.items && inv.items.length > 0) {
      for (const item of inv.items) {
        const safeItemName = (item.name || "").replace(/;/g, ",").replace(/"/g, '""');
        const safeItemQty = String(item.quantity || 1);
        const safeItemPrice = String(item.price || 0);
        const safeItemTotal = String(item.total || (item.quantity * item.price) || 0);

        rawRows.push([
          `"${safeId}"`,
          `"${safeIssuer}"`,
          `"${safeIssuerRuc}"`,
          `"${safeIssuerAddress}"`,
          `"${safeInvoiceType}"`,
          `"${safeInvoiceNumber}"`,
          `"${safeSerial}"`,
          `"${safeReceiverName}"`,
          `"${safeReceiverRuc}"`,
          `"${safeSeller}"`,
          `"${safeMotorizado}"`,
          `"${safePaymentMethod}"`,
          `"${safeItemName}"`,
          safeItemQty,
          safeItemPrice,
          safeItemTotal,
          safeTax,
          safeSubtotal,
          safeTotal,
          `"${safeAccessKey}"`,
          `"${safeComments}"`,
          `"${safeDate}"`,
          `"${safeCreatedAt}"`
        ]);
      }
    } else {
      // Factura sin artículos
      rawRows.push([
        `"${safeId}"`,
        `"${safeIssuer}"`,
        `"${safeIssuerRuc}"`,
        `"${safeIssuerAddress}"`,
        `"${safeInvoiceType}"`,
        `"${safeInvoiceNumber}"`,
        `"${safeSerial}"`,
        `"${safeReceiverName}"`,
        `"${safeReceiverRuc}"`,
        `"${safeSeller}"`,
        `"${safeMotorizado}"`,
        `"${safePaymentMethod}"`,
        `""`,
        `""`,
        `""`,
        `""`,
        safeTax,
        safeSubtotal,
        safeTotal,
        `"${safeAccessKey}"`,
        `"${safeComments}"`,
        `"${safeDate}"`,
        `"${safeCreatedAt}"`
      ]);
    }
  }

  // Filtrar las columnas para cada fila según los índices requeridos
  const finalRows = rawRows.map(row => activeIndexes.map(idx => row[idx]));

  // Generar contenido CSV separado por punto y coma (;) que funciona de forma nativa en Excel de habla hispana
  const csvContent = 
    csvHeaders.join(";") + "\n" + 
    finalRows.map(row => row.join(";")).join("\n");

  // Crear Blob e inyectar el BOM UTF-8 (0xEF, 0xBB, 0xBF) para que Excel detecte la codificación perfectamente
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `facturas_termicas_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
