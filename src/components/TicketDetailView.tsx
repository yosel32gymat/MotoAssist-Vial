import React from "react";
import { 
  FileText, 
  Trash2, 
  Edit3, 
  ImageIcon, 
  Users, 
  Check, 
  X,
  CreditCard,
  MapPin,
  Sparkles,
  Calendar,
  AlertTriangle,
  QrCode
} from "lucide-react";
import { Invoice, Motorizado } from "../types";

interface TicketDetailViewProps {
  invoice: Invoice;
  motorizados: Motorizado[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export default function TicketDetailView({ 
  invoice, 
  motorizados, 
  onClose, 
  onEdit, 
  onDelete 
}: TicketDetailViewProps) {

  const getMotorizadoName = (id?: string) => {
    if (!id) return "Sin asignar";
    const mot = motorizados.find(m => m.id === id);
    return mot ? mot.name : "Sin asignar";
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
      
      {/* CABECERA */}
      <div className="flex items-center justify-between border-b border-slate-150 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg border border-blue-105 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight truncate max-w-[200px]" title={invoice.issuer}>
              {invoice.issuer}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">ID: {invoice.id?.substring(0, 12)}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 px-3 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition font-semibold cursor-pointer"
        >
          Cerrar Vista
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: RESUMEN DE CAMPOS RECTOS Y OPERATIVOS */}
        <div className="lg:col-span-7 space-y-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-0.5">Metadatos de la Factura</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Comercio RUC</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">{invoice.issuerRuc || "No Registrado"}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-semibold">Tipo Documento</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5 truncate" title={invoice.invoiceType}>{invoice.invoiceType || "Factura de Venta"}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Fecha de Emisión</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5">{invoice.date}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Nº Factura / Ticket</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5 truncate" title={invoice.invoiceNumber}>{invoice.invoiceNumber}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Serie / Consecutivo</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5">{invoice.serial || "S/S"}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Lugar: Sucursal (Caja)</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5">Suc {invoice.sucursal || "001"} - Caja {invoice.ptoFact || "01"}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg col-span-full">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Cliente Receptor</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5">
                {invoice.receiverName || "Consumidor Final"} {invoice.receiverRuc ? `(RUC/CIP: ${invoice.receiverRuc})` : ""}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Atendido por (Vendedor)</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">{invoice.seller || "No Especificado"}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Método de Pago</span>
              <p className="text-xs font-bold text-slate-700 mt-0.5 font-sans flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                {invoice.paymentMethod || "Efectivo"}
              </p>
            </div>

            {invoice.motorizadoId && (
              <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-lg col-span-full flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-blue-500 tracking-wider block">Chofer de Flota Asignado</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-blue-500" />
                    {getMotorizadoName(invoice.motorizadoId)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-full text-[9px] uppercase">
                    Completado
                  </span>
                </div>
              </div>
            )}

            {invoice.comments && (
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg col-span-full">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Comentarios de Entrega / Dirección Flete</span>
                <p className="text-xs text-slate-650 mt-0.5 leading-relaxed font-semibold">{invoice.comments}</p>
              </div>
            )}

            {invoice.accessKey && (
              <div className="p-3 bg-amber-50/30 border border-amber-100 rounded-lg col-span-full">
                <span className="text-[9px] uppercase font-bold text-amber-600 tracking-wider font-mono">Clave de Acceso Electrónica (CUFE)</span>
                <p className="text-[10px] font-mono text-slate-500 mt-1 break-all select-all leading-tight">
                  {invoice.accessKey}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: REPRESENTACIÓN GRÁFICA DEL TICKET FÍSICO */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-0.5">Comprobante Impreso Estilizado</h4>
          
          <div className="border border-slate-300 rounded-xl bg-white shadow-md relative p-5 max-w-[340px] mx-auto text-[11px] font-mono text-black leading-normal select-none ring-8 ring-slate-100/50">
            {/* Wavy paper top mockup effect */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-repeat-x" style={{ backgroundImage: "linear-gradient(135deg, #CBD5E1 25%, transparent 25%), linear-gradient(225deg, #CBD5E1 25%, transparent 25%)", backgroundSize: "8px 8px" }}></div>

            <div className="pt-2 text-center select-text">
              <p className="font-extrabold text-[12px] uppercase select-none tracking-tight">{invoice.issuer || "SUMINISTROS IND."}</p>
              <p className="text-[9px] font-semibold text-slate-600 mt-0.5">{invoice.issuerAddress || "CIUDAD DE PANAMÁ"}</p>
              <p className="text-[9px] font-bold text-slate-800">R.U.C.: {invoice.issuerRuc || "S/RUC"}</p>
              <p className="text-[8px] text-slate-500 mt-0.5">------------------------------------------</p>
              <p className="font-semibold text-slate-705">COMPROBANTE AUXILIAR DE FACTURA</p>
              <p className="font-bold">NRO FACTURA: {invoice.invoiceNumber}</p>
              <p className="font-bold">SERIE: {invoice.serial || "A-2026"}</p>
              <p className="text-[8px] text-slate-550">------------------------------------------</p>
            </div>

            <div className="space-y-1 my-3 select-text text-slate-800">
              <p className="flex justify-between text-[10px]"><span>FECHA:</span> <span>{invoice.date}</span></p>
              <p className="flex justify-between text-[10px]"><span>VENDEDOR:</span> <span>{(invoice.seller || "VICTOR CRUZ").toUpperCase()}</span></p>
              <p className="flex justify-between text-[10px]"><span>MÉTODO:</span> <span>{(invoice.paymentMethod || "EFECTIVO").toUpperCase()}</span></p>
              <p className="truncate max-w-full text-[9px]"><span>CLIENTE:</span> <span>{(invoice.receiverName || "Consumidor final").toUpperCase()}</span></p>
              {invoice.receiverRuc && <p className="text-[9px]"><span>RUC CTE:</span> <span>{invoice.receiverRuc}</span></p>}
            </div>

            <p className="text-[8px] text-slate-500 text-center select-none">==========================================</p>
            
            {/* LISTA ITEMS */}
            <div className="space-y-1.5 my-3 select-text font-bold">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5 text-xs text-slate-905">
                    <p className="truncate max-w-[280px] text-slate-800">{item.name.toUpperCase()}</p>
                    <div className="flex justify-between text-[10px] pl-2 text-slate-500 font-normal">
                      <span>{item.quantity} x ${item.price.toFixed(2)}</span>
                      <span className="font-mono text-slate-700 font-bold">${(item.total || (item.quantity * item.price)).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center italic text-slate-400 py-2">Sin desglose de productos</p>
              )}
            </div>

            <p className="text-[8px] text-slate-500 text-center select-none">==========================================</p>

            {/* TOTALS */}
            <div className="space-y-1 text-right my-3 pr-1 select-text">
              <p className="flex justify-between text-[10px] text-slate-600 font-semibold">
                <span>SUBTOTAL:</span> 
                <span>${(invoice.subtotal || (invoice.total - invoice.tax)).toFixed(2)}</span>
              </p>
              <p className="flex justify-between text-[10px] text-slate-600 font-bold">
                <span>ITBMS RET (7%):</span> 
                <span>${(invoice.tax || 0).toFixed(2)}</span>
              </p>
              <p className="flex justify-between text-[11px] font-black border-t border-dashed border-slate-300 pt-1 text-slate-900 leading-none">
                <span>TOTAL A PAGAR:</span> 
                <span className="text-xs font-extrabold font-mono">${(invoice.total || 0).toFixed(2)}</span>
              </p>
            </div>

            <p className="text-[8px] text-slate-500 text-center select-none">------------------------------------------</p>

            {/* MOCKUP QR / BARCODE */}
            <div className="flex flex-col items-center justify-center p-2.5 space-y-1">
              {invoice.qrUrl ? (
                <div className="p-1 border border-slate-300 rounded bg-white w-14 h-14 flex items-center justify-center select-none shrink-0 cursor-pointer" title="Haga clic para validar">
                  <QrCode className="h-10 w-10 text-slate-800" />
                </div>
              ) : (
                <div className="p-1 border border-slate-300 rounded bg-white w-12 h-12 flex items-center justify-center select-none shrink-0">
                  <QrCode className="h-8 w-8 text-slate-400" />
                </div>
              )}
              <p className="text-[8px] text-slate-400 font-semibold tracking-wider text-center">{invoice.accessKey ? "DOCUMENTO FISCAL AUTORIZADO" : "SISTEMA DE FACTURA DIGITAL"}</p>
              <p className="text-[7px] text-slate-400 leading-tight select-text text-center font-medium">COCU: {invoice.invoiceNumber}-{invoice.serial || "SER"}</p>
            </div>

            <p className="text-center text-[8px] text-slate-450 italic select-none pb-2 mt-4">*** GRACIAS POR SU COMPRA ***</p>

            {/* Wavy paper bottom mockup effect */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-repeat-x" style={{ backgroundImage: "linear-gradient(45deg, #CBD5E1 25%, transparent 25%), linear-gradient(-45deg, #CBD5E1 25%, transparent 25%)", backgroundSize: "8px 8px" }}></div>
          </div>
        </div>

      </div>

      {/* BOTONES ACCION EDIT/DELETE */}
      <div className="flex justify-between items-center pt-5 border-t border-slate-150 gap-3">
        <button
          onClick={() => invoice.id && onDelete(invoice.id)}
          className="flex items-center gap-1 px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold transition cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Borrar de Biblioteca
        </button>

        <button
          onClick={onEdit}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
        >
          Editar Datos de Factura
        </button>
      </div>

    </div>
  );
}
