import React, { useState } from "react";
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  User, 
  Phone, 
  FileText, 
  Smartphone,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  Wrench,
  CheckCircle,
  Clock,
  Coins,
  LayoutGrid,
  ClipboardList,
  Info
} from "lucide-react";
import { Motorizado, Invoice, VehicleIncident } from "../types";

interface MotorizadosViewProps {
  motorizados: Motorizado[];
  invoices: Invoice[];
  onSave: (mot: Omit<Motorizado, "userId" | "createdAt">, editId?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  localLoading?: boolean;
  incidents: VehicleIncident[];
  onSaveIncidents: (list: VehicleIncident[]) => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void, variant?: "danger" | "warning") => void;
}

export default function MotorizadosView({ 
  motorizados, 
  invoices, 
  onSave, 
  onDelete,
  localLoading = false,
  incidents,
  onSaveIncidents,
  triggerConfirm
}: MotorizadosViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados nuevos para detalle e incidentes de motorizados
  const [selectedMotDetails, setSelectedMotDetails] = useState<Motorizado | null>(null);

  const [incidentDesc, setIncidentDesc] = useState("");
  const [incidentSeverity, setIncidentSeverity] = useState<"baja" | "media" | "alta">("media");
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split("T")[0]);

  // Ganancias por desc "asistencia vial bat" - Corrección: 20% del valor del ticket
  const getMotorizadoGanancia = (motId?: string) => {
    if (!motId) return 0;
    const motInvoices = invoices.filter(inv => inv.motorizadoId === motId);
    let totalGanancia = 0;
    
    motInvoices.forEach(inv => {
      const commentsMatch = inv.comments?.toLowerCase().includes("asistencia vial bat");
      const itemsMatch = inv.items?.some(item => 
        item.name?.toLowerCase().includes("asistencia vial bat")
      );
      if (commentsMatch || itemsMatch) {
        totalGanancia += (inv.total || 0) * 0.2;
      }
    });
    
    return totalGanancia;
  };

  // Stats por tipo de factura de un motorizado
  const getStatsByInvoiceType = (motId?: string) => {
    const counts = {
      "CALL CENTER": 0,
      "SUCURSAL": 0,
      "FLOTA": 0,
      "GERENTE DE LINEA": 0,
      "OMITIDO": 0,
    };
    if (!motId) return counts;

    const motInvoices = invoices.filter(inv => inv.motorizadoId === motId);
    motInvoices.forEach(inv => {
      const type = (inv.invoiceType || "").toUpperCase();
      if (type in counts) {
        counts[type as keyof typeof counts] += 1;
      }
    });

    return counts;
  };

  // Campos de formulario
  const [name, setName] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"activo" | "inactivo">("activo");

  const resetForm = () => {
    setName("");
    setVehiclePlate("");
    setVehicleModel("");
    setPhone("");
    setStatus("activo");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditInit = (mot: Motorizado) => {
    setName(mot.name);
    setVehiclePlate(mot.vehiclePlate);
    setVehicleModel(mot.vehicleModel || "");
    setPhone(mot.phone || "");
    setStatus(mot.status);
    setEditingId(mot.id || null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("El nombre es requerido");
    if (!vehiclePlate.trim()) return alert("La placa de la moto es requerida");

    try {
      await onSave({
        name: name.trim(),
        vehiclePlate: vehiclePlate.trim().toUpperCase(),
        vehicleModel: vehicleModel.trim(),
        phone: phone.trim(),
        status
      }, editingId || undefined);
      resetForm();
    } catch (e) {
      console.error(e);
    }
  };

  // Calcular estadísticas por motorizado
  const getMotorizadoStats = (id?: string) => {
    if (!id) return { count: 0, total: 0 };
    const filtered = invoices.filter(inv => inv.motorizadoId === id);
    const total = filtered.reduce((sum, inv) => sum + (inv.total || 0), 0);
    return {
      count: filtered.length,
      total: Number(total.toFixed(2))
    };
  };

  return (
    <div id="motorizados-module-view" className="space-y-6 animate-fade-in text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-black text-white text-sm">Flota de Motorizados</h3>
          <p className="text-[11px] text-slate-400 font-medium">Gestiona y consulta los motorizados encargados de subir copias de fletes y realizar entregas</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black transition shadow-lg cursor-pointer self-start"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Agregar Motorizado</span>
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/5 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider">
              {editingId ? "Editar Detalles del Motorizado" : "Registrar Nuevo Chofer / Motorizado"}
            </h4>
            <button 
              type="button" 
              onClick={resetForm}
              className="text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950/60 border border-white/10 rounded-md focus:outline-none focus:border-blue-500 font-semibold text-white placeholder-slate-550"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Placa del Vehículo</label>
              <input
                type="text"
                placeholder="Ej. BA2903 o M-14902"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950/60 border border-white/10 rounded-md focus:outline-none focus:border-blue-500 font-semibold uppercase text-white placeholder-slate-550"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Modelo de Moto</label>
              <input
                type="text"
                placeholder="Ej. Honda Cargo 150"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950/60 border border-white/10 rounded-md focus:outline-none focus:border-blue-500 font-semibold text-white placeholder-slate-550"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Celular / Contacto</label>
              <input
                type="tel"
                placeholder="Ej. +507 6291-3091"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950/60 border border-white/10 rounded-md focus:outline-none focus:border-blue-500 font-semibold text-white placeholder-slate-550"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950/60 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-white cursor-pointer"
              >
                <option className="bg-slate-950 text-white" value="activo">Activo</option>
                <option className="bg-slate-950 text-white" value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2 justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs font-bold text-slate-300 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition cursor-pointer shadow-md"
            >
              {editingId ? "Actualizar Chofer" : "Guardar Chofer"}
            </button>
          </div>
        </form>
      )}

      {/* LISTA EN REJILLA */}
      {motorizados.length === 0 ? (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5 p-10 text-center space-y-3">
          <div className="bg-blue-500/10 w-12 h-12 rounded-full flex items-center justify-center text-blue-400 mx-auto border border-blue-500/15">
            <Users className="h-6 w-6" />
          </div>
          <div className="max-w-xs mx-auto space-y-1">
            <p className="font-bold text-slate-250 text-sm">Registra tu primer motorizado</p>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Escribe el nombre y la matrícula de los motorizados de reparto para poder registrar y guiar todas las copias de ventas instaladas.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {motorizados.map((mot) => {
            const stats = getMotorizadoStats(mot.id);
            return (
              <div 
                key={mot.id} 
                className={`bg-slate-950/45 backdrop-blur-md rounded-xl border p-5 shadow-xl relative overflow-hidden transition hover:shadow-2xl flex flex-col justify-between min-h-[175px] ${
                  mot.status === "inactivo" ? "border-white/5 bg-slate-950/25 opacity-70" : "border-white/5"
                }`}
              >
                {/* ENCABEZADO CHIP */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg text-slate-300 font-bold shrink-0 ${
                      mot.status === "inactivo" ? "bg-white/5" : "bg-blue-500/10 text-blue-400 border border-blue-500/15"
                    }`}>
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm leading-tight">{mot.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold tracking-wide mt-1 uppercase">Placa: {mot.vehiclePlate}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full ${
                    mot.status === "inactivo" 
                      ? "bg-white/10 text-slate-400" 
                      : "bg-[#FFB300]/10 text-[#FFB300] border border-[#FFB300]/20"
                  }`}>
                    {mot.status}
                  </span>
                </div>

                {/* DETALLE Y MARCA */}
                <div className="py-2 border-t border-white/5 mt-4 pt-3 text-xs font-semibold text-slate-405 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Moto:</span>
                    <span className="text-slate-200">{mot.vehicleModel || "Genérico o S/M"}</span>
                  </div>
                  {mot.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Celular:</span>
                      <span className="text-slate-200 flex items-center gap-1">
                        <Smartphone className="h-3 w-3 text-slate-400" />
                        {mot.phone}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between bg-slate-950/40 p-1.5 rounded border border-white/5 mt-1.5">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[10px] text-slate-300 uppercase font-black">{stats.count} Ventas</span>
                    </div>
                    <span className="font-bold text-white font-mono">${stats.total.toFixed(2)}</span>
                  </div>

                  {/* KPI GANANCIA INDIVIDUAL ASISTENCIA VIAL BAT */}
                  <div className="flex items-center justify-between bg-emerald-500/10 p-1.5 rounded border border-emerald-500/15 mt-1.5 text-emerald-400">
                    <div className="flex items-center gap-1">
                      <Coins className="h-3.5 w-3.5 text-emerald-400 shadow-xxs" />
                      <span className="text-[10px] uppercase font-black whitespace-nowrap">Asistencia Vial BAT</span>
                    </div>
                    <span className="font-extrabold font-mono text-emerald-300">${getMotorizadoGanancia(mot.id).toFixed(2)}</span>
                  </div>

                  {/* INDICADOR DE INCIDENTES */}
                  {(() => {
                    const motIncidents = incidents.filter(inc => inc.motorizadoId === mot.id);
                    const pendingIncidents = motIncidents.filter(inc => inc.status === "pendiente").length;
                    return motIncidents.length > 0 ? (
                      <div className="flex items-center justify-between bg-rose-500/10 p-1.5 rounded border border-rose-500/15 mt-1.5 text-rose-300">
                        <div className="flex items-center gap-1">
                          <Wrench className="h-3.5 w-3.5 text-rose-400" />
                          <span className="text-[10px] uppercase font-black">Incidentes Moto</span>
                        </div>
                        <span className="font-bold text-rose-400 text-[10.5px]">{pendingIncidents} pend. / {motIncidents.length} total</span>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* BOTONES DE EDICIÓN */}
                <div className="flex justify-end gap-2.5 mt-3 border-t border-white/5 pt-2.5">
                  <button
                    onClick={() => setSelectedMotDetails(mot)}
                    className="mr-auto p-1 px-2.5 text-blue-400 hover:text-blue-300 text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer bg-blue-500/10 hover:bg-blue-500/20 rounded-md border border-blue-500/15 text-center"
                  >
                    <ClipboardList className="h-3 w-3" />
                    KPIs & Incidentes
                  </button>
                  <button
                    onClick={() => handleEditInit(mot)}
                    className="p-1 px-2.5 text-slate-350 hover:text-white text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="h-3 w-3" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (mot.id) {
                        triggerConfirm(
                          "🛵 ¿Eliminar Motorizado?",
                          `¿Está seguro de que desea eliminar a "${mot.name}" de la lista de conductores activos? Esta acción es irreversible.`,
                          () => onDelete(mot.id!)
                        );
                      }
                    }}
                    className="p-1 px-2.5 text-red-400 hover:text-red-300 text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE KPIs E INCIDENTES DEL MOTORIZADO */}
      {selectedMotDetails && (() => {
        const motId = selectedMotDetails.id || "";
        const motIncidents = incidents.filter(inc => inc.motorizadoId === motId);
        const statsByType = getStatsByInvoiceType(motId);
        const totalVialBat = getMotorizadoGanancia(motId);

        const handleAddIncident = (e: React.FormEvent) => {
          e.preventDefault();
          if (!incidentDesc.trim()) return;

          const newIncident: VehicleIncident = {
            id: "inc_" + Date.now(),
            motorizadoId: motId,
            date: incidentDate,
            description: incidentDesc.trim(),
            severity: incidentSeverity,
            status: "pendiente"
          };

          onSaveIncidents([...incidents, newIncident]);
          setIncidentDesc("");
        };

        const toggleIncidentStatus = (incId: string) => {
          const updated = incidents.map(inc => {
            if (inc.id === incId) {
              return { ...inc, status: inc.status === "pendiente" ? "resuelto" as const : "pendiente" as const };
            }
            return inc;
          });
          onSaveIncidents(updated);
        };

        const handleDeleteIncident = (incId: string) => {
          triggerConfirm(
            "🗑️ ¿Borrar Registro de Incidente?",
            "Esta operación eliminará permanentemente la anotación de desperfecto de la motocicleta de la base de datos.",
            () => {
              const updated = incidents.filter(inc => inc.id !== incId);
              onSaveIncidents(updated);
            },
            "danger"
          );
        };

        return (
          <div 
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={() => setSelectedMotDetails(null)}
          >
            <div 
              className="bg-slate-900 border border-white/10 rounded-xl max-w-3xl w-full p-5 sm:p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Encabezado */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/15 rounded-lg shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <span>Monitoreo Operativo: {selectedMotDetails.name}</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                      Matrícula: <span className="font-extrabold text-blue-300">{selectedMotDetails.vehiclePlate}</span> • Moto: <span className="font-extrabold text-blue-300">{selectedMotDetails.vehicleModel || "Genérico o S/M"}</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMotDetails(null)}
                  className="p-1 px-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Grid Principal: KPIs de Instalación y Ganancia Asistencia BAT */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-blue-400" />
                  <h4 className="font-black text-white text-xs uppercase tracking-wide">KPIs de Instalación por Tipo de Factura</h4>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                  {/* CALL CENTER */}
                  <div className="bg-slate-950/40 border border-white/5 rounded-lg p-2.5 text-center flex flex-col justify-between">
                    <span className="text-[9px] font-black uppercase text-blue-405 tracking-wider">Call Center</span>
                    <p className="text-lg font-black font-mono text-white mt-1">{statsByType["CALL CENTER"]}</p>
                    <span className="text-[9px] text-slate-450 font-bold">instalados</span>
                  </div>

                  {/* SUCURSAL */}
                  <div className="bg-slate-950/40 border border-white/5 rounded-lg p-2.5 text-center flex flex-col justify-between">
                    <span className="text-[9px] font-black uppercase text-emerald-405 tracking-wider">Sucursal</span>
                    <p className="text-lg font-black font-mono text-white mt-1">{statsByType["SUCURSAL"]}</p>
                    <span className="text-[9px] text-slate-450 font-bold">instalados</span>
                  </div>

                  {/* FLOTA */}
                  <div className="bg-slate-950/40 border border-white/5 rounded-lg p-2.5 text-center flex flex-col justify-between">
                    <span className="text-[9px] font-black uppercase text-purple-405 tracking-wider">Flota</span>
                    <p className="text-lg font-black font-mono text-white mt-1">{statsByType["FLOTA"]}</p>
                    <span className="text-[9px] text-slate-450 font-bold">instalados</span>
                  </div>

                  {/* GERENTE DE LINEA */}
                  <div className="bg-slate-950/40 border border-white/5 rounded-lg p-2.5 text-center flex flex-col justify-between">
                    <span className="text-[9px] font-black uppercase text-indigo-405 tracking-wider">Gerente</span>
                    <p className="text-lg font-black font-mono text-white mt-1">{statsByType["GERENTE DE LINEA"]}</p>
                    <span className="text-[9px] text-slate-450 font-bold">instalados</span>
                  </div>

                  {/* OMITIDO */}
                  <div className="bg-slate-950/40 border border-white/5 rounded-lg p-2.5 text-center flex flex-col justify-between col-span-2 sm:col-span-1">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Omitido</span>
                    <p className="text-lg font-black font-mono text-white mt-1">{statsByType["OMITIDO"]}</p>
                    <span className="text-[9px] text-slate-450 font-bold">omitidos</span>
                  </div>
                </div>

                {/* KPI de Ganancia por Asistencia Vial BAT */}
                <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl mt-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-black uppercase text-[10px] tracking-wider">
                      <Coins className="h-4 w-4" />
                      <span>Ingreso Acumulable BAT</span>
                    </div>
                    <h5 className="text-sm font-black text-white leading-tight">Ganancia Total por Asistencias</h5>
                    <p className="text-[10.5px] text-slate-350 font-medium">
                      Monto total proveniente de los fletes que en su descripción o comentarios digan: <strong className="text-amber-400 underline font-mono">"asistencia vial bat"</strong>.
                    </p>
                  </div>
                  <div className="text-right shrink-0 bg-slate-950 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Total Ganado</span>
                    <p className="text-2xl font-black font-mono text-[#FFB300] mt-0.5">${totalVialBat.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE INCIDENTES PARA LA MOTO */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-white/5 pt-5">
                
                {/* Visualizador de incidentes registrados */}
                <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                      <Wrench className="h-4 w-4" />
                      <span>Bitácora de Incidentes de la Moto</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Consigna aquí desperfectos viales, mecánicos o reparaciones.</p>
                  </div>

                  <div className="border border-white/5 rounded-lg overflow-hidden flex-grow max-h-[220px] overflow-y-auto bg-slate-950/30">
                    {motIncidents.length === 0 ? (
                      <div className="p-8 text-center text-xs font-bold text-slate-400 space-y-2">
                        <CheckCircle className="h-7 w-7 text-emerald-400 mx-auto" />
                        <p>Sin incidentes registrados en esta motocicleta.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {motIncidents.map((inc) => (
                          <div key={inc.id} className="p-3 bg-slate-900/40 hover:bg-slate-900 font-semibold text-xs text-slate-300 flex flex-col gap-2.5">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-[11px] font-black text-white leading-relaxed truncate">{inc.description}</p>
                              <button
                                onClick={() => handleDeleteIncident(inc.id)}
                                className="text-[10px] text-red-400 hover:text-red-300 font-extrabold pr-1 cursor-pointer transition uppercase"
                              >
                                Borrar
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap font-bold">
                              <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {inc.date}
                              </span>
                              
                              <span className={`px-2 py-0.5 text-[8px] uppercase rounded-full font-bold ${
                                inc.severity === "alta" 
                                  ? "bg-rose-500/10 text-rose-355 border border-rose-500/20" 
                                  : inc.severity === "media" 
                                  ? "bg-amber-500/10 text-amber-355 border border-amber-500/20" 
                                  : "bg-blue-500/10 text-blue-355 border border-blue-500/20"
                              }`}>
                                {inc.severity}
                              </span>

                              <button
                                onClick={() => toggleIncidentStatus(inc.id)}
                                className={`px-2 py-0.5 text-[8.5px] uppercase rounded-full font-black flex items-center gap-0.5 cursor-pointer transition ${
                                  inc.status === "resuelto"
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25"
                                    : "bg-rose-500/15 text-rose-400 border border-rose-500/25 hover:bg-rose-500/25"
                                }`}
                              >
                                {inc.status === "resuelto" ? (
                                  <>
                                    <Check className="h-2.5 w-2.5" />
                                    <span>Resuelto</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="h-2.5 w-2.5" />
                                    <span>Pendiente</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Formulario para registrar incidente */}
                <div className="lg:col-span-5 bg-slate-950/40 border border-white/5 rounded-xl p-4 space-y-3.5">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Registrar Evento</span>
                    <h5 className="text-[11px] font-bold text-slate-200 uppercase">Nuevo Incidente con la Moto</h5>
                  </div>

                  <form onSubmit={handleAddIncident} className="space-y-3 font-semibold text-xs text-slate-300">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Detalle del Incidente</label>
                      <textarea
                        rows={2}
                        placeholder="Ej. Cambio de bujía, pinchazo, mantenimiento..."
                        value={incidentDesc}
                        onChange={(e) => setIncidentDesc(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 resize-none text-white placeholder-slate-550"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gravedad</label>
                        <select
                          value={incidentSeverity}
                          onChange={(e) => setIncidentSeverity(e.target.value as any)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-[10.5px] font-bold focus:outline-none focus:border-blue-500 cursor-pointer text-white"
                        >
                          <option className="bg-slate-950 text-white" value="baja">Baja</option>
                          <option className="bg-slate-950 text-white" value="media">Media</option>
                          <option className="bg-slate-950 text-white" value="alta">Alta</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha</label>
                        <input
                          type="date"
                          value={incidentDate}
                          onChange={(e) => setIncidentDate(e.target.value)}
                          className="w-full px-2 py-1 bg-slate-950 border border-white/10 rounded-lg text-[10.5px] font-bold focus:outline-none focus:border-blue-500 text-white"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-lg transition uppercase flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      <span>Agregar Registro</span>
                    </button>
                  </form>
                </div>

              </div>

              {/* Botón de cierre */}
              <div className="text-right border-t border-white/5 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedMotDetails(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 text-[11px] font-extrabold rounded-lg transition cursor-pointer"
                >
                  Cerrar Ventana
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
