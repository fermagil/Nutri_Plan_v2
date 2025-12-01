/**
 * Módulo de Gestión de Fotos Antropométricas
 * Clase modular para encapsular la lógica del modal, carga y renderizado.
 */
class PhotoManager {
    constructor() {
        // 1. Selección de elementos del DOM
        this.elements = {
            modal: document.getElementById('photo-modal-overlay'),
            btnOpen: document.getElementById('btn-open-photo-modal'),
            btnClose: document.getElementById('btn-close-modal'),
            dropZone: document.getElementById('drop-zone'),
            fileInput: document.getElementById('file-input'),
            gallery: document.getElementById('photo-gallery'),
            dateInput: document.getElementById('photo-date'),
            typeSelect: document.getElementById('photo-type')
        };

        // 2. Estado inicial
        // Carga fotos previas de localStorage (simulación de persistencia)
        this.photos = JSON.parse(localStorage.getItem('nutriPlanPhotos')) || [];
        
        // Inicializar fecha actual por defecto
        this.elements.dateInput.valueAsDate = new Date();

        // 3. Iniciar listeners
        this.initEventListeners();
        
        // 4. Renderizar galería inicial
        this.renderGallery();
    }

    initEventListeners() {
        // Abrir Modal con detención de propagación (EVITA PROBLEMAS CON OTROS MODALES)
        this.elements.btnOpen.addEventListener('click', (e) => {
            e.stopPropagation(); 
            this.toggleModal(true);
        });
        
        // Cerrar Modal
        this.elements.btnClose.addEventListener('click', () => this.toggleModal(false));
        
        // Cerrar si clic fuera del contenido del modal
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.toggleModal(false);
        });

        // Manejo del Drag & Drop
        const dz = this.elements.dropZone;
        
        // Prevenir comportamiento por defecto del navegador
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dz.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Efectos visuales al arrastrar
        ['dragenter', 'dragover'].forEach(name => {
            dz.addEventListener(name, () => dz.classList.add('dragover'), false);
        });
        ['dragleave', 'drop'].forEach(name => {
            dz.addEventListener(name, () => dz.classList.remove('dragover'), false);
        });

        // Evento Drop y Click
        dz.addEventListener('drop', (e) => this.handleDrop(e));
        dz.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
    }

    toggleModal(show) {
        if (show) {
            this.elements.modal.classList.remove('hidden');
        } else {
            this.elements.modal.classList.add('hidden');
        }
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        this.handleFiles(files);
    }

    handleFiles(files) {
        const file = files[0];
        if (file && file.type.startsWith('image/')) {
            if (!this.elements.dateInput.value) {
                alert('Por favor, selecciona la fecha de la toma antes de subir la foto.');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const newPhoto = {
                    id: Date.now(), 
                    image: e.target.result, 
                    date: this.elements.dateInput.value,
                    type: this.elements.typeSelect.value
                };

                // Añadir al principio para mostrar la más reciente primero
                this.photos.unshift(newPhoto); 
                this.saveToStorage();
                this.renderGallery();
            };
            
            reader.readAsDataURL(file);
        } else {
            alert('Por favor, sube un archivo de imagen válido.');
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('nutriPlanPhotos', JSON.stringify(this.photos));
        } catch (e) {
            console.error("Quota exceeded or storage error", e);
            alert("Límite de almacenamiento local alcanzado (Demo).");
        }
    }

    renderGallery() {
        const container = this.elements.gallery;
        container.innerHTML = ''; 

        if (this.photos.length === 0) {
            container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; text-align: center; color: #888; padding: 2rem;">No hay fotos registradas. ¡Sube la primera!</div>`;
            return;
        }

        this.photos.forEach(photo => {
            const card = document.createElement('div');
            card.className = 'photo-card';
            
            card.innerHTML = `
                <span class="badge badge-${photo.type}">${photo.type}</span>
                <img src="${photo.image}" alt="Foto ${photo.type}">
                <div class="photo-info">
                    <strong>📅 ${photo.date}</strong>
                    <button class="btn-delete" onclick="photoManager.deletePhoto(${photo.id})" title="Eliminar foto">🗑️</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    deletePhoto(id) {
        if(confirm('¿Estás seguro de que quieres eliminar esta foto del historial?')) {
            this.photos = this.photos.filter(p => p.id !== id);
            this.saveToStorage();
            this.renderGallery();
        }
    }
}

// Inicializar la clase cuando el DOM esté completamente cargado
let photoManager; 

document.addEventListener('DOMContentLoaded', () => {
    photoManager = new PhotoManager();
});
