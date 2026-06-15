import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Plus, 
  FileDown, 
  Edit3, 
  Check, 
  X, 
  Loader2, 
  User, 
  LogOut, 
  LogIn, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  Receipt,
  HelpCircle,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
  Users,
  BarChart3,
  Filter,
  Search,
  ChevronRight,
  TrendingUp,
  MapPin,
  FileCheck,
  Percent,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  updateDoc,
  onSnapshot
} from "firebase/firestore";

import { db, auth, isFirebaseConfigured, handleFirestoreError } from "./firebase";
import { Invoice, InvoiceItem, Motorizado, OperationType, VehicleIncident } from "./types";
import { compressImage } from "./utils/imageCompressor";
import { exportInvoicesToCSV } from "./utils/csvExport";

// Importar sub-componentes modulares
import DashboardView from "./components/DashboardView";
import MotorizadosView from "./components/MotorizadosView";
import ReportsView from "./components/ReportsView";
import TicketDetailView from "./components/TicketDetailView";
import TicketEditForm from "./components/TicketEditForm";
import CameraCapture from "./components/CameraCapture";

// Demo Image and Mock
const DEMO_IMAGE_BASE64 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'><rect width='300' height='400' fill='%23fafafa'/><path d='M10 20 h280 M10 30 h280' stroke='%23ccc'/><text x='150' y='60' font-family='monospace' font-size='18' text-anchor='middle'>AUTO CENTRO S.A.</text><text x='150' y='80' font-family='monospace' font-size='11' text-anchor='middle'>Brisas del Golf, San Miguelito</text><text x='150' y='110' font-family='monospace' font-size='12' text-anchor='middle'>FACTURA: 8-NT-9201-192</text><text x='20' y='150' font-family='monospace' font-size='12'>3x LUBRICANTE SINTETICO</text><text x='280' y='150' font-family='monospace' font-size='12' text-anchor='end'>24.00</text><text x='20' y='170' font-family='monospace' font-size='12'>1x FILTRO DE ACEITE PREMIUM</text><text x='280' y='170' font-family='monospace' font-size='12' text-anchor='end'>8.50</text><text x='20' y='190' font-family='monospace' font-size='12'>1x MANO DE OBRA REEMPLAZO</text><text x='280' y='190' font-family='monospace' font-size='12' text-anchor='end'>15.00</text><path d='M20 230 h260' stroke='%23aaa' stroke-dasharray='4'/><text x='20' y='260' font-family='monospace' font-size='14' font-weight='bold'>TOTAL USD</text><text x='280' y='260' font-family='monospace' font-size='14' font-weight='bold' text-anchor='end'>51.25</text><text x='20' y='280' font-family='monospace' font-size='11'>TAX ITBMS (7%): 3.75</text><text x='25' y='325' font-family='monospace' font-size='10'>VICTOR CRUZ - CAJA 01</text><text x='150' y='360' font-family='monospace' font-size='10' text-anchor='middle'>GRACIAS AUTOCENTRO</text></svg>";

const DEMO_EXTRACTION_MOCK: Invoice = {
  issuer: "AUTO CENTRO, S.A.",
  date: new Date().toISOString().split("T")[0],
  invoiceNumber: "AC-2026-90412",
  total: 51.25,
  tax: 3.75,
  paymentMethod: "Tarjeta de Crédito",
  items: [
    { name: "LUBRICANTE SINTETICO MULTIGRADO", quantity: 3, price: 8.00, total: 24.00 },
    { name: "FILTRO DE ACEITE PREMIUM S.A.", quantity: 1, price: 8.50, total: 8.50 },
    { name: "MANO DE OBRA REEMPLAZO TALLER", quantity: 1, price: 15.00, total: 15.00 }
  ],
  imageUrl: DEMO_IMAGE_BASE64,
  userId: "demo",
  createdAt: new Date().toISOString(),
  issuerRuc: "603-203-124985 DV 01",
  issuerAddress: "Panama Brisas del golf, Av Principal, Local 4",
  invoiceType: "Comprobante Auxiliar de Factura Electrónica",
  serial: "FEP-0010920421",
  sucursal: "0010 (Brisas)",
  ptoFact: "001",
  receiverName: "DORA GUERRA",
  receiverRuc: "8-306-599 DV",
  receiverType: "Consumidor final",
  subtotal: 47.50,
  itbms: 3.75,
  desgloseItbms: [
    { base: 47.50, rate: "7%", tax: 3.75 }
  ],
  qrUrl: "https://dgi-fep.mef.gob.pa/Consultas/FacturaElectronica",
  accessKey: "20261156550294101FEP",
  seller: "VICTOR CRUZ",
  comments: "DOMICILIO BRISAS DEL GOLF, calle primera",
  motorizadoId: ""
};

const LogoSVG = ({ className = "h-8 w-8 text-white" }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className} 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Ruedas */}
    <circle cx="28" cy="72" r="10" stroke="currentColor" strokeWidth="5.5" fill="none" />
    <circle cx="28" cy="72" r="3.5" fill="currentColor" />
    <circle cx="80" cy="72" r="10" stroke="currentColor" strokeWidth="5.5" fill="none" />
    <circle cx="80" cy="72" r="3.5" fill="currentColor" />
    
    {/* Chasis y Guardabarros */}
    <path 
      d="M 28 72 L 36 71 L 41 58 L 72 58 L 78 72" 
      stroke="currentColor" 
      strokeWidth="5.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none" 
    />
    
    {/* Manubrio / Dirección */}
    <path 
      d="M 68 58 L 75 40 L 68 39" 
      stroke="currentColor" 
      strokeWidth="5.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none" 
    />
    
    {/* Conductor Cuerpo y Casco */}
    <path 
      d="M 47 56 C 45 42, 53 32, 63 32 C 66 32, 68 34, 68 38 L 56 56 Z" 
      fill="currentColor" 
    />
    <path 
      d="M 52 42 L 67 43 L 71 40" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none" 
    />
    <circle cx="53" cy="22" r="9" fill="currentColor" />
    {/* Visor del Casco (Transparente/Blanco) */}
    <path d="M 54 18 L 60 20 L 59 24 L 53 22 Z" fill="white" />

    {/* Batería Gigante (Caja de Distribución en parrilla) */}
    <path d="M 12 58 L 32 58" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <rect x="7" y="36" width="28" height="20" rx="3.5" fill="currentColor" />
    {/* Bornes superiores de la batería */}
    <rect x="13" y="32" width="5" height="4" rx="1" fill="currentColor" />
    <rect x="24" y="32" width="5" height="4" rx="1" fill="currentColor" />
    {/* Rayo de Energía interior */}
    <polygon points="23,40 16,47 21,47 19,53 26,45 21,45" fill="white" />
  </svg>
);

const EXPORT_COLUMNS = [
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

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [motorizados, setMotorizados] = useState<Motorizado[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [activeTab, setActiveTab ] = useState<"dashboard" | "tickets" | "fleet" | "reports">("tickets");
  
  // Custom columns configuration for main Tickets list export
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>(EXPORT_COLUMNS);
  const [showExportFieldsConfig, setShowExportFieldsConfig] = useState(false);

  // Estados del escáner / editor
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [originalImageInModal, setOriginalImageInModal] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formulario Editable
  const [formValues, setFormValues] = useState<Invoice>({
    issuer: "",
    date: "",
    invoiceNumber: "",
    total: 0,
    tax: 0,
    paymentMethod: "",
    items: [],
    imageUrl: "",
    userId: "",
    createdAt: ""
  });

  // Estado para el listado global de incidentes de motorizados
  const [incidents, setIncidents] = useState<VehicleIncident[]>(() => {
    const local = localStorage.getItem("motorizados_incidents_v2");
    return local ? JSON.parse(local) : [];
  });

  const saveIncidents = (list: VehicleIncident[]) => {
    setIncidents(list);
    localStorage.setItem("motorizados_incidents_v2", JSON.stringify(list));
  };

  // State para modal de confirmación customizado
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "warning";
  } | null>(null);

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, variant: "danger" | "warning" = "danger") => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState(null);
      },
      variant
    });
  };

  // Local Storage Helpers
  const getLocalInvoices = (): Invoice[] => {
    const data = localStorage.getItem("thermal_invoices_local_v2");
    return data ? JSON.parse(data) : [];
  };

  const saveLocalInvoices = (list: Invoice[]) => {
    localStorage.setItem("thermal_invoices_local_v2", JSON.stringify(list));
    setInvoices(list);
  };

  const getLocalMotorizados = (): Motorizado[] => {
    const data = localStorage.getItem("thermal_motorizados_local_v2");
    return data ? JSON.parse(data) : [];
  };

  const saveLocalMotorizados = (list: Motorizado[]) => {
    localStorage.setItem("thermal_motorizados_local_v2", JSON.stringify(list));
    setMotorizados(list);
  };

  // Real-time synchronization
  useEffect(() => {
    let unsubscribeInvoices = () => {};
    let unsubscribeMotorizados = () => {};

    if (isFirebaseConfigured && auth) {
      const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        if (user) {
          setLoadingList(true);
          // Invoices Snapshot (no query orderBy to avoid requiring composite indexes)
          const qInv = query(
            collection(db, "invoices"),
            where("userId", "==", user.uid)
          );
          unsubscribeInvoices = onSnapshot(
            qInv,
            (snapshot) => {
              const list: Invoice[] = [];
              snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() } as Invoice);
              });
              // Sort client-side to ensure index is not required
              list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
              setInvoices(list);
              setLoadingList(false);
            },
            (error) => {
              console.error("Error en real-time listening invoices:", error);
              setLoadingList(false);
              try {
                handleFirestoreError(error, OperationType.LIST, "invoices");
              } catch (err) {
                console.error("Error estructurado de reglas detectado:", err);
              }
            }
          );

          // Motorizados Snapshot (no query orderBy to avoid requiring composite indexes)
          const qMot = query(
            collection(db, "motorizados"),
            where("userId", "==", user.uid)
          );
          unsubscribeMotorizados = onSnapshot(
            qMot,
            (snapshot) => {
              const list: Motorizado[] = [];
              snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() } as Motorizado);
              });
              // Sort client-side to ensure index is not required
              list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
              setMotorizados(list);
            },
            (error) => {
              console.error("Error en real-time listening motorizados:", error);
              try {
                handleFirestoreError(error, OperationType.LIST, "motorizados");
              } catch (err) {
                console.error("Error estructurado de reglas detectado:", err);
              }
            }
          );
        } else {
          // No user: fallback to local storage so that guest access remains active and doesn't load a blank slate!
          setInvoices(getLocalInvoices());
          setMotorizados(getLocalMotorizados());
          setLoadingList(false);
        }
      });
      return () => {
        unsubscribeAuth();
        unsubscribeInvoices();
        unsubscribeMotorizados();
      };
    } else {
      // Offline fallback: load from LocalStorage
      setInvoices(getLocalInvoices());
      setMotorizados(getLocalMotorizados());
    }
  }, []);

  // Login / Logout Flow
  const handleLogIn = async () => {
    if (!isFirebaseConfigured || !auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Error google connection:", err);
      alert("No se pudo iniciar sesión con Google. Intente nuevamente.");
    }
  };

  const handleLogOut = async () => {
    if (!isFirebaseConfigured || !auth) return;
    try {
      await signOut(auth);
      setCurrentUser(null);
      setInvoices(getLocalInvoices());
      setMotorizados(getLocalMotorizados());
    } catch (err: any) {
      console.error("Error logOut:", err);
    }
  };

  // Image Upload processor
  const processImageInput = async (imageUrl: string) => {
    try {
      setIsScanning(true);
      setScanError(null);
      setIsEditing(true);
      setSelectedInvoiceForView(null);

      const compressed = await compressImage(imageUrl, 850, 1100, 0.7);
      setActiveImage(compressed);

      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: compressed }),
      });

      if (!response.ok) {
        throw new Error("Problemas al invocar la API AI extractor.");
      }

      const parsedData = await response.json();
      setFormValues({
        issuer: parsedData.issuer || "AUTO CENTRO S.A.",
        date: parsedData.date || new Date().toISOString().split("T")[0],
        invoiceNumber: parsedData.invoiceNumber || "",
        total: Number(parsedData.total) || 0,
        tax: Number(parsedData.tax) || 0,
        paymentMethod: parsedData.paymentMethod || "Tarjeta de Crédito",
        items: Array.isArray(parsedData.items) ? parsedData.items : [],
        imageUrl: compressed,
        userId: currentUser?.uid || "guest",
        createdAt: new Date().toISOString(),

        // Campos Adicionales
        issuerRuc: parsedData.issuerRuc || "",
        issuerAddress: parsedData.issuerAddress || "",
        invoiceType: parsedData.invoiceType || "Comprobante Auxiliar de Factura Electrónica",
        serial: parsedData.serial || "",
        sucursal: parsedData.sucursal || "",
        ptoFact: parsedData.ptoFact || "",
        receiverName: parsedData.receiverName || "",
        receiverRuc: parsedData.receiverRuc || "",
        receiverType: parsedData.receiverType || "Consumidor final",
        subtotal: parsedData.subtotal || 0,
        itbms: parsedData.itbms || parsedData.tax || 0,
        accessKey: parsedData.accessKey || "",
        qrUrl: parsedData.qrUrl || "",
        seller: parsedData.seller || "VICTOR CRUZ",
        comments: parsedData.comments || "",
        motorizadoId: ""
      });

    } catch (err: any) {
      console.error("AI Reader error:", err);
      setScanError("No pudimos extraer todos los datos del ticket de forma asincrónica. Puedes rellenar los datos manualmente.");
      setFormValues({
        issuer: "",
        date: new Date().toISOString().split("T")[0],
        invoiceNumber: "",
        total: 0,
        tax: 0,
        paymentMethod: "Efectivo",
        items: [],
        imageUrl: imageUrl,
        userId: currentUser?.uid || "guest",
        createdAt: new Date().toISOString()
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Drag and Drop Controllers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          processImageInput(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          processImageInput(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadDemoManual = () => {
    setActiveImage(DEMO_IMAGE_BASE64);
    setIsEditing(true);
    setSelectedInvoiceForView(null);
    setFormValues({ ...DEMO_EXTRACTION_MOCK });
  };

  // CRUD Invoices
  const handleSaveInvoice = async () => {
    if (!formValues.issuer.trim()) {
      triggerConfirm("🚫 Campo Requerido", "El nombre del establecimiento / emisor es obligatorio.", () => {}, "warning");
      return;
    }
    if (!formValues.invoiceType || formValues.invoiceType.trim() === "") {
      triggerConfirm(
        "🚫 Tipo de Factura Obligatoria", 
        "Por favor elija el tipo de factura correspondiente: CALL CENTER, SUCURSAL, FLOTA, GERENTE DE LINEA, u OMITIDO.", 
        () => {}, 
        "warning"
      );
      return;
    }
    if (!formValues.motorizadoId || formValues.motorizadoId.trim() === "") {
      triggerConfirm(
        "🚫 Motorizado Requerido", 
        "Debe asociar la factura de flete a un chofer o motorizado de la flota.", 
        () => {}, 
        "warning"
      );
      return;
    }

    const payload: Invoice = {
      ...formValues,
      userId: currentUser?.uid || "guest",
      createdAt: formValues.id ? invoices.find(i => i.id === formValues.id)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    setLoadingList(true);
    try {
      if (isFirebaseConfigured && db && currentUser) {
        if (formValues.id && !formValues.id.startsWith("loc_")) {
          const docRef = doc(db, "invoices", formValues.id);
          const { id, ...cleanData } = payload;
          await updateDoc(docRef, cleanData);
        } else {
          // If it doesn't have an ID, or the ID is a temporary local ID ("loc_..."), we add it as a new document
          const { id, ...cleanData } = payload;
          await addDoc(collection(db, "invoices"), cleanData);
        }
      } else {
        const local = getLocalInvoices();
        if (formValues.id) {
          const updated = local.map(i => i.id === formValues.id ? { ...payload, id: formValues.id } : i);
          saveLocalInvoices(updated);
        } else {
          payload.id = "loc_" + Date.now();
          saveLocalInvoices([payload, ...local]);
        }
      }
      setIsEditing(false);
      setActiveImage(null);
    } catch (err: any) {
      console.error("Error al guardar ticket:", err);
      try {
        handleFirestoreError(err, formValues.id ? OperationType.UPDATE : OperationType.CREATE, `invoices/${formValues.id || 'new'}`);
      } catch (structuredErr: any) {
        console.error("Firestore Structured Error:", structuredErr);
      }
      alert("Error al guardar ticket: " + err.message);
    } finally {
      setLoadingList(false);
    }
  };

  const handleDeleteInvoice = (id: string) => {
    triggerConfirm(
      "📄 ¿Eliminar copia de flete?",
      "Esta operación borrará permanentemente este registro del historial. Esta acción es irreversible.",
      async () => {
        try {
          if (isFirebaseConfigured && db && currentUser) {
            await deleteDoc(doc(db, "invoices", id));
          } else {
            const local = getLocalInvoices();
            saveLocalInvoices(local.filter(i => i.id !== id));
          }
          setSelectedInvoiceForView(null);
        } catch (err: any) {
          console.error("Error al eliminar ticket:", err);
          try {
            handleFirestoreError(err, OperationType.DELETE, `invoices/${id}`);
          } catch (structuredErr) {
            console.error("Firestore Structured Error:", structuredErr);
          }
        }
      }
    );
  };

  // CRUD Motorizados
  const handleSaveMotorizado = async (motData: Omit<Motorizado, "userId" | "createdAt">, editId?: string) => {
    const payload: Motorizado = {
      ...motData,
      userId: currentUser?.uid || "guest",
      createdAt: new Date().toISOString()
    };

    try {
      if (isFirebaseConfigured && db && currentUser) {
        if (editId && !editId.startsWith("mot_")) {
          const docRef = doc(db, "motorizados", editId);
          await updateDoc(docRef, { ...motData });
        } else {
          await addDoc(collection(db, "motorizados"), payload);
        }
      } else {
        const local = getLocalMotorizados();
        if (editId) {
          const updated = local.map(m => m.id === editId ? { ...payload, id: editId } : m);
          saveLocalMotorizados(updated);
        } else {
          payload.id = "mot_" + Date.now();
          saveLocalMotorizados([payload, ...local]);
        }
      }
    } catch (err: any) {
      console.error("Error al guardar motorizado:", err);
      try {
        handleFirestoreError(err, editId ? OperationType.UPDATE : OperationType.CREATE, `motorizados/${editId || 'new'}`);
      } catch (structuredErr) {
        console.error("Firestore Structured Error:", structuredErr);
      }
    }
  };

  const handleDeleteMotorizado = async (id: string) => {
    if (invoices.some(i => i.motorizadoId === id)) {
      triggerConfirm(
        "🚫 No es posible eliminar",
        "Este motorizado tiene facturas de flete asociadas en el sistema. Desvincúlelo primero de cada factura antes de eliminarlo.",
        () => {},
        "warning"
      );
      return;
    }

    triggerConfirm(
      "🛵 ¿Desvincular conductor?",
      "¿Está seguro de que desea eliminar permanentemente este registro de motorizado? No se podrán recuperar sus datos de contacto.",
      async () => {
        try {
          if (isFirebaseConfigured && db && currentUser) {
            await deleteDoc(doc(db, "motorizados", id));
          } else {
            const local = getLocalMotorizados();
            saveLocalMotorizados(local.filter(m => m.id !== id));
          }
        } catch (err: any) {
          console.error(err);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#010c1f] via-[#020d20] to-[#000810] flex flex-col font-sans text-slate-100">
      
      {/* BARRA ASIDE DE OPERACIONES (Sidemenu Modular) */}
      <div className="flex flex-col md:flex-row min-h-screen">
        
        {/* SIDEBAR ADAPTATIVO PREMIUM (Con estilo Glass Azul Marino y Negro) */}
        <aside className="w-full md:w-64 bg-slate-950/50 backdrop-blur-lg text-white flex flex-col shrink-0 border-b border-white/5 md:border-r md:border-b-0 shadow-2xl relative z-10">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="p-1.5 bg-blue-900/200/10 rounded-xl flex items-center justify-center shadow-inner shrink-0 border border-white/10">
              <LogoSVG className="h-10 w-10 text-[#FFB300] drop-shadow-[0_2px_8px_rgba(255,179,0,0.55)] shrink-0" />
            </div>
            <div>
              <h1 className="text-sm font-display font-black tracking-tight text-white leading-none">MotoAssist Vial</h1>
              <p className="text-[9px] text-blue-400 font-extrabold uppercase tracking-widest mt-1.5 leading-none">Monitoreo Vial Activo</p>
            </div>
          </div>

          <nav className="flex-row md:flex-col md:flex-grow p-4 gap-1.5 pt-6 flex overflow-x-auto md:overflow-x-visible scrollbar-none shrink-0 md:space-y-1.5">
            
            {/* Tab Tickets */}
            <button
              onClick={() => { setActiveTab("tickets"); setSelectedInvoiceForView(null); setIsEditing(false); }}
              className={`flex items-center gap-2.5 px-4 py-2.5 sm:py-3 rounded-xl text-xs font-black whitespace-nowrap transition duration-200 cursor-pointer shrink-0 ${
                activeTab === "tickets" 
                  ? "bg-blue-600/35 text-white shadow-lg shadow-blue-500/15 scale-[1.02] border border-blue-500/40" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white font-bold"
              }`}
            >
              <Receipt className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "tickets" ? "text-blue-450" : "text-slate-400"}`} />
              <span>Registro de Ventas</span>
            </button>

            {/* Tab Fleet */}
            <button
              onClick={() => { setActiveTab("fleet"); setSelectedInvoiceForView(null); setIsEditing(false); }}
              className={`flex items-center gap-2.5 px-4 py-2.5 sm:py-3 rounded-xl text-xs font-black whitespace-nowrap transition duration-200 cursor-pointer shrink-0 ${
                activeTab === "fleet" 
                  ? "bg-blue-600/35 text-white shadow-lg shadow-blue-500/15 scale-[1.02] border border-blue-500/40" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white font-bold"
              }`}
            >
              <Users className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "fleet" ? "text-blue-450" : "text-slate-400"}`} />
              <span>Flota Motorizados</span>
            </button>

            {/* Tab Reports */}
            <button
              onClick={() => { setActiveTab("reports"); setSelectedInvoiceForView(null); setIsEditing(false); }}
              className={`flex items-center gap-2.5 px-4 py-2.5 sm:py-3 rounded-xl text-xs font-black whitespace-nowrap transition duration-200 cursor-pointer shrink-0 ${
                activeTab === "reports" 
                  ? "bg-blue-600/35 text-white shadow-lg shadow-blue-500/15 scale-[1.02] border border-blue-500/40" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white font-bold"
              }`}
            >
              <Filter className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "reports" ? "text-blue-450" : "text-slate-400"}`} />
              <span>Reportes & Filtros</span>
            </button>

            {/* Tab Dashboard */}
            <button
              onClick={() => { setActiveTab("dashboard"); setSelectedInvoiceForView(null); setIsEditing(false); }}
              className={`flex items-center gap-2.5 px-4 py-2.5 sm:py-3 rounded-xl text-xs font-black whitespace-nowrap transition duration-200 cursor-pointer shrink-0 ${
                activeTab === "dashboard" 
                  ? "bg-blue-600/35 text-white shadow-lg shadow-blue-500/15 scale-[1.02] border border-blue-500/40" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white font-bold"
              }`}
            >
              <BarChart3 className={`h-4 w-4 shrink-0 transition-colors ${activeTab === "dashboard" ? "text-blue-450" : "text-slate-400"}`} />
              <span>Dashboard General</span>
            </button>
          </nav>

          {/* SESIÓN USUARIO PIE */}
          <div className="p-4 border-t border-white/5 bg-slate-950/70 text-blue-200 hidden md:block">
            {isFirebaseConfigured ? (
              currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-350 flex items-center justify-center border border-blue-500/30 font-black text-xs shadow-md shrink-0">
                      {currentUser.displayName ? currentUser.displayName[0] : "U"}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-black text-white truncate">{currentUser.displayName || currentUser.email}</p>
                      <p className="text-[8px] text-emerald-400 uppercase font-black tracking-wide">Firebase Conectado</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogOut}
                    className="w-full py-2 bg-rose-600/80 hover:bg-rose-700 text-[10px] font-black uppercase rounded-xl text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <LogOut className="h-3 w-3" />
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="text-center p-2.5 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-[9.5px] font-bold text-slate-300 uppercase tracking-widest pl-0.5">Base de Datos Activa</p>
                </div>
              )
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-extrabold text-[9px] uppercase leading-none">Cache Offline</p>
                  <p className="text-[8px] text-blue-200 mt-1">Sincronizado localmente</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CONTAINER CONTENIDO PRINCIPAL */}
        <main className="flex-grow flex flex-col min-h-screen">
          
          <header className="bg-slate-900/50 backdrop-blur-lg text-white shadow-2xl px-6 py-5 md:px-8 rounded-2xl mb-6 mx-0 sm:mx-4 mt-0 sm:mt-2 border border-white/5">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-white flex items-center gap-2">
                  <span>
                    {activeTab === "tickets" && "⚡ Asistencia Vial & Registro de Ventas"}
                    {activeTab === "fleet" && "📋 Flota de Motorizados"}
                    {activeTab === "reports" && "📊 Reportes & Exportación"}
                    {activeTab === "dashboard" && "⚡ Panel de Monitoreo Vial"}
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  {activeTab === "tickets" && "Almacena copia de ventas de asistencia e instala tus reportes en tiempo real"}
                  {activeTab === "fleet" && "Control de choferes, matrículas, fletes, KPI por motorizado e incidentes de motocicleta"}
                  {activeTab === "reports" && "Filtros inteligentes de impuestos y descargas personalizadas Excel/CSV"}
                  {activeTab === "dashboard" && "Inspección de KPI por sucursal, incidentes activos de motos y flujo temporal"}
                </p>
              </div>

              {(isEditing || selectedInvoiceForView) && activeTab === "tickets" && (
                <button
                  onClick={() => { setIsEditing(false); setSelectedInvoiceForView(null); }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-black transition border border-white/10 cursor-pointer self-start backdrop-blur-xs shadow-xs"
                >
                  Regresar a la Entrada
                </button>
              )}
            </div>
          </header>

          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
            
            {/* VIEW MODULES */}
            {activeTab === "dashboard" && (
              <DashboardView invoices={invoices} motorizados={motorizados} incidents={incidents} />
            )}

            {activeTab === "fleet" && (
              <MotorizadosView 
                motorizados={motorizados} 
                invoices={invoices} 
                onSave={handleSaveMotorizado} 
                onDelete={handleDeleteMotorizado}
                incidents={incidents}
                onSaveIncidents={saveIncidents}
                triggerConfirm={triggerConfirm}
              />
            )}

            {activeTab === "reports" && (
              <ReportsView invoices={invoices} motorizados={motorizados} />
            )}

            {activeTab === "tickets" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* COL IZQUIERDA: FORM O AREA DE CARGA */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {isEditing ? (
                    <TicketEditForm
                      formValues={formValues}
                      setFormValues={setFormValues}
                      motorizados={motorizados}
                      onSave={handleSaveInvoice}
                      onCancel={() => { setIsEditing(false); setActiveImage(null); }}
                      isScanning={isScanning}
                      scanError={scanError}
                      activeImage={activeImage}
                    />
                  ) : selectedInvoiceForView ? (
                    <TicketDetailView
                      invoice={selectedInvoiceForView}
                      motorizados={motorizados}
                      onClose={() => setSelectedInvoiceForView(null)}
                      onEdit={() => {
                        setFormValues({ ...selectedInvoiceForView });
                        setIsEditing(true);
                        setSelectedInvoiceForView(null);
                      }}
                      onDelete={handleDeleteInvoice}
                    />
                  ) : (
                    /* SCANNER ZONE INPUT */
                    <div className="glass-card rounded-xl p-6 md:p-8 space-y-6">
                      <div className="text-center max-w-sm mx-auto space-y-2">
                        <span className="px-3 py-1.5 text-[9px] font-bold text-blue-700 bg-blue-900/20 rounded-full border border-blue-700/30 uppercase tracking-wide">
                          Registro de Ventas IA
                        </span>
                        <h3 className="text-base font-black text-slate-100 pt-1">Cargar Copia de Venta Instalada</h3>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                          Arrastra la factura instalada por el motorizado, selecciona una foto o activa la cámara web para procesar la copia con Gemini IA y guardarla en tiempo real.
                        </p>
                      </div>

                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition duration-200 flex flex-col items-center justify-center min-h-[220px] ${
                          dragOver 
                            ? "border-blue-500 bg-blue-900/20/20" 
                            : "border-blue-700/40 bg-blue-900/10 hover:bg-blue-900/20"
                        }`}
                      >
                        <input 
                          type="file" 
                          accept="image/*" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden" 
                        />
                        
                        <div className="rounded-full bg-blue-900/30 p-3.5 border border-blue-700/40 text-blue-400 mb-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="h-6 w-6" />
                        </div>
                        
                        <p className="text-xs font-bold text-slate-200">Arrastra tu ticket térmico aquí</p>
                        <p className="text-[10px] text-slate-400 mt-1 mb-5">JPEG, PNG, WEBP Soportados</p>
                        
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-1.8 glass-panel border border-blue-900/30 text-slate-300 hover:border-blue-700/40 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Seleccionar Archivo
                          </button>
                          
                          <button
                            onClick={() => setShowCamera(true)}
                            className="flex items-center gap-1.5 px-4 py-1.8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                          >
                            <Camera className="h-3.5 w-3.5" />
                            Usar Cámara
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* COL DERECHA: BIBLIOTECA LISTA */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {invoices.length > 0 && (
                    <div className="glass-card rounded-xl p-4.5 space-y-3">
                      <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-0.5">Resumen de Periodo</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Monto Gasto</span>
                          <span className="text-base font-black font-mono text-slate-100 block mt-1">
                            ${invoices.reduce((a, b) => a + (b.total || 0), 0).toLocaleString("es-PA", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-blue-900/25">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Comprobantes</span>
                          <span className="text-base font-black font-mono text-slate-100 block mt-1">
                            {invoices.length} un.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="glass-card rounded-xl p-4.5 space-y-4">
                    <div className="flex flex-col gap-2 border-b border-blue-900/30 pb-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm">Biblioteca de Tickets</h3>
                          <p className="text-[10px] text-slate-400">Total registrados ({invoices.length})</p>
                        </div>

                        {invoices.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setShowExportFieldsConfig(!showExportFieldsConfig)}
                              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                                showExportFieldsConfig ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                              }`}
                              title="Editar Campos a Exportar"
                            >
                              <span>⚙️</span>
                              <span className="hidden sm:inline">Columnas</span>
                            </button>
                            <button
                              onClick={() => exportInvoicesToCSV(invoices, motorizados, selectedExportFields)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                              title="Exportar Excel"
                            >
                              <FileDown className="h-3.5 w-3.5" />
                              <span>Descargar Todo</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {showExportFieldsConfig && invoices.length > 0 && (
                        <div className="mt-3 p-3 glass-panel rounded-lg border border-blue-900/30 space-y-2 animate-fade-in">
                          <p className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Configurar Columnas de Exportación ({selectedExportFields.length} seleccionadas)</p>
                          <div className="flex flex-wrap gap-1.5 pb-2">
                            <button
                              type="button"
                              onClick={() => setSelectedExportFields(EXPORT_COLUMNS)}
                              className="px-2 py-0.5 glass-panel border border-blue-900/30 hover:border-blue-700/40 text-[8.5px] font-bold text-slate-400 rounded"
                            >
                              Todo
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedExportFields(["Establecimiento", "Tipo Factura", "Nº Ticket/Factura", "Asignado a (Motorizado)", "Total Ticket", "Fecha Emisión"])}
                              className="px-2 py-0.5 glass-panel border border-blue-900/30 hover:border-blue-700/40 text-[8.5px] font-bold text-slate-400 rounded"
                            >
                              Básico
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedExportFields([])}
                              className="px-2 py-0.5 glass-panel border border-blue-900/30 hover:border-blue-700/40 text-[8.5px] font-bold text-slate-400 rounded"
                            >
                              Limpiar
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                            {EXPORT_COLUMNS.map(col => {
                              const isSel = selectedExportFields.includes(col);
                              return (
                                <label
                                  key={col}
                                  className={`flex items-center gap-1.5 p-1.5 text-[9.5px] rounded border cursor-pointer select-none transition ${
                                    isSel ? "bg-blue-900/25 text-blue-300 border-blue-700/40 font-bold" : "glass-panel border-blue-900/25 text-slate-400"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSel}
                                    onChange={() => {
                                      if (isSel) {
                                        setSelectedExportFields(selectedExportFields.filter(f => f !== col));
                                      } else {
                                        setSelectedExportFields([...selectedExportFields, col]);
                                      }
                                    }}
                                    className="rounded text-blue-600 focus:ring-0 scale-75"
                                  />
                                  <span className="truncate">{col}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {loadingList ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-2">
                        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                        <p className="text-[10px] text-slate-400 font-bold">Actualizando con Firestore real-time...</p>
                      </div>
                    ) : invoices.length === 0 ? (
                      <div className="text-center py-10 px-4 space-y-3">
                        <div className="rounded-full bg-slate-50 border p-3 w-10 h-10 flex items-center justify-center mx-auto text-slate-400">
                          <Receipt className="h-5 w-5" />
                        </div>
                        <div className="max-w-xs mx-auto space-y-1">
                          <p className="text-xs font-bold text-slate-200">Sin copias registradas</p>
                          <p className="text-[10.5px] text-slate-400 leading-normal font-semibold">
                            Toma una captura o sube la factura de ventas instaladas por los motorizados para sincronizarlas en tu panel.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                        {invoices.map((inv) => {
                          const isSelected = selectedInvoiceForView?.id === inv.id;
                          return (
                            <div 
                              key={inv.id}
                              onClick={() => setSelectedInvoiceForView(inv)}
                              className={`p-3 rounded-lg border transition duration-150 cursor-pointer flex items-center justify-between gap-3 text-left ${
                                isSelected 
                                  ? "bg-blue-900/20 border-blue-200 shadow-xxs" 
                                  : "glass-card border-blue-900/30 hover:border-blue-700/40"
                              }`}
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`rounded-lg p-2 ${
                                  isSelected ? "bg-blue-900/40 text-blue-300" : "bg-slate-50 text-slate-500 border border-blue-900/25"
                                }`}>
                                  <FileText className="h-4 w-4" />
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-xs font-black text-slate-100 truncate" title={inv.issuer}>{inv.issuer}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5 font-bold space-x-1">
                                    <span>{inv.date}</span>
                                    <span>•</span>
                                    <span>#{inv.invoiceNumber}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right">
                                  <p className="text-xs font-bold font-mono text-white">${(inv.total || 0).toFixed(2)}</p>
                                  {inv.motorizadoId ? (
                                    <span className="text-[8px] bg-blue-900/20 text-blue-600 font-bold px-1 rounded block mt-0.5 uppercase">flota</span>
                                  ) : (
                                    <span className="text-[8px] text-slate-400 font-bold block mt-0.5">S/Chofer</span>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (inv.imageUrl) {
                                      setOriginalImageInModal(inv.imageUrl);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-blue-600 transition"
                                  title="Ver Factura Original"
                                  disabled={!inv.imageUrl}
                                >
                                  <FolderOpen className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (inv.id) handleDeleteInvoice(inv.id); }}
                                  className="p-1 text-slate-300 hover:text-red-550 transition"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>

        </main>

      </div>

      {showCamera && (
        <CameraCapture 
          onCapture={(base64) => { setShowCamera(false); processImageInput(base64); }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {originalImageInModal && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setOriginalImageInModal(null)}
        >
          <div 
            className="glass-card rounded-xl max-w-xl w-full p-4 space-y-4 shadow-xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen className="h-4.5 w-4.5 text-blue-600" />
                <span>Factura Original Registrada</span>
              </h3>
              <button 
                onClick={() => setOriginalImageInModal(null)}
                className="p-1 text-slate-400 hover:text-slate-400 font-bold"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-center max-h-[70vh] overflow-y-auto glass-panel rounded-lg p-2">
              <img 
                src={originalImageInModal} 
                alt="Factura Original" 
                className="max-h-[60vh] object-contain rounded-lg shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-right">
              <button
                onClick={() => setOriginalImageInModal(null)}
                className="px-4 py-2 glass-panel hover:border-blue-700/40 text-slate-300 text-xs font-bold rounded-lg transition"
              >
                Cerrar Imagen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN CUSTOM */}
      {confirmState?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in" id="custom-confirm-modal">
          <div className="glass-card rounded-xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-full ${confirmState.variant === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-white text-sm">{confirmState.title}</h3>
            </div>
            <p className="text-slate-650 text-xs font-semibold leading-normal">
              {confirmState.message}
            </p>
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setConfirmState(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmState.onConfirm}
                className={`px-4 py-2 text-xs font-black text-white rounded-lg transition ${
                  confirmState.variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
