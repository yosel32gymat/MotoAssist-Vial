import React, { useState } from "react";
import { 
  Filter, 
  Calendar, 
  Download, 
  RefreshCw, 
  Search, 
  Receipt,
  Layers,
  ChevronRight,
  Calculator
} from "lucide-react";
import { Invoice, Motorizado } from "../types";
import { exportInvoicesToCSV } from "../utils/csvExport";

interface ReportsViewProps {
  invoices: Invoice[];
  motorizados: Motorizado[];
}

export default function ReportsView({ invoices, motorizados }: ReportsViewProps) {
  // Estados para filtros
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMotorizado, setSelectedMotorizado] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [searchIssuer, setSearchIssuer] = useState("");

  // Todos los encabezados disponibles
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

  const [selectedFields, setSelectedFields] = useState<string[]>(allHeaders);
  const [showFieldsConfig, setShowFieldsConfig] = useState(false);

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedMotorizado("all");
    setSelectedPayment("all");
    setSearchIssuer("");
  };

  // Filtrar facturas de forma dinámica
  const filteredInvoices = invoices.filter((inv) => {
    // Rango de fechas
    if (startDate && inv.date && inv.date < startDate) return false;
    if (endDate && inv.date && inv.date > endDate) return false;

    // Asignación de motorizado
    if (selectedMotorizado !== "all") {
      if (selectedMotorizado === "none") {
        if (inv.motorizadoId && inv.motorizadoId !== "") return false;
      } else {
        if (inv.motorizadoId !== selectedMotorizado) return false;
      }
    }

    // Método de pago
    if (selectedPayment !== "all") {
      const pm = (inv.paymentMethod || "").toLowerCase();
      const selPm = selectedPayment.toLowerCase();
      // Búsqueda simple por substring
      if (!pm.includes(selPm)) return false;
    }

    // Buscador emisor
    if (searchIssuer.trim()) {
      const issuer = (inv.issuer || "").toLowerCase();
      if (!issuer.includes(searchIssuer.toLowerCase())) return false;
    }

    return true;
  });

  // Métricas del subconjunto filtrado
  const filteredTotal = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const filteredTax = filteredInvoices.reduce((sum, inv) => sum + (inv.tax || 0), 0);
  const filteredSubtotal = filteredTotal - filteredTax;

  // Cómputo de la matriz de Impuestos (Exento, 7%, 10%, 15% breakdown)
  const taxRatesBreakdown = {
    exento: { base: 0, tax: 0 },
    "7%": { base: 0, tax: 0 },
    "10%": { base: 0, tax: 0 },
    "15%": { base: 0, tax: 0 }
  };

  filteredInvoices.forEach(inv => {
    if (inv.desgloseItbms && inv.desgloseItbms.length > 0) {
      inv.desgloseItbms.forEach(desc => {
        const rate = (desc.rate || "").toLowerCase();
        if (rate.includes("exento") || desc.rate === "0" || desc.rate === "0%") {
          taxRatesBreakdown.exento.base += desc.base || 0;
          taxRatesBreakdown.exento.tax += desc.tax || 0;
        } else if (rate.includes("7")) {
          taxRatesBreakdown["7%"].base += desc.base || 0;
          taxRatesBreakdown["7%"].tax += desc.tax || 0;
        } else if (rate.includes("10")) {
          taxRatesBreakdown["10%"].base += desc.base || 0;
          taxRatesBreakdown["10%"].tax += desc.tax || 0;
        } else if (rate.includes("15")) {
          taxRatesBreakdown["15%"].base += desc.base || 0;
          taxRatesBreakdown["15%"].tax += desc.tax || 0;
        }
      });
    } else {
      // Intento de fallback inteligente basado en la tasa total o los items
      const base = inv.total - inv.tax;
      if (inv.tax === 0) {
        taxRatesBreakdown.exento.base += base;
      } else {
        const ratio = inv.tax / base;
        if (Math.abs(ratio - 0.07) < 0.02) {
          taxRatesBreakdown["7%"].base += base;
          taxRatesBreakdown["7%"].tax += inv.tax;
        } else if (Math.abs(ratio - 0.10) < 0.02) {
          taxRatesBreakdown["10%"].base += base;
          taxRatesBreakdown["10%"].tax += inv.tax;
        } else {
          taxRatesBreakdown["7%"].base += base;
          taxRatesBreakdown["7%"].tax += inv.tax;
        }
      }
    }
  });

  const getMotorizadoName = (id?: string) => {
    if (!id) return "Sin asignar";
    const mot = motorizados.find(m => m.id === id);
    return mot ? mot.name : "Sin asignar";
  };

  const handleExportFiltered = () => {
    if (filteredInvoices.length === 0) {
      return;
    }
    // Exportar con los campos que el usuario editó o seleccionó
    exportInvoicesToCSV(filteredInvoices, motorizados, selectedFields);
  };

  return (
    <div id="reports-module-view" className="space-y-6 animate-fade-in">
      {/* PANEL DE CONFIGURACIÓN DE FILTROS */}
      <div className="bg-slate-950/45 backdrop-blur-md rounded-xl border border-white/5 p-5 shadow-2xl space-y-4">
        <div>
          <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">Filtros Avanzados del Reporte de Ventas</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Restringe las copias de ventas para exportar o auditar sus valores de instalaciones</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Desde */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3 text-blue-400" />
              Desde Fecha
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-white cursor-pointer"
            />
          </div>

          {/* Hasta */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3 text-blue-400" />
              Hasta Fecha
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-white cursor-pointer"
            />
          </div>

          {/* Motorizado */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Asignación Chofer</label>
            <select
              value={selectedMotorizado}
              onChange={(e) => setSelectedMotorizado(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-white cursor-pointer"
            >
              <option className="bg-slate-950 text-white" value="all">Ver Todos</option>
              <option className="bg-slate-950 text-white" value="none">Sin Motorizado</option>
              {motorizados.map(m => (
                <option className="bg-slate-950 text-white" key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Forma de pago */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Método de Pago</label>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-white cursor-pointer"
            >
              <option className="bg-slate-950 text-white" value="all">Ver Todos</option>
              <option className="bg-slate-950 text-white" value="pago contra entrega">Contrareembolso / Brisas</option>
              <option className="bg-slate-950 text-white" value="efectivo">Efectivo</option>
              <option className="bg-slate-950 text-white" value="tarjeta">Tarjeta</option>
            </select>
          </div>

          {/* Buscador de comercio */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Comercio / Emisor</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej. Auto Centro"
                value={searchIssuer}
                onChange={(e) => setSearchIssuer(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-slate-950 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-white placeholder-slate-550"
              />
              <Search className="h-3 w-3 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* COMPORTAMIENTO CONFIG DE SELECCIÓN DE CAMPOS EXPORTACIÓN */}
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 space-y-3 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-black text-slate-200">Editar Campos del Reporte a Exportar ({selectedFields.length} Selección)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowFieldsConfig(!showFieldsConfig)}
              className="text-[11px] font-black text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              {showFieldsConfig ? "Ocultar Columnas" : "Personalizar Columnas o Campos"}
            </button>
          </div>

          {showFieldsConfig && (
            <div className="space-y-3 pt-2.5 border-t border-white/5">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFields(allHeaders)}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-slate-300 rounded font-black cursor-pointer transition shadow-xxs"
                >
                  Seleccionar Todo
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFields(["Establecimiento", "Nº Ticket/Factura", "Total Ticket", "Fecha Emisión"])}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-slate-300 rounded font-black cursor-pointer transition shadow-xxs"
                >
                  Básico (Mínimo)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFields([])}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-slate-300 rounded font-black cursor-pointer transition shadow-xxs"
                >
                  Limpiar Todo
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 text-[10.5px] font-bold text-slate-300">
                {allHeaders.map((field) => {
                  const isChecked = selectedFields.includes(field);
                  return (
                    <label 
                      key={field} 
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition ${
                        isChecked 
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-300" 
                          : "bg-slate-950 border-white/5 hover:bg-white/5 text-slate-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedFields(selectedFields.filter(f => f !== field));
                          } else {
                            setSelectedFields([...selectedFields, field]);
                          }
                        }}
                        className="rounded border-white/10 text-blue-500 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer bg-slate-950"
                      />
                      <span className="truncate">{field}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end border-t border-white/5 pt-3">
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs font-bold text-slate-300 transition cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            Limpiar Filtros
          </button>
          <button
            type="button"
            onClick={handleExportFiltered}
            disabled={filteredInvoices.length === 0}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-white rounded-md text-xs font-bold transition cursor-pointer ${
              filteredInvoices.length === 0 
                ? "bg-white/5 cursor-not-allowed opacity-40 text-slate-500 border border-white/5" 
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            Exportar Filtrados (.CSV)
          </button>
        </div>
      </div>

      {/* METRICAS DEL RESUMEN FILTRADO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Venta Filtrado */}
        <div className="bg-slate-950/45 backdrop-blur-md p-4.5 rounded-xl border border-white/5 shadow-2xl">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Monto Filtrado de Ventas</span>
          <p className="text-xl font-black font-mono text-[#FFB300] mt-0.5">${filteredTotal.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-slate-400 mt-1">{filteredInvoices.length} copias registradas</p>
        </div>

        {/* Subtotal Gasto Filtrado */}
        <div className="bg-slate-950/45 backdrop-blur-md p-4.5 rounded-xl border border-white/5 shadow-2xl">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Base Gravable (Subtotal)</span>
          <p className="text-xl font-black font-mono text-white mt-0.5">${filteredSubtotal.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-slate-400 mt-1">Excluye impuestos ITBMS</p>
        </div>

        {/* Total ITBMS Filtrado */}
        <div className="bg-slate-950/45 backdrop-blur-md p-4.5 rounded-xl border border-white/5 shadow-2xl">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Impuestos Acumulados (ITBMS)</span>
          <p className="text-xl font-black font-mono text-blue-400 mt-0.5">${filteredTax.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-slate-400 mt-1">Impuestos de venta estimados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
        {/* DESGLOSE FISCAL DE ITBMS (7% / 10% / 15% / Exento) */}
        <div className="lg:col-span-5 bg-slate-950/45 backdrop-blur-md p-5 rounded-xl border border-white/5 shadow-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-blue-400" />
            <h4 className="font-black text-white text-xs uppercase tracking-wider">Tabla Desglose ITBMS (Filtrado)</h4>
          </div>
          <p className="text-[11px] text-slate-400">Distribución de impuestos cobrados por fletes e instalaciones según tasa legal:</p>

          <div className="divide-y divide-white/5 font-semibold text-xs text-slate-300 space-y-2.5">
            {/* Exento */}
            <div className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-lg border border-white/5 pt-2.5">
              <div>
                <p className="font-extrabold text-white">0% Exento</p>
                <p className="text-[10px] text-slate-400 font-medium">Bases No Gravadas</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-white">Base: ${taxRatesBreakdown.exento.base.toFixed(2)}</p>
                <p className="text-[11px] font-mono text-slate-400">Imp: $0.00</p>
              </div>
            </div>

            {/* 7% */}
            <div className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-lg border border-white/5 pt-2.5">
              <div>
                <p className="font-extrabold text-white">7% ITBMS</p>
                <p className="text-[10px] text-slate-400 font-medium">Equipos e Instalaciones</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-white">Base: ${taxRatesBreakdown["7%"].base.toFixed(2)}</p>
                <p className="text-[11px] font-mono text-blue-400">Imp: ${taxRatesBreakdown["7%"].tax.toFixed(2)}</p>
              </div>
            </div>

            {/* 10% */}
            <div className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-lg border border-white/5 pt-2.5">
              <div>
                <p className="font-extrabold text-white">10% ITBMS</p>
                <p className="text-[10px] text-slate-400 font-medium">Alcohol o Tabaco</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-white">Base: ${taxRatesBreakdown["10%"].base.toFixed(2)}</p>
                <p className="text-[11px] font-mono text-blue-400 font-bold">Imp: ${taxRatesBreakdown["10%"].tax.toFixed(2)}</p>
              </div>
            </div>

            {/* 15% */}
            <div className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-lg border border-white/5 pt-2.5">
              <div>
                <p className="font-extrabold text-white">15% ITBMS</p>
                <p className="text-[10px] text-slate-400 font-medium">Hospedajes o Especiales</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-white">Base: ${taxRatesBreakdown["15%"].base.toFixed(2)}</p>
                <p className="text-[11px] font-mono text-blue-400 font-bold">Imp: ${taxRatesBreakdown["15%"].tax.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA DE TICKET DETALLES FILTRADOS */}
        <div className="lg:col-span-7 bg-slate-950/45 backdrop-blur-md p-5 rounded-xl border border-white/5 shadow-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">Bitácora de Ventas Filtradas</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Historial directo de copias que cumplen con los filtros ({filteredInvoices.length})</p>
          </div>

          <div className="border border-white/5 rounded-lg overflow-hidden flex-grow max-h-[280px] overflow-y-auto bg-slate-950/20">
            {filteredInvoices.length === 0 ? (
              <div className="p-10 text-center text-xs font-bold text-slate-400">Sin copias de ventas que coincidan con los filtros colocados.</div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-white/5 text-[10px] uppercase font-black text-slate-300 tracking-wider">
                    <th className="p-2.5">Comercio</th>
                    <th className="p-2.5">Fecha</th>
                    <th className="p-2.5">Chofer</th>
                    <th className="p-2.5 text-right font-black">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold text-slate-200">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-white/5 transition">
                      <td className="p-2.5">
                        <p className="truncate max-w-[120px] font-bold text-white text-[11px]" title={inv.issuer}>{inv.issuer}</p>
                        <p className="text-[9px] text-slate-400 font-mono">#{inv.invoiceNumber}</p>
                      </td>
                      <td className="p-2.5 text-[10px] text-slate-300 whitespace-nowrap">{inv.date}</td>
                      <td className="p-2.5 text-[10px] text-slate-400 whitespace-nowrap truncate max-w-[90px]">{getMotorizadoName(inv.motorizadoId)}</td>
                      <td className="p-2.5 font-mono text-right text-emerald-400 font-bold">${(inv.total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
