/**
 * Módulo de Gestión de Fotos Antropométricas
 * Encapsula toda la lógica del modal, carga y renderizado.
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
        // Intentamos cargar fotos previas del localStorage
        this.photos = JSON.parse(localStorage.getItem('nutriPlanPhotos')) || [];
        
        // Inicializar fecha actual por defecto
        this.elements.dateInput.valueAsDate = new Date();

        // 3. Iniciar listeners
        this.initEventListeners();
        
        // 4. Renderizar galería inicial
        this.renderGallery();
    }

    initEventListeners() {
        // Abrir/Cerrar Modal
        this.elements.btnOpen.addEventListener('click', () => this.toggleModal(true));
        this.elements.btnClose.addEventListener('click', () => this.toggleModal(false));
        
        // Cerrar si clic fuera del contenido
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.toggleModal(false);
        });

        // Manejo del Drag & Drop
        const dz = this.elements.dropZone;
        
        // Prevenir comportamiento por defecto
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
        // Procesar solo la primera imagen para este ejemplo
        const file = files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                // Crear objeto de foto
                const newPhoto = {
                    id: Date.now(), // ID único simple
                    image: e.target.result, // Base64 de la imagen
                    date: this.elements.dateInput.value,
                    type: this.elements.typeSelect.value
                };

                // Guardar en estado y localStorage
                this.photos.unshift(newPhoto); // Añadir al principio
                this.saveToStorage();
                
                // Re-renderizar
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
        container.innerHTML = ''; // Limpiar

        if (this.photos.length === 0) {
            container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; text-align: center; color: #888; padding: 2rem;">No hay fotos registradas. ¡Sube la primera!</div>`;
            return;
        }

        // Agrupar fotos por fecha (opcional, para mejor orden visual)
        // Aquí renderizamos un grid simple
        this.photos.forEach(photo => {
            const card = document.createElement('div');
            card.className = 'photo-card';
            
            card.innerHTML = `
                <span class="badge badge-${photo.type}">${photo.type}</span>
                <img src="${photo.image}" alt="Foto ${photo.type}">
                <div class="photo-info">
                    <strong>📅 ${photo.date}</strong>
                    <button class="btn-delete" onclick="photoManager.deletePhoto(${photo.id})" style="float:right; color:red; border:none; background:none; cursor:pointer;">🗑️</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    deletePhoto(id) {
        if(confirm('¿Borrar esta foto?')) {
            this.photos = this.photos.filter(p => p.id !== id);
            this.saveToStorage();
            this.renderGallery();
        }
    }
}

// Inicializar la clase cuando el DOM esté listo
let photoManager; // Variable global expuesta para poder llamar a métodos desde HTML (ej. deletePhoto)

document.addEventListener('DOMContentLoaded', () => {
    photoManager = new PhotoManager();
});
