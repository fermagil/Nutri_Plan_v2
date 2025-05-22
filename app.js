import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signOut,onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

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

// Inicializa Firebase, Firestore y Auth
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

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
    'result-grasa-pct-deseado',
    'grasa-pct-deseado-source',
    'result-masa-grasa',
    'masa-grasa-source',
    'result-mlg',
    'mlg-source',
    'result-amb',
    'result-masa-osea',
    'result-masa-residual',
    'result-peso-ideal',
    'result-peso-objetivo',
    'result-mmt',
    'result-Pct-mmt',
    'result-imlg',
    'imlg-source',
    'result-img',
    'img-source',
    'result-tipologia',
    'tipologia-source',
    'result-edadmetabolica',
    'edadmetabolica-source',
    'result-somatotipo'
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
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    //const loginContainer = document.getElementById('login-container');
    //const navMenu = document.getElementById('nav-menu');
    if (user) {
        console.log('Auth state: User signed in', user.displayName, user.email);
        //loginContainer.style.display = 'none';
        //form.style.display = 'block';
        //navMenu.style.display = 'flex';
    } else {
        console.log('Auth state: No user signed in');
        //loginContainer.style.display = 'block';
        //form.style.display = 'none';
        //navMenu.style.display = 'none';
        //clientesResultados.style.display = 'none';
        //seleccionarFecha.innerHTML = '<option value="">Seleccionar fecha...</option>';
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
    if (clienteId) {
        currentClienteId = clienteId;
        await cargarFechasTomas(clienteId);
    } else {
        console.log('No cliente seleccionado, limpiando fechas');
        seleccionarFecha.innerHTML = '<option value="">Seleccionar fecha...</option>';
        currentClienteId = null;
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
                'imc': { id: 'result-imc', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                'imcSource': { id: 'imc-source', unit: '', format: (v) => v || '---' },
                'icc': { id: 'result-icc', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(2) : '---' },
                'iccSource': { id: 'icc-source', unit: '', format: (v) => v || '---' },
                'grasaPctActual': { id: 'result-grasa-pct-actual', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                'grasaPctActualSource': { id: 'grasa-pct-actual-source', unit: '', format: (v) => v || '---' },
                'grasaPctDeseado': { id: 'result-grasa-pct-deseado', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                'grasaPctDeseadoSource': { id: 'grasa-pct-deseado-source', unit: '', format: (v) => v || '---' },
                'masaGrasa': { id: 'result-masa-grasa', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                'masaGrasaSource': { id: 'masaGrasa-source', unit: '', format: (v) => v || '---' },
                'mlg': { id: 'result-mlg', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                'mlgSource': { id: 'mlg-source', unit: '', format: (v) => v || '---' },
                'amb': { id: 'result-amb', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(0) : '---' },
                'ambSource': { id: 'amb-source', unit: '', format: (v) => v || '---' },
                'masaOsea': { id: 'result-masa-osea', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                'masaResidual': { id: 'result-masa-residual', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                'pesoIdeal': { id: 'result-peso-ideal', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                'pesoObjetivo': { id: 'result-peso-objetivo', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                'somatotipo': { id: 'result-somatotipo', unit: '', format: (v) => typeof v === 'object' && v.formatted ? v.formatted : '---' },
                'mmt': { id: 'result-mmt', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                'Pctmmt': { id: 'result-Pctmmt', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                'edadmetabolica': { id: 'result-edadmetabolica', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(0) : '---' },
                'edadmetabolicaSource': { id: 'edadmetabolica-source', unit: '', format: (v) => v || '---' },
                'tipologia': { id: 'result-tipologia', unit: '', format: (v) => v || '---' },
                'tipologiaSource': { id: 'tipologia-source', unit: '', format: (v) => v || '---' },
                'imlg': { id: 'result-imlg', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                'imlgSource': { id: 'imlg-source', unit: '', format: (v) => v || '---' },
                'img': { id: 'result-img', unit: '', format: (v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))) ? toNumber(v).toFixed(1) : '---' },
                'imgSource': { id: 'img-source', unit: '', format: (v) => v || '---' },
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

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', initializeUI);


  
