import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyChC7s5NN-z-dSjqeXDaks7gaNaVCJAu7Q",
    authDomain: "nutriplanv2.firebaseapp.com",
    projectId: "nutriplanv2",
    storageBucket: "nutriplanv2.firebasestorage.app",
    messagingSenderId: "653707489758",
    appId: "1:653707489758:web:9133d1d1620825c385ed4f",
    measurementId: "G-NWER69E8B6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, db, auth, provider };

// Chart.js CDN (loaded dynamically if needed)
const loadChartJs = () => {
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        document.head.appendChild(script);
        return new Promise((resolve) => {
            script.onload = () => resolve();
        });
    }
    return Promise.resolve();
};

// Existing variables and functions (abridged for brevity)
const form = document.getElementById('anthropometry-form');
const buscarClienteInput = document.getElementById('buscar_cliente');
const nuevoClienteBtn = document.getElementById('nuevo_cliente');
const seleccionarFecha = document.getElementById('seleccionar_fecha');
const guardarDatosBtn = document.getElementById('guardar_datos');
let currentClienteId = null;
let currentUser = null;

const resultElementIds = [
    'result-imc', 'imc-source', 'result-icc', 'icc-source', 'result-grasa-pct-actual', 'grasa-pct-actual-source',
    'result-grasa-pct-metabolic', 'grasa-pct-metabolic-source', 'result-grasa-pct-deseado', 'grasa-pct-deseado-source',
    'result-grasa-pct-Deurenberg', 'grasa-pct-Deurenberg-source', 'result-grasa-pct-CUN-BAE', 'grasa-pct-CUN-BAE-source',
    'result-masa-grasa-actual', 'masa-grasa-actual-source', 'result-masa-grasa-metabolic', 'masa-grasa-metabolic-source',
    'result-masa-magra-actual', 'masa-magra-actual-source', 'result-masa-magra-metabolic', 'masa-magra-metabolic-source',
    'result-imlg-actual', 'imlg-actual-source', 'result-imlg-metabolic', 'imlg-metabolic-source',
    'result-img-actual', 'img-actual-source', 'result-img-metabolic', 'img-metabolic-source',
    'result-tipologia-actual', 'tipologia-actual-source', 'result-tipologia-metabolic', 'tipologia-metabolic-source',
    'result-tmb', 'tmb-source', 'result-edadmetabolica', 'edadmetabolica-source',
    'result-somatotipo', 'somatotipo-source', 'result-amb', 'amb-source', 'result-ambc', 'ambc-source',
    'result-mmt', 'mmt-source', 'result-mmt2', 'mmt2-source', 'result-Pct-mmt', 'Pct-mmt-source',
    'result-Pct-mmt2', 'Pct-mmt2-source', 'result-masa-osea', 'masa-osea-source',
    'result-masa-residual', 'masa-residual-source', 'result-peso-ideal', 'peso-ideal-source',
    'result-peso-objetivo', 'peso-objetivo-source', 'result-peso-muscular', 'peso-muscular-source',
    'result-agua-corporal', 'agua-corporal-source'
];

let clientesResultados = document.getElementById('clientes_resultados');
if (!clientesResultados) {
    clientesResultados = document.createElement('select');
    clientesResultados.id = 'clientes_resultados';
    buscarClienteInput.insertAdjacentElement('afterend', clientesResultados);
}

const normalizeText = (text) => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
};

const toNumber = (value) => {
    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
        return parseFloat(value);
    }
    return value;
};

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

function initializeUI() {
    document.getElementById('logo').addEventListener('click', function(event) {
        event.preventDefault();
        var dropdown = document.getElementById('dropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

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
        verProgresoBtn.addEventListener('click', async () => {
            if (currentClienteId) {
                await loadChartJs();
                await showProgressCharts(currentClienteId);
            } else {
                alert('Por favor, selecciona un cliente primero.');
            }
        });
    }

    window.logout = logout;
}

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const verProgresoBtn = document.getElementById('ver-progreso-btn');
    if (user) {
        console.log('Auth state: User signed in', user.displayName, user.email);
        if (verProgresoBtn) verProgresoBtn.style.display = currentClienteId ? 'inline-block' : 'none';
    } else {
        console.log('Auth state: No user signed in');
        window.location.href = 'https://fermagil.github.io/Nutri_Plan_v2/index.html';
        if (verProgresoBtn) verProgresoBtn.style.display = 'none';
        clientesResultados.style.display = 'none';
        seleccionarFecha.innerHTML = '<option value="">Seleccionar fecha...</option>';
        currentClienteId = null;
    }
});

// Update clientesResultados change event to toggle Ver Progreso button
clientesResultados.addEventListener('change', async () => {
    const clienteId = clientesResultados.value;
    console.log('Cliente seleccionado:', clienteId);
    const verProgresoBtn = document.getElementById('ver-progreso-btn');
    if (clienteId) {
        currentClienteId = clienteId;
        await cargarFechasTomas(clienteId);
        if (verProgresoBtn) verProgresoBtn.style.display = 'inline-block';
    } else {
        console.log('No cliente seleccionado, limpiando fechas');
        seleccionarFecha.innerHTML = '<option value="">Seleccionar fecha...</option>';
        currentClienteId = null;
        if (verProgresoBtn) verProgresoBtn.style.display = 'none';
    }
});

// Existing functions (abridged for brevity)
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
                        day: '2-digit'
                    });
                } else if (data.fecha) {
                    fechaStr = new Date(data.fecha).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
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

        document.getElementById('nombre').value = data.nombre || '';
        document.getElementById('genero').value = data.genero || '';
        document.getElementById('edad').value = data.edad || '';
        document.getElementById('peso').value = data.peso || '';
        document.getElementById('altura').value = data.altura || '';
        document.getElementById('es_deportista').value = data.es_deportista || '';
        document.getElementById('grasa_actual_conocida').value = data.grasa_actual_conocida || '';
        document.getElementById('grasa_deseada').value = data.grasa_deseada || '';

        document.getElementById('pliegue_tricipital').value = data.medidas?.pliegues?.tricipital || '';
        document.getElementById('pliegue_subescapular').value = data.medidas?.pliegues?.subescapular || '';
        document.getElementById('pliegue_suprailiaco').value = data.medidas?.pliegues?.suprailiaco || '';
        document.getElementById('pliegue_bicipital').value = data.medidas?.pliegues?.bicipital || '';
        document.getElementById('pliegue_pantorrilla').value = data.medidas?.pliegues?.pantorrilla || '';

        document.getElementById('circ_cintura').value = data.medidas?.circunferencias?.cintura || '';
        document.getElementById('circ_cadera').value = data.medidas?.circunferencias?.cadera || '';
        document.getElementById('circ_cuello').value = data.medidas?.circunferencias?.cuello || '';
        document.getElementById('circ_pantorrilla').value = data.medidas?.circunferencias?.pantorrilla || '';
        document.getElementById('circ_brazo').value = data.medidas?.circunferencias?.brazo || '';
        document.getElementById('circ_brazo_contraido').value = data.medidas?.circunferencias?.brazo_contraido || '';

        document.getElementById('diam_humero').value = data.medidas?.diametros?.humero || '';
        document.getElementById('diam_femur').value = data.medidas?.diametros?.femur || '';
        document.getElementById('diam_muneca').value = data.medidas?.diametros?.muneca || '';

        if (data.resultados) {
            const resultados = data.resultados;
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
                'imgSource': { id: 'img-source', unit: '', format: (v) => v || '---' }
            };

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

        // Collect data for charts
        const dates = [];
        const pesoData = [];
        const grasaPctData = [];
        const plieguesData = {
            tricipital: [], subescapular: [], suprailiaco: [], bicipital: [], pantorrilla: []
        };
        const circunferenciasData = {
            cintura: [], cadera: [], cuello: [], pantorrilla: [], brazo: [], brazo_contraido: []
        };
        const imcIccData = { imc: [], icc: [] };
        const masaMagraData = { actual: [], metabolico: [] };
        const masaMuscularData = { mmt: [], Pctmmt: [] };
        const nonNumericalData = { somatotipo: [], tipologiaActual: [], tipologiaMetabolico: [] };

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const fecha = data.fecha && data.fecha.toDate ? data.fecha.toDate() : new Date(data.fecha);
            dates.push(fecha.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }));

            pesoData.push(toNumber(data.peso) || null);
            grasaPctData.push(toNumber(data.grasa_actual_conocida) || null);

            plieguesData.tricipital.push(toNumber(data.medidas?.pliegues?.tricipital) || null);
            plieguesData.subescapular.push(toNumber(data.medidas?.pliegues?.subescapular) || null);
            plieguesData.suprailiaco.push(toNumber(data.medidas?.pliegues?.suprailiaco) || null);
            plieguesData.bicipital.push(toNumber(data.medidas?.pliegues?.bicipital) || null);
            plieguesData.pantorrilla.push(toNumber(data.medidas?.pliegues?.pantorrilla) || null);

            circunferenciasData.cintura.push(toNumber(data.medidas?.circunferencias?.cintura) || null);
            circunferenciasData.cadera.push(toNumber(data.medidas?.circunferencias?.cadera) || null);
            circunferenciasData.cuello.push(toNumber(data.medidas?.circunferencias?.cuello) || null);
            circunferenciasData.pantorrilla.push(toNumber(data.medidas?.circunferencias?.pantorrilla) || null);
            circunferenciasData.brazo.push(toNumber(data.medidas?.circunferencias?.brazo) || null);
            circunferenciasData.brazo_contraido.push(toNumber(data.medidas?.circunferencias?.brazo_contraido) || null);

            imcIccData.imc.push(toNumber(data.resultados?.imc) || null);
            imcIccData.icc.push(toNumber(data.resultados?.icc) || null);

            masaMagraData.actual.push(toNumber(data.resultados?.mlg) || null);
            masaMagraData.metabolico.push(toNumber(data.resultados?.masaMagraMetabolic) || null);

            masaMuscularData.mmt.push(toNumber(data.resultados?.mmt) || null);
            masaMuscularData.Pctmmt.push(toNumber(data.resultados?.Pctmmt) || null);

            nonNumericalData.somatotipo.push(data.resultados?.somatotipo?.formatted || '---');
            nonNumericalData.tipologiaActual.push(data.resultados?.tipologia || '---');
            nonNumericalData.tipologiaMetabolico.push(data.resultados?.tipologiaMetabolic || '---');
        });

        // Destroy existing charts if any
        ['peso-chart', 'grasa-pct-chart', 'pliegues-chart', 'circunferencias-chart', 'imc-icc-chart', 'masa-magra-chart', 'masa-muscular-chart'].forEach(canvasId => {
            const chart = Chart.getChart(canvasId);
            if (chart) chart.destroy();
        });

        // Peso Chart
        new Chart(document.getElementById('peso-chart'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Peso Actual (kg)',
                    data: pesoData,
                    borderColor: '#4CAF50',
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { title: { display: true, text: 'Peso (kg)' } }
                },
                plugins: { legend: { position: 'top' } }
            }
        });

        // % Grasa Chart
        new Chart(document.getElementById('grasa-pct-chart'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '% Grasa Actual',
                    data: grasaPctData,
                    borderColor: '#388E3C',
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { title: { display: true, text: '% Grasa' } }
                },
                plugins: { legend: { position: 'top' } }
            }
        });

        // Pliegues Chart
        new Chart(document.getElementById('pliegues-chart'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    { label: 'Tricipital (mm)', data: plieguesData.tricipital, borderColor: '#0275d8', fill: false, tension: 0.1 },
                    { label: 'Subescapular (mm)', data: plieguesData.subescapular, borderColor: '#5bc0de', fill: false, tension: 0.1 },
                    { label: 'Suprailiaco (mm)', data: plieguesData.suprailiaco, borderColor: '#5cb85c', fill: false, tension: 0.1 },
                    { label: 'Bicipital (mm)', data: plieguesData.bicipital, borderColor: '#f0ad4e', fill: false, tension: 0.1 },
                    { label: 'Pantorrilla (mm)', data: plieguesData.pantorrilla, borderColor: '#d9534f', fill: false, tension: 0.1 }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: { title: { display: true, text: 'Pliegues (mm)' } }
                },
                plugins: { legend: { position: 'top' } }
            }
        });

        // Circunferencias Chart
        new Chart(document.getElementById('circunferencias-chart'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    { label: 'Cintura (cm)', data: circunferenciasData.cintura, borderColor: '#0275d8', fill: false, tension: 0.1 },
                    { label: 'Cadera (cm)', data: circunferenciasData.cadera, borderColor: '#5bc0de', fill: false, tension: 0.1 },
                    { label: 'Cuello (cm)', data: circunferenciasData.cuello, borderColor: '#5cb85c', fill: false, tension: 0.1 },
                    { label: 'Pantorrilla (cm)', data: circunferenciasData.pantorrilla, borderColor: '#f0ad4e', fill: false, tension: 0.1 },
                    { label: 'Brazo Relajado (cm)', data: circunferenciasData.brazo, borderColor: '#d9534f', fill: false, tension: 0.1 },
                    { label: 'Brazo Contraído (cm)', data: circunferenciasData.brazo_contraido, borderColor: '#6610f2', fill: false, tension: 0.1 }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: { title: { display: true, text: 'Circunferencias (cm)' } }
                },
                plugins: { legend: { position: 'top' } }
            }
        });

        // IMC and ICC Chart
        new Chart(document.getElementById('imc-icc-chart'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    { label: 'IMC (kg/m²)', data: imcIccData.imc, borderColor: '#0275d8', fill: false, tension: 0.1 },
                    { label: 'ICC', data: imcIccData.icc, borderColor: '#5bc0de', fill: false, tension: 0.1 }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: { title: { display: true, text: 'Valor' } }
                },
                plugins: { legend: { position: 'top' } }
            }
        });

        // Masa Magra Chart
        new Chart(document.getElementById('masa-magra-chart'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    { label: 'Masa Magra Actual (kg)', data: masaMagraData.actual, borderColor: '#0275d8', fill: false, tension: 0.1 },
                    { label: 'Masa Magra Metabólico (kg)', data: masaMagraData.metabolico, borderColor: '#5bc0de', fill: false, tension: 0.1 }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: { title: { display: true, text: 'Masa Magra (kg)' } }
                },
                plugins: { legend: { position: 'top' } }
            }
        });

        // Masa Muscular Chart
        new Chart(document.getElementById('masa-muscular-chart'), {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    { label: 'Masa Muscular Total (kg)', data: masaMuscularData.mmt, borderColor: '#0275d8', fill: false, tension: 0.1 },
                    { label: '% Masa Muscular', data: masaMuscularData.Pctmmt, borderColor: '#5bc0de', fill: false, tension: 0.1 }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: { title: { display: true, text: 'Valor' } }
                },
                plugins: { legend: { position: 'top' } }
            }
        });

        // Non-Numerical Data Table
        const tableBody = document.getElementById('non-numerical-table-body');
        tableBody.innerHTML = '';
        dates.forEach((date, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="padding: 10px; border: 1px solid #dee2e6;">${date}</td>
                <td style="padding: 10px; border: 1px solid #dee2e6;">${nonNumericalData.somatotipo[index]}</td>
                <td style="padding: 10px; border: 1px solid #dee2e6;">${nonNumericalData.tipologiaActual[index]}</td>
                <td style="padding: 10px; border: 1px solid #dee2e6;">${nonNumericalData.tipologiaMetabolico[index]}</td>
            `;
            tableBody.appendChild(row);
        });

        // Show popup
        const popup = document.getElementById('progress-popup');
        if (popup) {
            popup.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error fetching progress data:', error);
        alert('Error al cargar los datos de progreso: ' + error.message);
    }
}

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', initializeUI);


  
