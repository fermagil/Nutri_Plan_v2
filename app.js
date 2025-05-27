// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyChC7s5NN-z-dSjqeXDaks7gaNaVCJAu7Q",
    authDomain: "nutriplanv2.firebaseapp.com",
    projectId: "nutriplanv2",
    storageBucket: "nutriplanv2.firebasestorage.app",
    messagingSenderId: "653707489758",
    appId: "1:653707489758:web:9133d1d1620825c385ed4f",
    measurementId: "G-NWER69E8B6"
};

// Initialize Firebase
let app;
try {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization failed:', error);
}

// Initialize Firestore, Auth, and Provider
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Debug Chart.js and plugin loading
console.log('Checking Chart.js:', typeof Chart);
console.log('Checking ChartDataLabels:', typeof ChartDataLabels);
console.log('Checking ChartAnnotation:', typeof ChartAnnotation);

// Register Chart.js plugins
if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined' && typeof ChartAnnotation !== 'undefined') {
    Chart.register(ChartDataLabels, ChartAnnotation);
    console.log('Chart.js plugins registered successfully');
} else {
    console.error('Chart.js, ChartDataLabels, or ChartAnnotation not loaded. Check CDN scripts in HTML.');
}



// Exportar instancias para uso en otros módulos
export { app, db, auth, provider };

 // Logout
     export async function logout() {
            auth.signOut().then(function() {
                console.log('Sesión cerrada');
                window.location.href = 'https://fermagil.github.io/Nutri_Plan_v2/index.html';
            }).catch(function(error) {
                console.error('Error al cerrar sesión:', error.code, error.message);
                var main = document.querySelector('main');
                var errorDiv = document.createElement('div');
                errorDiv.style.color = 'red';
                errorDiv.style.marginBottom = '10px';
                errorDiv.style.fontSize = '14px';
                errorDiv.textContent = 'Error al cerrar sesión: ' + error.message;
                main.insertBefore(errorDiv, main.firstChild);
                setTimeout(function() { errorDiv.remove(); }, 5000);
            });
        }

        // Initialize UI
        function initializeUI() {
            document.getElementById('logo').addEventListener('click', function(event) {
                event.preventDefault();
                var dropdown = document.getElementById('dropdown');
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            });
    // Close dropdown if clicking outside
            document.addEventListener('click', function(event) {
                var dropdown = document.getElementById('dropdown');
                var logo = document.getElementById('logo');
                if (!logo.contains(event.target) && !dropdown.contains(event.target)) {
                    dropdown.style.display = 'none';
                }
            });
                                    
                    // Initialize Ver Progreso button
                    const verProgresoBtn = document.getElementById('ver-progreso-btn');
                    if (verProgresoBtn) {
                        verProgresoBtn.style.display = 'none'; // Hide initially
                        verProgresoBtn.addEventListener('click', async () => {
                            if (currentClienteId) {
                                await showProgressCharts(currentClienteId);
                            } else {
                                alert('Por favor, selecciona un cliente primero.');
                            }
                        });
                    } else {
                        console.error('Botón Ver Progreso no encontrado en el DOM durante inicialización');
                    }
                
                    window.logout = logout;
                }

        // Handle auth state
        auth.onAuthStateChanged(function(user) {
            var dropdown = document.getElementById('dropdown');
            if (user) {
                console.log('Auth state: User signed in', user.displayName, user.email);
                if (dropdown) dropdown.style.display = 'none'; // Initially hidden, shown on logo click
            } else {
                console.log('Auth state: No user signed in');
                window.location.href = 'https://fermagil.github.io/Nutri_Plan_v2/index.html';
            }
        });



// Referencias al formulario y elementos
const form = document.getElementById('anthropometry-form');
const buscarClienteInput = document.getElementById('buscar_cliente');
const nuevoClienteBtn = document.getElementById('nuevo_cliente');
const seleccionarFecha = document.getElementById('seleccionar_fecha');
const guardarDatosBtn = document.getElementById('guardar_datos');
let currentClienteId = null;
let currentUser = null;

// Lista de elementos de resultados
const resultElementIds = [
    'result-imc',
    'imc-source',
    'result-icc',
    'icc-source',
    'result-grasa-pct-actual',
    'grasa-pct-actual-source',
    'result-grasa-pct-metabolic',
    'grasa-pct-metabolic-source',
    'result-grasa-pct-deseado',
    'grasa-pct-deseado-source',
    'result-grasa-pct-Deurenberg',
    'grasa-pct-Deurenberg-source',
    'result-grasa-pct-CUN-BAE',
    'grasa-pct-CUN-BAE-source',
    'result-masa-grasa-actual',
    'masa-grasa-actual-source',
    'result-masa-grasa-metabolic',
    'masa-grasa-metabolic-source',
    'result-masa-magra-actual',
    'masa-magra-actual-source',
    'result-masa-magra-metabolic',
    'masa-magra-metabolic-source',
    'result-imlg-actual',
    'imlg-actual-source',
    'result-imlg-metabolic',
    'imlg-metabolic-source',
    'result-img-actual',
    'img-actual-source',
    'result-img-metabolic',
    'img-metabolic-source',
    'result-tipologia-actual',
    'tipologia-actual-source',
    'result-tipologia-metabolic',
    'tipologia-metabolic-source',
    'result-tmb',
    'tmb-source',
    'result-edadmetabolica',
    'edadmetabolica-source',
    'result-somatotipo',
    'somatotipo-source',
    'result-amb',
    'amb-source',
    'result-ambc',
    'ambc-source',
    'result-mmt',
    'mmt-source',
    'result-mmt2',
    'mmt2-source',
    'result-Pct-mmt',
    'Pct-mmt-source',
    'result-Pct-mmt2',
    'Pct-mmt2-source',
    'result-masa-osea',
    'masa-osea-source',
    'result-masa-residual',
    'masa-residual-source',
    'result-peso-ideal',
    'peso-ideal-source',
    'result-peso-objetivo',
    'peso-objetivo-source',
    'result-peso-muscular',
    'peso-muscular-source',
    'result-agua-corporal',
    'agua-corporal-source'
];

// Crear select para resultados de búsqueda
let clientesResultados = document.getElementById('clientes_resultados');
if (!clientesResultados) {
    clientesResultados = document.createElement('select');
    clientesResultados.id = 'clientes_resultados';
    buscarClienteInput.insertAdjacentElement('afterend', clientesResultados);
}

// Función para normalizar texto (eliminar acentos y caracteres especiales)
const normalizeText = (text) => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
};

// Función para convertir cadenas numéricas a números
const toNumber = (value) => {
    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
        return parseFloat(value);
    }
    return value;
};


// Manejar estado de autenticación
// Handle auth state
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const verProgresoBtn = document.getElementById('ver-progreso-btn');
    if (user) {
        console.log('Auth state: User signed in', user.displayName, user.email);
        if (verProgresoBtn) {
            verProgresoBtn.style.display = currentClienteId ? 'inline-block' : 'none';
        } else {
            console.error('Botón Ver Progreso no encontrado en el DOM durante auth change');
        }
    } else {
        console.log('Auth state: No user signed in');
        window.location.href = 'https://fermagil.github.io/Nutri_Plan_v2/index.html';
        if (verProgresoBtn) verProgresoBtn.style.display = 'none';
        clientesResultados.style.display = 'none';
        seleccionarFecha.innerHTML = '<option value="">Seleccionar fecha...</option>';
        currentClienteId = null;
    }
});




// Búsqueda de clientes
buscarClienteInput.addEventListener('input', async () => {
    if (!currentUser) {
        console.log('No user authenticated, skipping search');
        return;
    }
    const searchTerm = normalizeText(buscarClienteInput.value);
    console.log('Normalized search term:', searchTerm);
    clientesResultados.innerHTML = '<option value="">Seleccionar cliente...</option>';
    if (searchTerm.length < 2) {
        seleccionarFecha.innerHTML = '<option value="">Seleccionar fecha...</option>';
        clientesResultados.style.display = 'none';
        console.log('Search term too short (< 2), hiding resultados');
        return;
    }
    clientesResultados.style.display = 'block';
    console.log('Executing Firestore query for clientes');
    const q = query(collection(db, 'clientes'), 
        where('nombreLowercase', '>=', searchTerm), 
        where('nombreLowercase', '<=', searchTerm + '\uf8ff'));
    try {
        const querySnapshot = await getDocs(q);
        console.log('Query snapshot size:', querySnapshot.size);
        querySnapshot.forEach(doc => {
            const data = doc.data();
            console.log('Found client:', doc.id, data.nombre, 'nombreLowercase:', data.nombreLowercase);
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = data.nombre;
            clientesResultados.appendChild(option);
        });
        if (querySnapshot.empty) {
            console.log('No clients found for search term:', searchTerm);
            clientesResultados.innerHTML = '<option value="">No se encontraron clientes...</option>';
        }
    } catch (error) {
        console.error('Error fetching clients:', error.code, error.message);
        alert('Error al buscar clientes: ' + error.message);
    }
});

// Cargar fechas de tomas al seleccionar un cliente
clientesResultados.addEventListener('change', async () => {
    const clienteId = clientesResultados.value;
    console.log('Cliente seleccionado:', clienteId);
    const verProgresoBtn = document.getElementById('ver-progreso-btn');
    if (!verProgresoBtn) {
        console.error('Botón Ver Progreso no encontrado en el DOM');
        return;
    }
    if (clienteId) {
        currentClienteId = clienteId;
        verProgresoBtn.style.display = 'inline-block'; // Show button
        await cargarFechasTomas(clienteId);
    } else {
        console.log('No cliente seleccionado, limpiando fechas');
        currentClienteId = null;
        verProgresoBtn.style.display = 'none'; // Hide button
        seleccionarFecha.innerHTML = '<option value="">Seleccionar fecha...</option>';
    }
});

// Cargar datos de la toma seleccionada
seleccionarFecha.addEventListener('change', async () => {
    const tomaId = seleccionarFecha.value;
    console.log('Toma seleccionada:', tomaId);
    if (tomaId && currentClienteId) {
        await cargarDatosToma(currentClienteId, tomaId);
    } else {
        console.log('No toma seleccionada o no clienteId, limpiando formulario');
        form.reset();
    }
});

// Limpiar y ocultar secciones para nuevo cliente
nuevoClienteBtn.addEventListener('click', () => {
    console.log('Nuevo Cliente clicked');
    currentClienteId = null;
    form.reset();
    buscarClienteInput.value = '';
    clientesResultados.innerHTML = '<option value="">Seleccionar cliente...</option>';
    clientesResultados.style.display = 'none';
    seleccionarFecha.innerHTML = '<option value="">Seleccionar fecha...</option>';
    guardarDatosBtn.style.display = 'none';
    // Limpiar sección de resultados
    resultElementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '---';
    });
    // Ocultar sección de explicación
    const explanationSection = document.getElementById('explanation-section');
    if (explanationSection) {
        explanationSection.style.display = 'none';
        console.log('Explanation section hidden');
    }
    // Limpiar gráficos
    ['somatotype-point-canvas', 'typology-chart', 'weight-chart'].forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });
});

// Guardar datos
guardarDatosBtn.addEventListener('click', async () => {
    if (!currentUser) {
        alert('Por favor, inicia sesión para guardar datos.');
        return;
    }
    const nombre = document.getElementById('nombre').value.trim();
    const peso = document.getElementById('peso').value;
    const altura = document.getElementById('altura').value;
    if (!nombre) {
        alert('Por favor, ingrese el nombre del cliente.');
        return;
    }
    if (!peso || isNaN(peso) || peso <= 0) {
        alert('Por favor, ingrese un peso válido.');
        return;
    }
    if (!altura || isNaN(altura) || altura <= 0) {
        alert('Por favor, ingrese una altura válida.');
        return;
    }
    const data = {
        nombre,
        genero: document.getElementById('genero').value || null,
        fecha: document.getElementById('fecha').value ? new Date(document.getElementById('fecha').value) : new Date(),
        edad: parseInt(document.getElementById('edad').value) || null,
        peso: parseFloat(peso),
        altura: parseFloat(altura),
        es_deportista: document.getElementById('es_deportista').value || null,
        grasa_actual_conocida: parseFloat(document.getElementById('grasa_actual_conocida').value) || null,
        grasa_deseada: parseFloat(document.getElementById('grasa_deseada').value) || null,
        medidas: {
            pliegues: {
                tricipital: parseFloat(document.getElementById('pliegue_tricipital').value) || null,
                subescapular: parseFloat(document.getElementById('pliegue_subescapular').value) || null,
                suprailiaco: parseFloat(document.getElementById('pliegue_suprailiaco').value) || null,
                bicipital: parseFloat(document.getElementById('pliegue_bicipital').value) || null,
                pantorrilla: parseFloat(document.getElementById('pliegue_pantorrilla').value) || null,
            },
            circunferencias: {
                cintura: parseFloat(document.getElementById('circ_cintura').value) || null,
                cadera: parseFloat(document.getElementById('circ_cadera').value) || null,
                cuello: parseFloat(document.getElementById('circ_cuello').value) || null,
                pantorrilla: parseFloat(document.getElementById('circ_pantorrilla').value) || null,
                brazo: parseFloat(document.getElementById('circ_brazo').value) || null,
                brazo_contraido: parseFloat(document.getElementById('circ_brazo_contraido').value) || null,
            },
            diametros: {
                humero: parseFloat(document.getElementById('diam_humero').value) || null,
                femur: parseFloat(document.getElementById('diam_femur').value) || null,
                muneca: parseFloat(document.getElementById('diam_muneca').value) || null,
            },
        },
        resultados: window.calculatedResults || {}
    };
    try {
        console.log('Datos a guardar:', JSON.stringify(data, null, 2));
        if (!currentClienteId) {
            const clienteRef = await addDoc(collection(db, 'clientes'), {
                nombre,
                nombreLowercase: normalizeText(nombre),
                genero: data.genero,
                fecha_creacion: new Date(),
                created_by: currentUser.uid,
            });
            currentClienteId = clienteRef.id;
            console.log('Cliente creado con ID:', currentClienteId);
        }
        const tomaRef = await addDoc(collection(db, `clientes/${currentClienteId}/tomas`), data);
        console.log('Documento guardado con ID:', tomaRef.id);
        alert('Datos guardados exitosamente.');
        await cargarFechasTomas(currentClienteId);
        guardarDatosBtn.style.display = 'none';
    } catch (error) {
        console.error('Error al guardar:', error);
        alert('Error al guardar los datos: ' + error.message);
    }
});

// Cargar fechas de tomas
async function cargarFechasTomas(clienteId) {
    if (!clienteId) {
        console.log('No clienteId provided, skipping cargarFechasTomas');
        return;
    }
    console.log('Loading tomas for clienteId:', clienteId);
    seleccionarFecha.innerHTML = '<option value="">Seleccionar fecha...</option>';
    const q = query(collection(db, `clientes/${clienteId}/tomas`), orderBy('fecha', 'desc'));
    try {
        const querySnapshot = await getDocs(q);
        console.log('Tomas query snapshot size:', querySnapshot.size);
        if (querySnapshot.empty) {
            console.log('No tomas found for cliente:', clienteId);
            seleccionarFecha.innerHTML = '<option value="">No hay tomas disponibles</option>';
            return;
        }
        querySnapshot.forEach(doc => {
            const data = doc.data();
            console.log('Toma found:', doc.id, 'Fecha:', data.fecha);
            const option = document.createElement('option');
            option.value = doc.id;
            let fechaStr = 'Fecha inválida';
            try {
                if (data.fecha && data.fecha.toDate) {
                    fechaStr = data.fecha.toDate().toLocaleString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } else if (data.fecha) {
                    fechaStr = new Date(data.fecha).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            } catch (error) {
                console.warn('Error formatting fecha for toma:', doc.id, error);
            }
            option.textContent = fechaStr;
            seleccionarFecha.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching tomas:', error.code, error.message);
        alert('Error al cargar fechas: ' + error.message);
    }
}

// Cargar datos de la toma seleccionada en el formulario
async function cargarDatosToma(clienteId, tomaId) {
    if (!clienteId || !tomaId) {
        console.log('Falta clienteId o tomaId, limpiando formulario');
        form.reset();
        return;
    }
    console.log('Cargando datos de toma:', tomaId, 'para cliente:', clienteId);
    try {
        const tomaRef = doc(db, `clientes/${clienteId}/tomas`, tomaId);
        const tomaSnap = await getDoc(tomaRef);
        if (!tomaSnap.exists()) {
            console.log('Toma no encontrada:', tomaId);
            alert('La toma seleccionada no existe.');
            form.reset();
            return;
        }
        const data = tomaSnap.data();
        console.log('Datos de la toma:', JSON.stringify(data, null, 2));

        // Poblar campos del formulario
        document.getElementById('nombre').value = data.nombre || '';
        document.getElementById('genero').value = data.genero || '';
        document.getElementById('edad').value = data.edad || '';
        document.getElementById('peso').value = data.peso || '';
        document.getElementById('altura').value = data.altura || '';
        document.getElementById('es_deportista').value = data.es_deportista || '';
        document.getElementById('grasa_actual_conocida').value = data.grasa_actual_conocida || '';
        document.getElementById('grasa_deseada').value = data.grasa_deseada || '';

        // Poblar medidas.pliegues
        document.getElementById('pliegue_tricipital').value = data.medidas?.pliegues?.tricipital || '';
        document.getElementById('pliegue_subescapular').value = data.medidas?.pliegues?.subescapular || '';
        document.getElementById('pliegue_suprailiaco').value = data.medidas?.pliegues?.suprailiaco || '';
        document.getElementById('pliegue_bicipital').value = data.medidas?.pliegues?.bicipital || '';
        document.getElementById('pliegue_pantorrilla').value = data.medidas?.pliegues?.pantorrilla || '';

        // Poblar medidas.circunferencias
        document.getElementById('circ_cintura').value = data.medidas?.circunferencias?.cintura || '';
        document.getElementById('circ_cadera').value = data.medidas?.circunferencias?.cadera || '';
        document.getElementById('circ_cuello').value = data.medidas?.circunferencias?.cuello || '';
        document.getElementById('circ_pantorrilla').value = data.medidas?.circunferencias?.pantorrilla || '';
        document.getElementById('circ_brazo').value = data.medidas?.circunferencias?.brazo || '';
        document.getElementById('circ_brazo_contraido').value = data.medidas?.circunferencias?.brazo_contraido || '';

        // Poblar medidas.diametros
        document.getElementById('diam_humero').value = data.medidas?.diametros?.humero || '';
        document.getElementById('diam_femur').value = data.medidas?.diametros?.femur || '';
        document.getElementById('diam_muneca').value = data.medidas?.diametros?.muneca || '';

        // Poblar resultados
        if (data.resultados) {
            const resultados = data.resultados;
            console.log('Claves disponibles en resultados:', Object.keys(resultados));

            // Mapear claves de resultados a IDs de elementos
            const resultMappings = {
                                // IMC
                                'imc': { id: 'result-imc', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'imcSource': { id: 'imc-source', unit: '', format: (v) => v || '---' },
                                
                                // ICC
                                'icc': { id: 'result-icc', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(2) : '---' },
                                'iccSource': { id: 'icc-source', unit: '', format: (v) => v || '---' },
                                
                                // % Grasa
                                'grasaPctActual': { id: 'result-grasa-pct-actual', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'grasaPctActualSource': { id: 'grasa-pct-actual-source', unit: '', format: (v) => v || '---' },
                                'grasaPctMetabolic': { id: 'result-grasa-pct-metabolic', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'grasaPctMetabolicSource': { id: 'grasa-pct-metabolic-source', unit: '', format: (v) => v || '---' },
                                'grasaPctDeseado': { id: 'result-grasa-pct-deseado', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'grasaPctDeseadoSource': { id: 'grasa-pct-deseado-source', unit: '', format: (v) => v || '---' },
                                'grasaPctDeurenberg': { id: 'result-grasa-pct-Deurenberg', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'grasaPctDeurenbergSource': { id: 'grasa-pct-Deurenberg-source', unit: '', format: (v) => v || '---' },
                                'grasaPctCUNBAE': { id: 'result-grasa-pct-CUN-BAE', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'grasaPctCUNBAESource': { id: 'grasa-pct-CUN-BAE-source', unit: '', format: (v) => v || '---' },
                                
                                // Masa Grasa
                                'masaGrasaActual': { id: 'result-masa-grasa-actual', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'masaGrasaActualSource': { id: 'masa-grasa-actual-source', unit: '', format: (v) => v || '---' },
                                'masaGrasaMetabolic': { id: 'result-masa-grasa-metabolic', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'masaGrasaMetabolicSource': { id: 'masa-grasa-metabolic-source', unit: '', format: (v) => v || '---' },
                                
                                // Masa Magra
                                'masaMagraActual': { id: 'result-masa-magra-actual', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'masaMagraActualSource': { id: 'masa-magra-actual-source', unit: '', format: (v) => v || '---' },
                                'masaMagraMetabolic': { id: 'result-masa-magra-metabolic', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'masaMagraMetabolicSource': { id: 'masa-magra-metabolic-source', unit: '', format: (v) => v || '---' },
                                
                                // IMLG
                                'imlgActual': { id: 'result-imlg-actual', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'imlgActualSource': { id: 'imlg-actual-source', unit: '', format: (v) => v || '---' },
                                'imlgMetabolic': { id: 'result-imlg-metabolic', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'imlgMetabolicSource': { id: 'imlg-metabolic-source', unit: '', format: (v) => v || '---' },
                                
                                // IMG
                                'imgActual': { id: 'result-img-actual', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'imgActualSource': { id: 'img-actual-source', unit: '', format: (v) => v || '---' },
                                'imgMetabolic': { id: 'result-img-metabolic', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'imgMetabolicSource': { id: 'img-metabolic-source', unit: '', format: (v) => v || '---' },
                                
                                // Tipología
                                'tipologiaActual': { id: 'result-tipologia-actual', unit: '', format: (v) => v || '---' },
                                'tipologiaActualSource': { id: 'tipologia-actual-source', unit: '', format: (v) => v || '---' },
                                'tipologiaMetabolic': { id: 'result-tipologia-metabolic', unit: '', format: (v) => v || '---' },
                                'tipologiaMetabolicSource': { id: 'tipologia-metabolic-source', unit: '', format: (v) => v || '---' },
                                
                                // TMB
                                'tmb': { id: 'result-tmb', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(0) : '---' },
                                'tmbSource': { id: 'tmb-source', unit: '', format: (v) => v || '---' },
                                
                                // Edad Metabólica
                                'edadmetabolica': { id: 'result-edadmetabolica', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(0) : '---' },
                                'edadmetabolicaSource': { id: 'edadmetabolica-source', unit: '', format: (v) => v || '---' },
                                
                                // Somatotipo
                                'somatotipo': { id: 'result-somatotipo', unit: '', format: (v) => typeof v === 'object' && v.formatted ? v.formatted : '---' },
                                'somatotipoSource': { id: 'somatotipo-source', unit: '', format: (v) => v || '---' },
                                
                                // AMB
                                'amb': { id: 'result-amb', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(0) : '---' },
                                'ambSource': { id: 'amb-source', unit: '', format: (v) => v || '---' },
                                
                                // AMBC
                                'ambc': { id: 'result-ambc', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(0) : '---' },
                                'ambcSource': { id: 'ambc-source', unit: '', format: (v) => v || '---' },
                                
                                // MMT
                                'mmt': { id: 'result-mmt', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'mmtSource': { id: 'mmt-source', unit: '', format: (v) => v || '---' },
                                'mmt2': { id: 'result-mmt2', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'mmt2Source': { id: 'mmt2-source', unit: '', format: (v) => v || '---' },
                                'Pctmmt': { id: 'result-Pct-mmt', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'PctmmtSource': { id: 'Pct-mmt-source', unit: '', format: (v) => v || '---' },
                                'Pctmmt2': { id: 'result-Pct-mmt2', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'Pctmmt2Source': { id: 'Pct-mmt2-source', unit: '', format: (v) => v || '---' },
                                
                                // Masa Ósea
                                'masaOsea': { id: 'result-masa-osea', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'masaOseaSource': { id: 'masa-osea-source', unit: '', format: (v) => v || '---' },
                                
                                // Masa Residual
                                'masaResidual': { id: 'result-masa-residual', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'masaResidualSource': { id: 'masa-residual-source', unit: '', format: (v) => v || '---' },
                                
                                // Peso
                                'pesoIdeal': { id: 'result-peso-ideal', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'pesoIdealSource': { id: 'peso-ideal-source', unit: '', format: (v) => v || '---' },
                                'pesoObjetivo': { id: 'result-peso-objetivo', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'pesoObjetivoSource': { id: 'peso-objetivo-source', unit: '', format: (v) => v || '---' },
                                'pesoMuscular': { id: 'result-peso-muscular', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'pesoMuscularSource': { id: 'peso-muscular-source', unit: '', format: (v) => v || '---' },
                                
                                // Agua Corporal
                                'aguaCorporal': { id: 'result-agua-corporal', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                                'aguaCorporalSource': { id: 'agua-corporal-source', unit: '', format: (v) => v || '---' }
                            };

            // Asignar valores a los elementos de resultados
            Object.entries(resultMappings).forEach(([key, { id, unit, format }]) => {
                const element = document.getElementById(id);
                if (element) {
                    const value = resultados[key];
                    if (value !== undefined && value !== null) {
                        element.textContent = `${format(value)} ${unit}`.trim();
                    } else {
                        console.warn(`No se encontró valor para ${key} en resultados`);
                        element.textContent = '---';
                    }
                } else {
                    console.warn(`Elemento con ID ${id} no encontrado en el DOM`);
                }
            });
        } else {
            console.log('No hay resultados en la toma');
            resultElementIds.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.textContent = '---';
            });
        }

        // Asegurarse de que el botón Guardar Datos esté oculto
        if (guardarDatosBtn && guardarDatosBtn.style.display !== 'none') {
            guardarDatosBtn.style.display = 'none';
            console.log('Botón Guardar Datos ocultado al cargar toma');
        }
    } catch (error) {
        console.error('Error al cargar datos de la toma:', error);
        alert('Error al cargar los datos: ' + error.message);
        form.reset();
        resultElementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = '---';
        });
    }
}

// Function to fetch and display progress charts
async function showProgressCharts(clienteId) {
    if (!clienteId) {
        console.log('No clienteId provided, skipping showProgressCharts');
        return;
    }

    try {
        const q = query(collection(db, `clientes/${clienteId}/tomas`), orderBy('fecha', 'asc'));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            console.log('No tomas found for cliente:', clienteId);
            alert('No hay datos disponibles para mostrar el progreso.');
            return;
        }

        // Helper to ensure numeric values
        const safeToNumber = (value) => {
            if (value === null || value === undefined) return null;
            const num = Number(value);
            return isNaN(num) ? null : num;
        };

        // Collect data for charts
        const dates = [];
        const pesoData = {
            actual: [],
            perdidaExceso: [],
            perdidaInicial: []
        };
        const grasaData = {
            actualPct: [],
            actualKg: [],
            metabolicaPct: [],
            metabolicaKg: [],
            deurenberg: [],
            cunBae: []
        };
        const musculoData = {
            mmt: [],
            Pctmmt: [],
            masaMagraActual: [],
            masaMagraMetabolic: []
        };
        const plieguesData = {
            tricipital: [],
            subescapular: [],
            suprailiaco: [],
            bicipital: [],
            pantorrilla: []
        };
        const circunferenciasData = {
            cintura: [],
            cadera: [],
            cuello: [],
            pantorrilla: [],
            brazo: [],
            brazo_contraido: []
        };
        const imcIccData = {
            imc: [],
            icc: []
        };
        const reservaProteicaData = {
            perimetroBrazo: [],
            areaMuscularBrazo: [],
            areaGrasaBrazo: []
        };
        const gastoEnergeticoData = {
            gasto: [],
            edadMetabolica: [],
            tmb: []
        };
        const nonNumericalData = {
            somatotipo: [],
            tipologiaActual: [],
            tipologiaMetabolico: []
        };

        // Calculate initial weight for % loss
        let pesoInicial = null;

        querySnapshot.forEach((doc, index) => {
            const data = doc.data();
            console.log(`Document ${index} ID: ${doc.id}`, data);

            // Validate data structure
            if (!data.fecha) {
                console.warn(`Document ${doc.id} missing fecha, skipping`);
                return;
            }
            if (!data.resultados) {
                console.warn(`Document ${doc.id} missing resultados, using defaults`);
                data.resultados = {};
            }
            if (!data.medidas) {
                console.warn(`Document ${doc.id} missing medidas, using defaults`);
                data.medidas = { pliegues: {}, circunferencias: {} };
            }

            const fecha = data.fecha && data.fecha.toDate ? data.fecha.toDate() : new Date(data.fecha);
            dates.push(fecha.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }));

            // Peso
            const peso = safeToNumber(data.peso);
            pesoData.actual.push(peso);
            if (index === 0 && peso) pesoInicial = peso;
            const pesoIdeal = safeToNumber(data.resultados.pesoIdeal) || 70;
            pesoData.perdidaExceso.push(peso && pesoInicial && pesoIdeal ? ((pesoInicial - peso) / (pesoInicial - pesoIdeal) * 100) : null);
            pesoData.perdidaInicial.push(peso && pesoInicial ? ((pesoInicial - peso) / pesoInicial * 100) : null);

            // Grasa
            const grasaActualPct = safeToNumber(data.resultados.grasaPctActual) || safeToNumber(data.grasa_actual_conocida);
            grasaData.actualPct.push(grasaActualPct);
            const masaGrasaActual = safeToNumber(data.resultados.masaGrasaActual);
            grasaData.actualKg.push(masaGrasaActual || (peso && grasaActualPct ? (peso * grasaActualPct / 100) : null));
            grasaData.metabolicaPct.push(safeToNumber(data.resultados.grasaPctMetabolic));
            grasaData.metabolicaKg.push(safeToNumber(data.resultados.masaGrasaMetabolic));
            grasaData.deurenberg.push(safeToNumber(data.resultados.grasaPctDeurenberg));
            grasaData.cunBae.push(safeToNumber(data.resultados.grasaPctCUNBAE));

            // Músculo
            musculoData.mmt.push(safeToNumber(data.resultados.mmt));
            musculoData.Pctmmt.push(safeToNumber(data.resultados.Pctmmt));
            musculoData.masaMagraActual.push(safeToNumber(data.resultados.masaMagraActual));
            musculoData.masaMagraMetabolic.push(safeToNumber(data.resultados.masaMagraMetabolic));

            // Pliegues
            plieguesData.tricipital.push(safeToNumber(data.medidas.pliegues?.tricipital));
            plieguesData.subescapular.push(safeToNumber(data.medidas.pliegues?.subescapular));
            plieguesData.suprailiaco.push(safeToNumber(data.medidas.pliegues?.suprailiaco));
            plieguesData.bicipital.push(safeToNumber(data.medidas.pliegues?.bicipital));
            plieguesData.pantorrilla.push(safeToNumber(data.medidas.pliegues?.pantorrilla));

            // Circunferencias
            circunferenciasData.cintura.push(safeToNumber(data.medidas.circunferencias?.cintura));
            circunferenciasData.cadera.push(safeToNumber(data.medidas.circunferencias?.cadera));
            circunferenciasData.cuello.push(safeToNumber(data.medidas.circunferencias?.cuello));
            circunferenciasData.pantorrilla.push(safeToNumber(data.medidas.circunferencias?.pantorrilla));
            circunferenciasData.brazo.push(safeToNumber(data.medidas.circunferencias?.brazo));
            circunferenciasData.brazo_contraido.push(safeToNumber(data.medidas.circunferencias?.brazo_contraido));

            // IMC e ICC
            imcIccData.imc.push(safeToNumber(data.resultados.imc));
            imcIccData.icc.push(safeToNumber(data.resultados.icc));

            // Reserva Proteica
            const perimetroBrazo = safeToNumber(data.medidas.circunferencias?.brazo);
            reservaProteicaData.perimetroBrazo.push(perimetroBrazo);
            reservaProteicaData.areaMuscularBrazo.push(safeToNumber(data.resultados.amb));
            const pliegueTricipital = safeToNumber(data.medidas.pliegues?.tricipital);
            reservaProteicaData.areaGrasaBrazo.push(perimetroBrazo && pliegueTricipital ? 
                ((perimetroBrazo * pliegueTricipital / 2) - (Math.PI * (pliegueTricipital / 2) ** 2)) : null);

            // Gasto Energético
            const tmb = safeToNumber(data.resultados.tmb);
            gastoEnergeticoData.gasto.push(tmb);
            gastoEnergeticoData.edadMetabolica.push(safeToNumber(data.resultados.edadmetabolica));
            gastoEnergeticoData.tmb.push(tmb);

            // Non-numerical data
            nonNumericalData.somatotipo.push(data.resultados.somatotipo?.formatted || '---');
            nonNumericalData.tipologiaActual.push(data.resultados.tipologiaActual || '---');
            nonNumericalData.tipologiaMetabolico.push(data.resultados.tipologiaMetabolic || '---');
        });

        // Destroy existing charts
        const chartIds = [
            'peso-evolucion-chart',
            'grasa-evolucion-chart',
            'musculo-evolucion-chart',
            'pliegues-chart',
            'circunferencias-chart',
            'imc-icc-chart',
            'reserva-proteica-chart',
            'gasto-energetico-chart'
        ];
        chartIds.forEach(canvasId => {
            const chart = Chart.getChart(canvasId);
            if (chart) chart.destroy();
        });

        // Common chart options
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { font: { size: 10 } } },
                datalabels: {
                    display: true,
                    align: 'top',
                    formatter: (value, context) => {
                        if (value === null || value === undefined || isNaN(value)) return '';
                        const numValue = Number(value);
                        if (isNaN(numValue)) return '';
                        let formattedValue = numValue;
                        if (context.dataset.label.includes('kg')) formattedValue = `${numValue.toFixed(1)} kg`;
                        else if (context.dataset.label.includes('%')) formattedValue = `${numValue.toFixed(1)}%`;
                        else if (context.dataset.label.includes('mm')) formattedValue = `${numValue.toFixed(1)} mm`;
                        else if (context.dataset.label.includes('cm²')) formattedValue = `${numValue.toFixed(1)} cm²`;
                        else if (context.dataset.label.includes('cm')) formattedValue = `${numValue.toFixed(1)} cm`;
                        else if (context.dataset.label.includes('IMC')) formattedValue = `${numValue.toFixed(1)}`;
                        else if (context.dataset.label.includes('ICC')) formattedValue = `${numValue.toFixed(2)}`;
                        else if (context.dataset.label.includes('kcal')) formattedValue = `${numValue.toFixed(0)} kcal`;
                        else if (context.dataset.label.includes('años')) formattedValue = `${numValue.toFixed(0)} años`;
                        return `${formattedValue}`;
                    },
                    color: '#333',
                    font: { size: 10 }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Fecha', font: { size: 12 } } },
                y: { beginAtZero: false }
            }
        };

        // Helper to check if dataset has valid data
        const hasValidData = (dataArray) => dataArray.some(value => value !== null && !isNaN(value));

        // Peso Evolución Chart
        const pesoDatasets = [
            { label: 'Peso Actual (kg)', data: pesoData.actual, borderColor: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.2)', fill: false, tension: 0.1 },
            { label: '% Pérdida Exceso', data: pesoData.perdidaExceso, borderColor: '#388E3C', backgroundColor: 'rgba(56, 142, 60, 0.2)', fill: false, tension: 0.1 },
            { label: '% Pérdida Inicial', data: pesoData.perdidaInicial, borderColor: '#0275d8', backgroundColor: 'rgba(2, 117, 216, 0.2)', fill: false, tension: 0.1 }
        ].filter(ds => hasValidData(ds.data));
        if (pesoDatasets.length > 0) {
            new Chart(document.getElementById('peso-evolucion-chart'), {
                type: 'line',
                data: { labels: dates, datasets: pesoDatasets },
                options: {
                    ...commonOptions,
                    scales: { ...commonOptions.scales, y: { title: { display: true, text: 'Valor', font: { size: 12 } } } }
                },
                plugins: [ChartDataLabels]
            });
        } else {
            console.warn('No valid data for Peso Evolución Chart');
        }

        // Grasa Evolución Chart
        const grasaDatasets = [
            { label: 'Grasa Actual (%)', data: grasaData.actualPct, borderColor: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.2)', fill: false, tension: 0.1 },
            { label: 'Grasa Actual (kg)', data: grasaData.actualKg, borderColor: '#388E3C', backgroundColor: 'rgba(56, 142, 60, 0.2)', fill: false, tension: 0.1 },
            { label: 'Grasa Metabólica (%)', data: grasaData.metabolicaPct, borderColor: '#0275d8', backgroundColor: 'rgba(2, 117, 216, 0.2)', fill: false, tension: 0.1 },
            { label: 'Grasa Metabólica (kg)', data: grasaData.metabolicaKg, borderColor: '#5bc0de', backgroundColor: 'rgba(91, 192, 222, 0.2)', fill: false, tension: 0.1 },
            { label: '% Grasa Deurenberg', data: grasaData.deurenberg, borderColor: '#f0ad4e', backgroundColor: 'rgba(240, 173, 78, 0.2)', fill: false, tension: 0.1 },
            { label: '% Grasa CUN-BAE', data: grasaData.cunBae, borderColor: '#d9534f', backgroundColor: 'rgba(217, 83, 79, 0.2)', fill: false, tension: 0.1 }
        ].filter(ds => hasValidData(ds.data));
        if (grasaDatasets.length > 0) {
            new Chart(document.getElementById('grasa-evolucion-chart'), {
                type: 'line',
                data: { labels: dates, datasets: grasaDatasets },
                options: {
                    ...commonOptions,
                    scales: { ...commonOptions.scales, y: { title: { display: true, text: 'Valor', font: 12 } } } }
                },
                plugins: [ChartDataLabels]
            });
        } else {
            console.warn('No valid data for Grasa Evolución Chart');
        }

        // Músculo Evolución Chart
        const musculoDatasets = [
            { label: 'Masa Muscular (kg)', data: musculoData.mmt, borderColor: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.2)', fill: false, tension: 0.1 },
            { label: 'Masa Muscular (%)', data: musculoData.Pctmmt, borderColor: '#388E3c', backgroundColor: 'rgba(56, 142, 60, 0.2)', fill: false, tension: 0.1 },
            { label: 'Masa Magra Actual (kg)', data: musculoData.masaMagraActual, borderColor: '#0275d8', backgroundColor: 'rgba(2, 117, 216, 0.2)', fill: false, tension: 0.1 },
            { label: 'Masa Magra Metabólica (kg)', data: musculoData.masaMagraMetabolic, borderColor: '#5bc0de', backgroundColor: 'rgba(91, 192, 222, 0.2)', fill: false, tension: 0.1 }
        ].filter(ds => hasValidData(ds.data));
        if (musculoDatasets.length > 0) {
            new Chart(document.getElementById('musculo-evolucion-chart'), {
                type: 'line',
                data: { labels: dates, datasets: musculoDatasets },
                options: {
                    ...commonOptions,
                    scales: { ...commonOptions.scales, y: { title: { display: true, text: 'Valor', font: { size: 12 } } } }
                },
                plugins: [ChartDataLabels]
            });
        } else {
            console.warn('No valid data for Músculo Chart');
        }

        // Pliegues Chart
        const plieguesDatasets = [
            { label: 'Tricipital (mm)', data: plieguesData.tricipital, borderColor: '#0275d8', backgroundColor: 'rgba(2, 117, 216, 0.2)', fill: false, tension: 0.1 },
            { label: 'Subescapular (mm)', data: plieguesData.subescapular, borderColor: '#5bc0de', backgroundColor: 'rgba(91, 192, 222, 0.2), fill: false, tension: 0.1 },
            { label: 'Suprailiaco (mm), data: plieguesData.suprailiaco, borderColor: '#5cb85c', backgroundColor: 'rgba(92, 184, 92, 0.2)', fill: false, tension: 0.1 },
            { label: 'Bicipital (mm)', data: plieguesData.bicipital, borderColor: '#f0ad4e', backgroundColor: 'rgba(240, 173, 78, 0.2)', fill: false, tension: 0.1 },
            { label: 'Pantorrilla (mm)', data: plieguesData.pantorrilla, borderColor: '#d9534f', backgroundColor: 'rgba(217, 83, 79, 0.2)', fill: false, tension: 0.1 }
        ].filter(ds => hasValidData(ds.data));
        if (plieguesDatasets.length > 0) {
            new Chart(document.getElementById('pliegues-chart'), {
                type: 'line',
                data: { labels: dates, datasets: plieguesDatasets },
                options: {
                    ...commonOptions,
                    scales: { ...commonOptions.scales, y: { title: { display: true, text: 'Pliegues (mm)', font: { size: 12 } } } }
                },
                plugins: [ChartDataLabels]
            });
        } else {
            console.warn('No valid data válida para datos Pliegues de Chart');
        }

        // Circunferencias Chart
        const circunferenciasDatasets = [
            { label: 'Cintura (cm)', data: circunferenciasData.cintura, borderColor: '#0275d8', backgroundColor: 'rgba(2, 117, 216, 0.2)', fill: false, tension: 0.1 },
            { label: 'Cadera (cm)', data: circunferenciasData.cadera, borderColor: '#5bc0de', backgroundColor: 'rgba(91, 192, 222, 0.2)', fill: false, tension: 0.1 },
            { label: 'Cuello (cm)', data: circunferenciasData.cuello, borderColor: '#5cb85c', backgroundColor: 'rgba(92, 184, 92, 0.2)', fill: false, tension: 0.1 },
            { label: 'Pantorrilla (cm)', data: circunferenciasData.pantorrilla, label: 'Brazo Relajado (cm)', backgroundColor: 'rgba(217, 83, 79, 0.2)', fill: false, tension: 0.1 },
            { label: 'Brazo Contraído (cm)', data: circunferenciasData.brazo_contraido, borderColor: '#6610f2', backgroundColor: 'rgba(102, 16, 242, 0.2)', fill: false, tension: 0.1 }
        ].filter(ds => hasValidData(ds.data));
        if (circunferenciasDatasets.length > 0) {
            new Chart(document.getElementById('circunferencias-chart'), {
                type: 'line',
                data: { labels: dates, datasets: circunferenciasDatasets },
                options: {
                    ...commonOptions,
                    scales: { ...commonOptions.scales, y: { title: { display: true, text: 'Circunferencias (cm)', font: { size: 12 } } } }
                },
                plugins: [ChartDataLabels]
            });
        } else {
            console.warn('No valid data for válida Circunferencias de Chart');
        }

        // IMC e ICC Chart
        const imcIccDatasets = [
            { label: 'IMC (kg/m²'), data: imcIccData.imc, borderColor: '#0275d8', backgroundColor: 'rgba(2, 117, 216, 0.2)', fill: false, tension: 0.1 },
            { label: 'ICC', data: imcIccData.icc, borderColor: '#5bc0de', backgroundColor: 'rgba(91, 192, 222, 0.2)', fill: false, tension: 0.1 }
        ].filter(ds => hasValidData(ds.data));
        if (imcIccDatasets.length > 0) {
            new Chart(document.getElementById('imc-icc-chart'), {
                type: 'line',
                data: { labels: dates, datasets: imcIccDatasets },
                options: {
                    ...commonOptions,
                    scales: { ...commonOptions.scales, y: { title: { display: true, text: 'Valor', font: { size: true } } } }
                },
                plugins: [ChartDataLabels]
            });
        } else {
            console.warn('No valid data for IMC e ICC Chart');
        }

        // Reserva Proteica Chart
        const reservaProteicaDatasets = [
            { label: 'Perímetro de Brazo (cm)', data: reservaProteicaData.perimetroBrazo, borderColor: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.2)', fill: false, tension: 0.1 },
            { label: 'Área Muscular Brazo (cm²)', data: reservaProteicaData.areaMuscularBrazo, borderColor: '#388E3C', backgroundColor: 'rgba(56, 142, 60, 0.2)', fill: false, tension: 0.1 },
            { label: 'Área Grasa Brazo (cm²)', data: reservaProteicaData.areaGrasaBrazo, borderColor: '#0275d8', backgroundColor: 'rgba(2, 117, 216, 0.2)', fill: false, tension: 0.1 }
        ].filter(ds => hasValidData(ds.data));
        if (reservaProteicaDatasets.length > 0) {
            new Chart(document.getElementById('reserva-proteica-chart'), {
                type: 'line',
                data: { labels: dates, datasets: reservaProteicaDatasets },
                options: {
                    ...commonOptions,
                    scales: { ...commonOptions.scales, y: { title: { display: true, text: 'Valor', font: { size: 12 } } } }
                },
                plugins: [ChartDataLabels]
            });
        } else {
            console.warn('No valid data for Reserva Proteica Chart');
        }

        // Gasto Energético Chart
        const gastoEnergeticoDatasets = [
            { label: 'Gasto Energético (kcal)', data: gastoEnergeticoData.gasto, borderColor: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.2)', fill: false, tension: 0.1 },
            { label: 'Edad Metabólica (años)', data: gastoEnergeticoData.edadMetabolica, borderColor: '#388E3C', backgroundColor: 'rgba(56, 142, 60, 0.2)', fill: false, tension: 0.1 },
            { label: 'TMB (kcal)', data: gastoEnergeticoData.tmb, borderColor: '#0275d8', backgroundColor: 'rgba(2, 117, 216, 0.2)', fill: false, tension: 0.1 }
        ].filter(ds => hasValidData(ds.data));
        if (gastoEnergeticoDatasets.length > 0) {
            new Chart(document.getElementById('gasto-energetico-chart'), {
                type: 'line',
                data: { labels: dates, datasets: gastoEnergeticoDatasets },
                options: {
                    ...commonOptions,
                    scales: { ...commonOptions.scales, y: { title: { display: true, text: 'Valor', font: { size: 12 } } } }
                },
                plugins: [ChartDataLabels]
            });
        } else {
            console.warn('No valid data for Gasto Energético Chart');
        }

        // Populate non-numerical data table
        const tableBody = document.getElementById('non-numerical-table-body');
        tableBody.innerHTML = '';
        dates.forEach((date, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="padding: 10px; border: 1px solid #dee2e6;">${date}</td>
                <td style="padding: 10px; border: 1px solid #dee2e6;">${nonNumericalData.somatotipo[index]}</td>
                <td style="padding: 10px; border: 1px solid #dee2e6;">${nonNumericalData.tipologiaActual[index]}</td>
                <td style="padding: 10px; border: 1px solid #dee2e6;">${nonNumericalData.tipologiaMetabolica[index]}</td>
            `;
            tableBody.appendChild(row);
        });

        // Show popup
        const popup = document.getElementById('progress-container');
        if (popup) {
            popup.style.display = 'flex';
        }

        // Add PDF export
        const printPdfBtn = document.getElementById('print-pdf-btn');
        if (printPdfBtn) {
            printPdfBtn.addEventListener('click', () => {
                const element = document.getElementById('charts-container');
                const opt = {
                    margin: 10,
                    filename: `Progreso_Cliente_${clienteId}_${new Date().toLocaleDateString('es-ES')}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                html2pdf().set(opt).from(element).save();
            });
        }
    } catch (error) {
        console.error('Error al cargar los datos de progreso:', error);
        alert('Error al cargar los datos de progreso: ' + error.message);
    }
}



  
// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', initializeUI);


  
