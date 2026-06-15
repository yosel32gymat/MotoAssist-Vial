import React from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Receipt, 
  Activity, 
  MapPin,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldAlert,
  Coins
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from "recharts";
import { Invoice, Motorizado, VehicleIncident } from "../types";

interface DashboardViewProps {
  invoices: Invoice[];
  motorizados: Motorizado[];
  incidents: VehicleIncident[];
}

export default function DashboardView({ invoices, motorizados, incidents }: DashboardViewProps) {
  // Calcular métricas
  const totalSalesVal = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalInvoices = invoices.length;
  const activeRiders = motorizados.filter(m => m.status === "activo").length;
  const averageSaleValue = totalInvoices > 0 ? totalSalesVal / totalInvoices : 0;

  // Filtrar incidentes pendientes
  const pendingIncidents = incidents ? incidents.filter(inc => inc.status === "pendiente") : [];
  const highSeverityIncidents = pendingIncidents.filter(inc => inc.severity === "alta");

  // Calcular ganancia acumulada total de Asistencias BAT (20% del valor del ticket)
  const totalVialBatSum = invoices.reduce((sum, inv) => {
    const commentsMatch = inv.comments?.toLowerCase().includes("asistencia vial bat");
    const itemsMatch = inv.items?.some(item => 
      item.name?.toLowerCase().includes("asistencia vial bat")
    );
    if (commentsMatch || itemsMatch) {
      return sum + (inv.total || 0) * 0.2;
    }
    return sum;
  }, 0);

  // 1. Datos para gráfico de Barra: Ventas Instaladas por Motorizado
  const salesByMotorizadoData = motorizados.map((mot) => {
    const totalByMot = invoices
      .filter((inv) => inv.motorizadoId === mot.id)
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    return {
      name: mot.name,
      total: Number(totalByMot.toFixed(2))
    };
  }).filter(d => d.total > 0);

  // 2. Datos para gráfico de Línea: Tendencia de Ventas en el tiempo
  const trendMap: { [key: string]: number } = {};
  invoices.forEach(inv => {
    const dateStr = inv.date || "Sin Fecha";
    trendMap[dateStr] = (trendMap[dateStr] || 0) + (inv.total || 0);
  });
  const salesTrendData = Object.entries(trendMap)
    .map(([date, total]) => ({ date, total: Number(total.toFixed(2)) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 3. Distribución por Método de Pago
  const paymentMap: { [key: string]: number } = {};
  invoices.forEach(inv => {
    const method = inv.paymentMethod || "Efectivo";
    paymentMap[method] = (paymentMap[method] || 0) + (inv.total || 0);
  });
  const paymentMethodData = Object.entries(paymentMap).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2))
  }));

  // 4. Datos para evaluación de cantidad de tickets por sucursal
  const branchMap: { [key: string]: number } = {};
  invoices.forEach(inv => {
    const branchName = inv.sucursal && inv.sucursal.trim() !== "" ? inv.sucursal.trim() : "Principal / Matriz";
    branchMap[branchName] = (branchMap[branchName] || 0) + 1;
  });
  const ticketsByBranchData = Object.entries(branchMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const COLORS = ["#0055FF", "#FFB300", "#00A3FF", "#10B981", "#6366F1", "#F43F5E"];

  return (
    <div id="dashboard-module-view" className="space-y-6 animate-fade-in text-slate-100">
      
      {/* PANEL DE NOTIFICACIÓN DE INCIDENTES (DINÁMICO Y CREATIVO) */}
      {pendingIncidents.length > 0 ? (
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-amber-500/10 border-l-4 border-amber-500 rounded-r-xl p-4.5 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <span>⚠️ ALERTA DE INCIDENTES ACTIVOS ({pendingIncidents.length}) 🚨</span>
              </h4>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 uppercase px-2 py-0.5 rounded font-bold">
                Monitoreo Vial 🛵
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-normal font-semibold">
              ¡Precaución! Hay un total de <strong className="text-amber-300 font-black">{pendingIncidents.length} incidentes pendientes</strong> en las motocicletas de la flota. 
              {highSeverityIncidents.length > 0 && (
                <span> De los cuales, <span className="text-rose-400 font-extrabold underline">{highSeverityIncidents.length} son de gravedad ALTA 🔥</span>. Por favor asista al equipo de inmediato.</span>
              )}
            </p>

            {/* Listado scrolleable horizontal de incidentes rápidos */}
            <div className="flex gap-2.5 overflow-x-auto pt-2 pb-1 scrollbar-thin">
              {pendingIncidents.map(inc => {
                const mot = motorizados.find(m => m.id === inc.motorizadoId);
                return (
                  <div key={inc.id} className="bg-slate-900/85 border border-white/5 rounded-lg p-2.5 shrink-0 min-w-[210px] text-[11px] shadow-lg">
                    <div className="flex items-center justify-between gap-1 border-b border-white/5 pb-1 mb-1 font-black uppercase text-[9px]">
                      <span className="text-slate-300 truncate max-w-[110px]" title={mot ? mot.name : "Moto"}>{mot ? mot.name : "Moto / S.M."}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase ${
                        inc.severity === "alta" ? "bg-rose-950 text-rose-300 border border-rose-500/30" : "bg-amber-950 text-amber-300 border border-amber-500/30"
                      }`}>{inc.severity}</span>
                    </div>
                    <p className="font-semibold text-slate-300 line-clamp-1 italic">"{inc.description}"</p>
                    <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-0.5 font-bold font-mono">
                      <Clock className="h-2.5 w-2.5 text-slate-400" />
                      {inc.date} • Placa: {mot?.vehiclePlate || "N/A"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2.5">
            <span className="text-3xl animate-bounce">🛠️</span>
            <div className="text-left bg-slate-900/60 p-2.5 rounded-lg border border-white/5 shadow-inner">
              <p className="text-[8.5px] uppercase font-black text-amber-400 tracking-wider">Estado Flota</p>
              <p className="text-lg font-black font-mono text-amber-300">{(activeRiders / (motorizados.length || 1) * 100).toFixed(0)}% Ope.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-500/10 to-[#0055FF]/5 border-l-4 border-emerald-500 rounded-r-2xl p-4.5 shadow-xl glass-panel flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>✅ Flota en Perfectas Condiciones</span>
            </h4>
            <p className="text-xs text-slate-350 leading-normal font-semibold">
              ¡Excelente! No hay incidencias viales ni desperfectos mecánicos reportados en este momento. ¡Buen viaje del equipo de choferes! 🚀
            </p>
          </div>
          <span className="text-2xl shrink-0">✨🛵</span>
        </div>
      )}

      {/* TARJETAS DE MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Ventas Instaladas */}
        <div className="glass-card hover:bg-slate-900/70 p-5 rounded-2xl flex items-center justify-between hover:-translate-y-0.5 transition duration-200">
          <div className="space-y-1">
            <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Ventas Instaladas 💰</span>
            <p className="text-xl font-black font-mono text-white">${totalSalesVal.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
              <CheckCircle2 className="h-3 w-3" />
              <span>Sincronizado</span>
            </p>
          </div>
          <div className="p-3 bg-[#0055FF]/15 text-[#0055FF] rounded-xl shrink-0 border border-blue-500/25">
            <DollarSign className="h-5.5 w-5.5 text-blue-400" />
          </div>
        </div>

        {/* Total Tickets Registrados */}
        <div className="glass-card hover:bg-slate-900/70 p-5 rounded-2xl flex items-center justify-between hover:-translate-y-0.5 transition duration-200">
          <div className="space-y-1">
            <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Tickets Totales 📄</span>
            <p className="text-xl font-black font-mono text-white">{totalInvoices}</p>
            <p className="text-[9px] text-slate-400 font-semibold">Copias Registradas</p>
          </div>
          <div className="p-3 bg-[#00A3FF]/15 text-[#00A3FF] rounded-xl shrink-0 border border-sky-400/25">
            <Receipt className="h-5.5 w-5.5 text-sky-400" />
          </div>
        </div>

        {/* Ganancia por Asistencias Vial BAT (20% del Ticket) */}
        <div className="glass-card hover:bg-slate-900/70 p-5 rounded-2xl border-l-4 border-l-[#FFB300] flex items-center justify-between hover:-translate-y-0.5 transition duration-200">
          <div className="space-y-1">
            <span className="text-[9.5px] font-black uppercase text-[#FFB300] tracking-wider flex items-center gap-1">
              <span>Ganancias BAT (20%) 🔋</span>
            </span>
            <p className="text-xl font-black font-mono text-white">${totalVialBatSum.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-[9px] text-slate-450 font-bold uppercase">Asistencias 20%</p>
          </div>
          <div className="p-3 bg-[#FFB300]/15 text-[#FFB300] rounded-xl shrink-0 border border-[#FFB300]/25">
            <Coins className="h-5.5 w-5.5 text-[#FFB300]" />
          </div>
        </div>

        {/* Flota Activa */}
        <div className="glass-card hover:bg-slate-900/70 p-5 rounded-2xl flex items-center justify-between hover:-translate-y-0.5 transition duration-200">
          <div className="space-y-1">
            <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Flota Activa 🛵</span>
            <p className="text-xl font-black font-mono text-white">{activeRiders} / {motorizados.length}</p>
            <p className="text-[9px] text-slate-400 font-semibold">Motorizados Activos</p>
          </div>
          <div className="p-3 bg-violet-650/15 text-violet-400 rounded-xl shrink-0 border border-violet-500/25">
            <Users className="h-5.5 w-5.5 text-violet-300" />
          </div>
        </div>

        {/* Valor Promedio de Venta */}
        <div className="glass-card hover:bg-slate-900/70 p-5 rounded-2xl flex items-center justify-between hover:-translate-y-0.5 transition duration-200">
          <div className="space-y-1">
            <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Promedio Venta 📈</span>
            <p className="text-xl font-black font-mono text-white">${averageSaleValue.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-[9px] text-slate-400 font-semibold">Por Copia Guardada</p>
          </div>
          <div className="p-3 bg-purple-650/15 text-purple-400 rounded-xl shrink-0 border border-purple-500/25">
            <Activity className="h-5.5 w-5.5 text-purple-300" />
          </div>
        </div>
      </div>

      {/* GRÁFICOS ANALÍTICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TENDENCIA DE VENTAS INSTALADAS */}
        <div className="lg:col-span-8 glass-card p-5.5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                <span>🔥 Historial y Flujo de Ventas</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Tendencia acumulada por fechas de instalación</p>
            </div>
            <span className="p-1 px-2.5 text-[9px] font-black uppercase text-blue-400 bg-blue-500/15 rounded-full border border-blue-500/20">
              Línea Temporal 📉
            </span>
          </div>

          <div className="h-[260px] w-full">
            {salesTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0055FF" stopOpacity={0.45}/>
                      <stop offset="95%" stopColor="#0055FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="date" tickStyle={{ fontSize: 9 }} stroke="rgba(255, 255, 255, 0.45)" />
                  <YAxis tickStyle={{ fontSize: 9 }} stroke="rgba(255, 255, 255, 0.45)" />
                  <Tooltip 
                    contentStyle={{ fontSize: 11, borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(10, 18, 38, 0.95)", color: "#fff" }}
                    formatter={(value: any) => [`$${value}`, "Ventas"]}
                  />
                  <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-450 text-xs">
                Registra ventas e instalaciones para ver la tendencia económica.
              </div>
            )}
          </div>
        </div>

        {/* DISTRIBUCIÓN DE TICKETS POR SUCURSAL */}
        <div className="lg:col-span-4 glass-card p-5.5 rounded-2xl lg:space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
              <span>🏢 Tickets de Ventas por Sucursal</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold">Evaluación de volumen transaccional de instalaciones</p>
          </div>

          <div className="flex-grow overflow-y-auto max-h-[220px] pr-1 space-y-3 mt-2 scrollbar-none">
            {ticketsByBranchData.length > 0 ? (
              ticketsByBranchData.map((branch) => {
                const percentage = totalInvoices > 0 ? (branch.count / totalInvoices) * 100 : 0;
                return (
                  <div key={branch.name} className="space-y-1 font-bold text-xs">
                    <div className="flex justify-between text-slate-300 text-[11px]">
                      <span className="truncate max-w-[170px]" title={branch.name}>{branch.name}</span>
                      <span className="text-slate-400 font-mono flex-shrink-0">{branch.count} tkt ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-950/40 rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div 
                        className="bg-sky-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center py-8">
                Sin datos de sucursales registrados.
              </div>
            )}
          </div>
        </div>

        {/* MÉTODOS DE PAGO DE VENTAS */}
        <div className="lg:col-span-4 glass-card p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="font-extrabold text-white text-sm">💳 Métodos de Pago</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Distribución por cobro de instalación</p>
          </div>

          <div className="h-[210px] w-full flex items-center justify-center relative">
            {paymentMethodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ fontSize: 11, borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(10, 18, 38, 0.95)", color: "#fff" }}
                    formatter={(value: any) => [`$${value}`, "Monto"]} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fill: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-450 text-xs text-center">Sin distribución de cobro</div>
            )}
          </div>
        </div>

        {/* VENTAS POR MOTORIZADO */}
        <div className="lg:col-span-8 glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-white text-sm">🏁 Copias de Ventas por Motorizado</h3>
              <p className="text-[11px] text-slate-400 font-medium font-semibold">Monto total acumulado de ventas instaladas por cada motorizado</p>
            </div>
            <span className="p-1 px-2.5 text-[9px] font-black uppercase text-emerald-450 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              Rendimiento 🚀
            </span>
          </div>

          <div className="h-[210px] w-full">
            {salesByMotorizadoData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByMotorizadoData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="name" style={{ fontSize: 10 }} stroke="rgba(255, 255, 255, 0.45)" />
                  <YAxis style={{ fontSize: 9 }} stroke="rgba(255, 255, 255, 0.45)" />
                  <Tooltip 
                    contentStyle={{ fontSize: 11, borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(10, 18, 38, 0.95)", color: "#fff" }}
                    formatter={(value: any) => [`$${value}`, "Monto Instalado"]} 
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={45}>
                    {salesByMotorizadoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-450 text-xs text-center font-bold">
                Asigna motorizados a tus copias de ventas instaladas para ver estadísticas de flota.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
