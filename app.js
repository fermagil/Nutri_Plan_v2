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
    await signInWithRedirect(auth, provider); // Use Redirect instead of Popup
  } catch (error) {
    let errorMessage;
    switch (error.code) {
      case 'auth/network-request-failed':
        errorMessage = 'Error de red. Verifica tu conexión e intenta de nuevo.';
        break;
      default:
        errorMessage = `Error al iniciar sesión: ${error.message}`;
    }
    console.error('Error al iniciar sesión:', error);
    alert(errorMessage);
    throw error;
  }
}
/ Handle redirect result
getRedirectResult(auth)
  .then((result) => {
    if (result) {
      const user = result.user;
      console.log('Usuario autenticado:', user.displayName, user.email);
      userInfo.textContent = `Bienvenido, ${user.displayName}`;
    }
  })
  .catch((error) => {
    console.error('Error en redirect:', error);
    alert('Error en el inicio de sesión: ' + error.message);
  });

// Manejar estado de autenticación
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    userInfo.textContent = `Bienvenido, ${user.displayName}`;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    form.style.display = 'block';
  } else {
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

clientesResultados.addEventListener('change', async () => {
  if (!currentUser) return;
  currentClienteId = clientesResultados.value;
  if (currentClienteId) {
    await cargarFechasTomas(currentClienteId);
    await cargarDatosUltimaToma(currentClienteId);
  }
});

// Nuevo cliente
nuevoClienteBtn.addEventListener('click', () => {
  if (!currentUser) return;
  currentClienteId = null;
  form.reset();
  seleccionarFecha.innerHTML = '<option value="">Seleccionar fecha...</option>';
  guardarDatosBtn.style.display = 'none';
  clientesResultados.style.display = 'none';
  document.getElementById('nombre').focus();
});

// Cargar fechas de tomas
async function cargarFechasTomas(clienteId) {
  if (!currentUser) return;
  const q = query(collection(db, `clientes/${clienteId}/tomas`), orderBy('fecha', 'desc'));
  const querySnapshot = await getDocs(q);
  let options = '<option value="">Seleccionar fecha...</option>';
  querySnapshot.forEach(doc => {
    const fecha = doc.data().fecha.toDate().toISOString().split('T')[0];
    options += `<option value="${doc.id}">${fecha}</option>`;
  });
  seleccionarFecha.innerHTML = options;
}

// Poblar formulario
async function populateForm(data) {
  document.getElementById('nombre').value = data.nombre || '';
  document.getElementById('fecha').value = data.fecha?.toDate().toISOString().split('T')[0] || '';
  document.getElementById('genero').value = data.genero || '';
  document.getElementById('edad').value = data.edad || '';
  document.getElementById('peso').value = data.peso || '';
  document.getElementById('altura').value = data.altura || '';
  document.getElementById('es_deportista').value = data.es_deportista || '';
  document.getElementById('grasa_actual_conocida').value = data.grasa_actual_conocida || '';
  document.getElementById('grasa_deseada').value = data.grasa_deseada || '';
  if (data.medidas) {
    document.getElementById('pliegue_tricipital').value = data.medidas.pliegues?.tricipital || '';
    document.getElementById('pliegue_subescapular').value = data.medidas.pliegues?.subescapular || '';
    document.getElementById('pliegue_suprailiaco').value = data.medidas.pliegues?.suprailiaco || '';
    document.getElementById('pliegue_bicipital').value = data.medidas.pliegues?.bicipital || '';
    document.getElementById('pliegue_pantorrilla').value = data.medidas.pliegues?.pantorrilla || '';
    document.getElementById('circ_cintura').value = data.medidas.circunferencias?.cintura || '';
    document.getElementById('circ_cadera').value = data.medidas.circunferencias?.cadera || '';
    document.getElementById('circ_cuello').value = data.medidas.circunferencias?.cuello || '';
    document.getElementById('circ_pantorrilla').value = data.medidas.circunferencias?.pantorrilla || '';
    document.getElementById('circ_brazo').value = data.medidas.circunferencias?.brazo || '';
    document.getElementById('circ_brazo_contraido').value = data.medidas.circunferencias?.brazo_contraido || '';
    document.getElementById('diam_humero').value = data.medidas.diametros?.humero || '';
    document.getElementById('diam_femur').value = data.medidas.diametros?.femur || '';
    document.getElementById('diam_muneca').value = data.medidas.diametros?.muneca || '';
  }
  if (data.resultados) {
    console.log('Resultados:', data.resultados);
  }
}

// Cargar datos de una toma
seleccionarFecha.addEventListener('change', async () => {
  if (!currentUser || !currentClienteId || !seleccionarFecha.value) return;
  const tomaDoc = await getDoc(doc(db, `clientes/${currentClienteId}/tomas`, seleccionarFecha.value));
  if (tomaDoc.exists()) {
    await populateForm(tomaDoc.data());
  }
});

// Cargar datos de la última toma
async function cargarDatosUltimaToma(clienteId) {
  if (!currentUser) return;
  const q = query(collection(db, `clientes/${clienteId}/tomas`), orderBy('fecha', 'desc'), limit(1));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const tomaDoc = querySnapshot.docs[0];
    seleccionarFecha.value = tomaDoc.id;
    await populateForm(tomaDoc.data());
  }
}

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
    resultados: {
      imc: parseFloat((peso / (altura / 100) ** 2).toFixed(2)),
    },
  };
  try {
    if (!currentClienteId) {
      const clienteRef = await addDoc(collection(db, 'clientes'), {
        nombre,
        genero: data.genero,
        fecha_creacion: new Date(),
        created_by: currentUser.uid,
      });
      currentClienteId = clienteRef.id;
    }
    await addDoc(collection(db, `clientes/${currentClienteId}/tomas`), data);
    alert('Datos guardados exitosamente.');
    await cargarFechasTomas(currentClienteId);
    guardarDatosBtn.style.display = 'none';
  } catch (error) {
    console.error('Error al guardar:', error);
    alert('Error al guardar los datos: ' + error.message);
  }
});
