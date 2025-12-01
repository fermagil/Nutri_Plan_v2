/**
 * Módulo de Gestión de Fotos - Diseño Profesional (VERSIÓN FINAL)
 * Encargado de la lógica de abrir/cerrar modal, carga de fotos, persistencia 
 * en localStorage y renderizado en galería y vista principal.
 */
class PhotoManager {
    constructor() {
        // 1. Selección de elementos del DOM
        this.elements = {
            modal: document.getElementById('photo-modal-overlay'),
            btnOpen: document.getElementById('btn-open-photo-modal'),
            btnClose: document.getElementById('btn-close-modal'),
            btnTriggerUpload: document.getElementById('btn-trigger-upload'),
            dropZone: document.getElementById('drop-zone'),
            fileInput: document.getElementById('file-input'), 
            gallery: document.getElementById('photo-gallery'),
            latestContainer: document.getElementById('latest-photo-container'),
            dateInput: document.getElementById('photo-date'),
            typeSelect: document.getElementById('photo-type')
        };

        // 2. Estado inicial
        // Clave para almacenamiento persistente
        this.photos = JSON.parse(localStorage.getItem('nutriPlanPhotosProf')) || [];
        // Inicializar la fecha al día de hoy
        this.elements.dateInput.valueAsDate = new Date();

        // 3. Iniciar listeners
        this.initEventListeners();
        
        // 4. Renderizar galería inicial
        this.renderGallery();
    }

    initEventListeners() {
        // Listener para abrir Modal (Botón de la interfaz principal)
        this.elements.btnOpen.addEventListener('click', (e) => {
            e.stopPropagation(); 
            this.toggleModal(true);
        });
        
        // Listener para cerrar Modal (Botón X y click en overlay)
        this.elements.btnClose.addEventListener('click', () => this.toggleModal(false));
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.toggleModal(false);
        });

        // Listener para el botón "Subir Fotos" (Abre el file picker)
        this.elements.btnTriggerUpload.addEventListener('click', (e) => {
            e.stopPropagation(); 
            this.elements.fileInput.click(); 
        });

        // Manejo del archivo seleccionado
        this.elements.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        
        // Manejo del Drag & Drop (Si se llegara a hacer visible)
        const dz = this.elements.dropZone;
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dz.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
        });
        dz.addEventListener('drop', (e) => this.handleFiles(e.dataTransfer.files));
    }

    toggleModal(show) {
        this.elements.modal.classList.toggle('hidden', !show);
    }

    handleFiles(files) {
        const file = files[0];
        
        if (file && file.type.startsWith('image/')) {
            if (!this.elements.dateInput.value) {
                alert('Por favor, selecciona la fecha de la toma.');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const newPhoto = {
                    id: Date.now(), 
                    image: e.target.result, // Contiene la cadena Base64
                    date: this.elements.dateInput.value,
                    type: this.elements.typeSelect.value,
                    // Obtiene el texto visible de la opción seleccionada
                    typeName: this.elements.typeSelect.options[this.elements.typeSelect.selectedIndex].text
                };

                this.photos.unshift(newPhoto); // Añadir al inicio (más reciente)
                this.saveToStorage();
                this.renderGallery();
                // Limpiar el input para permitir subir el mismo archivo
                this.elements.fileInput.value = '';
            };
            
            reader.readAsDataURL(file);
        } else {
            if (files.length > 0) {
                 alert('El archivo seleccionado no es una imagen válida.');
            }
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('nutriPlanPhotosProf', JSON.stringify(this.photos));
        } catch (e) {
            console.error("Storage error", e);
            alert("Límite de almacenamiento local alcanzado.");
        }
    }

    renderGallery() {
        const galleryContainer = this.elements.gallery;
        const latestContainer = this.elements.latestContainer;
        
        // Limpiamos los contenedores
        galleryContainer.innerHTML = '';
        latestContainer.innerHTML = '';

        const mainTitle = document.querySelector('.photo-section .card-title');


        if (this.photos.length === 0) {
            // Estado vacío
            galleryContainer.innerHTML = `<div class="empty-state-card">No hay fotos en el historial.</div>`;
            
            // Placeholder en el contenedor principal
            latestContainer.innerHTML = `
                <div class="empty-placeholder">
                    <img src="https://via.placeholder.com/400x300?text=Sin+Foto+Reciente" alt="Placeholder">
                </div>`;
            
            if (mainTitle) {
                mainTitle.textContent = `FRONTAL RELAJADO (Última Toma)`;
            }
            return;
        }

        // 1. Renderizar la última foto en el contenedor principal
        const latestPhoto = this.photos[0];
        
        if (mainTitle) {
             mainTitle.textContent = `${latestPhoto.typeName.toUpperCase()} (Última Toma)`;
        }

        latestContainer.innerHTML = `
            <img src="${latestPhoto.image}" alt="Última foto ${latestPhoto.typeName}">
            <p class="latest-photo-caption" style="font-size: 0.8rem; color: #6b7280; text-align: center; margin-top: 10px;">
                Fecha: ${new Date(latestPhoto.date).toLocaleDateString()}
            </p>
        `;
        
        // 2. Renderizar todas las fotos en la galería histórica
        this.photos.forEach((photo) => {
            const card = document.createElement('div');
            card.className = 'photo-card';
            card.innerHTML = `
                <img src="${photo.image}" alt="Foto ${photo.typeName}">
                <div class="photo-info">
                    <div>
                        <div class="photo-date">${new Date(photo.date).toLocaleDateString()}</div>
                        <div class="photo-type">${photo.typeName}</div>
                    </div>
                    <button class="icon-btn-sm" onclick="photoManager.deletePhoto(${photo.id})" title="Eliminar">🗑️</button>
                </div>
            `;
            galleryContainer.appendChild(card);
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

// Inicializar la clase cuando el DOM esté listo
let photoManager; 
document.addEventListener('DOMContentLoaded', () => {
    photoManager = new PhotoManager();
});
