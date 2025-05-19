import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, limit } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

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

// Referencias al formulario y elementos
const form = document.getElementById('anthropometry-form');
const buscarClienteInput = document.getElementById('buscar_cliente');
const nuevoClienteBtn = document.getElementById('nuevo_cliente');
const seleccionarFecha = document.getElementById('seleccionar_fecha');
const guardarDatosBtn = document.getElementById('guardar_datos');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
let currentClienteId = null;
let currentUser = null;

// Lista de elementos de resultados
const resultElementIds = [
  'result-imc',
  'result-icc',
  'result-grasa-pct-actual',
  'result-grasa-pct-actual-source',
  'result-grasa-pct-deseado',
  'result-grasa-pct-deseado-source',
  'result-masa-grasa',
  'result-mlg',
  'result-amb',
  'result-masa-osea',
  'result-masa-residual',
  'result-peso-ideal',
  'result-peso-objetivo',
  'result-mmt',
  'result-imlg',
  'result-img',
  'result-tipologia',
  'result-edadmetabolica',
  'result-edadmetabolica-source',
  'result-somatotipo'
];

// Crear select para resultados de búsqueda
let clientesResultados = document.getElementById('clientes_resultados');
if (!clientesResultados) {
  clientesResultados = document.createElement('select');
  clientesResultados.id = 'clientes_resultados';
  buscarClienteInput.insertAdjacentElement('afterend', clientesResultados);
}

// Función para iniciar sesión con Google
async function signInWithGoogle() {
  try {
    console.log('Initiating signInWithRedirect');
    await signInWithRedirect(auth, provider);
    console.log('Redirect initiated');
  } catch (error) {
    console.error('Sign-in error:', error.code, error.message);
    let errorMessage;
    switch (error.code) {
      case 'auth/network-request-failed':
        errorMessage = 'Error de red. Verifica tu conexión e intenta de nuevo.';
        break;
      case 'auth/unauthorized-domain':
        errorMessage = 'Dominio no autorizado. Verifica la configuración en Firebase.';
        break;
      default:
        errorMessage = `Error al iniciar sesión: ${error.message}`;
    }
    alert(errorMessage);
    throw error;
  }
}

// Manejar resultado del redirect
getRedirectResult(auth)
  .then((result) => {
    console.log('Redirect result:', result);
    if (result) {
      const user = result.user;
      console.log('Usuario autenticado:', user.displayName, user.email, user.uid);
      userInfo.textContent = `Bienvenido, ${user.displayName}`;
    } else {
      console.log('No redirect result');
    }
  })
  .catch((error) => {
    console.error('Redirect error:', error.code, error.message);
    let errorMessage;
    switch (error.code) {
      case 'auth/unauthorized-domain':
        errorMessage = 'Dominio no autorizado. Verifica la configuración en Firebase.';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Credenciales inválidas. Intenta de nuevo.';
        break;
      default:
        errorMessage = `Error en el redirect: ${error.message}`;
    }
    alert(errorMessage);
  });

// Manejar estado de autenticación
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    console.log('Auth state: User signed in', user.displayName, user.email);
    userInfo.textContent = `Bienvenido, ${user.displayName}`;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    form.style.display = 'block';
  } else {
    console.log('Auth state: No user signed in');
    userInfo.textContent = 'Por favor, inicia sesión';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    form.style.display = 'none';
    clientesResultados.style.display = 'none';
    seleccionarFecha.innerHTML = '<option value="">Seleccionar fecha...</option>';
    currentClienteId = null;
  }
});

// Iniciar sesión con Google al hacer clic en el botón
loginBtn.addEventListener('click', async () => {
  console.log('Login button clicked');
  await signInWithGoogle();
});

// Cerrar sesión
logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    console.log('Sesión cerrada');
    alert('Has cerrado sesión exitosamente.');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    alert('Error al cerrar sesión: ' + error.message);
  }
});

// Búsqueda de clientes
buscarClienteInput.addEventListener('input', async () => {
  if (!currentUser) return;
  const searchTerm = buscarClienteInput.value.trim().toLowerCase();
  clientesResultados.innerHTML = '<option value="">Seleccionar cliente...</option>';
  if (searchTerm.length < 2) {
    seleccionarFecha.innerHTML = '<option value="">Seleccionar fecha...</option>';
    clientesResultados.style.display = 'none';
    return;
  }
  clientesResultados.style.display = 'block';
  const q = query(collection(db, 'clientes'), where('nombre', '>=', searchTerm), where('nombre', '<=', searchTerm + '\uf8ff'));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(doc => {
    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = doc.data().nombre;
    clientesResultados.appendChild(option);
  });
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
    resultados: window.calculatedResults || {} // Usar resultados calculados de calculations.js
  };
  try {
    console.log('Datos a guardar:', JSON.stringify(data, null, 2));
    if (!currentClienteId) {
      const clienteRef = await addDoc(collection(db, 'clientes'), {
        nombre,
        genero: data.genero,
        fecha_creacion: new Date(),
        created_by: currentUser.uid,
      });
      currentClienteId = clienteRef.id;
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

// Cargar fechas de tomas (función auxiliar, asumida del código original)
async function cargarFechasTomas(clienteId) {
  if (!clienteId) return;
  seleccionarFecha.innerHTML = '<option value="">Seleccionar fecha...</option>';
  const q = query(collection(db, `clientes/${clienteId}/tomas`), orderBy('fecha', 'desc'));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(doc => {
    const option = document.createElement('option');
    option.value = doc.id;
    const fecha = doc.data().fecha.toDate ? doc.data().fecha.toDate().toLocaleString() : new Date(doc.data().fecha).toLocaleString();
    option.textContent = fecha;
    seleccionarFecha.appendChild(option);
  });
}
