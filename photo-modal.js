/**
 * Módulo de Gestión de Fotos - Diseño Profesional (REVISADO)
 */
class PhotoManager {
    constructor() {
        // 1. Selección de elementos del DOM
        this.elements = {
            modal: document.getElementById('photo-modal-overlay'),
            btnOpen: document.getElementById('btn-open-photo-modal'),
            btnClose: document.getElementById('btn-close-modal'),
            btnTriggerUpload: document.getElementById('btn-trigger-upload'),
            // Aseguramos que el dropZone y el input file se mapean correctamente
            dropZone: document.getElementById('drop-zone'),
            fileInput: document.getElementById('file-input'), 
            gallery: document.getElementById('photo-gallery'),
            latestContainer: document.getElementById('latest-photo-container'),
            dateInput: document.getElementById('photo-date'),
            typeSelect: document.getElementById('photo-type')
        };

        // 2. Estado inicial
        // Nota: Si has cambiado la clave de localStorage, las fotos antiguas no se mostrarán
        this.photos = JSON.parse(localStorage.getItem('nutriPlanPhotosProf')) || [];
        this.elements.dateInput.valueAsDate = new Date();

        // 3. Iniciar listeners
        this.initEventListeners();
        
        // 4. Renderizar galería inicial
        this.renderGallery();
    }

    initEventListeners() {
        // Abrir Modal (Con stopPropagation para evitar interferencias de elementos padres)
        this.elements.btnOpen.addEventListener('click', (e) => {
            e.stopPropagation(); 
            this.toggleModal(true);
        });
        
        // Cerrar Modal
        this.elements.btnClose.addEventListener('click', () => this.toggleModal(false));
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.toggleModal(false);
        });

        // Trigger del botón "Subir Fotos" al input file oculto (CORRECCIÓN CLAVE AQUÍ)
        this.elements.btnTriggerUpload.addEventListener('click', (e) => {
            e.stopPropagation(); // Detiene la propagación del evento
            this.elements.fileInput.click(); // Fuerza la apertura del file picker
        });

        // Manejo del archivo seleccionado
        this.elements.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        
        // Manejo del Drag & Drop (Las funciones preventDefaults están bien implementadas)
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
                    image: e.target.result, 
                    date: this.elements.dateInput.value,
                    type: this.elements.typeSelect.value,
                    typeName: this.elements.typeSelect.options[this.elements.typeSelect.selectedIndex].text
                };

                this.photos.unshift(newPhoto); 
                this.saveToStorage();
                this.renderGallery();
            };
            reader.readAsDataURL(file);
        } else {
            // Se puede mejorar la gestión de errores aquí
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
        galleryContainer.innerHTML = '';
        latestContainer.innerHTML = '';

        if (this.photos.length === 0) {
            galleryContainer.innerHTML = `<div class="empty-state-card">No hay fotos en el historial.</div>`;
            latestContainer.innerHTML = `<div class="empty-placeholder"><img src="https://via.placeholder.com/400x300?text=Sin+Foto+Reciente" alt="Placeholder"></div>`;
            return;
        }

        // Renderizar la última foto en el contenedor principal
        const latestPhoto = this.photos[0];
        latestContainer.innerHTML = `
            <img src="${latestPhoto.image}" alt="Última foto ${latestPhoto.typeName}">
        `;

        // Renderizar el resto en la galería
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

let photoManager; 
document.addEventListener('DOMContentLoaded', () => {
    photoManager = new PhotoManager();
});
