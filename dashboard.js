/**
 * Módulo Principal del Dashboard - Seguimiento Visual Corporal
 * Versión modular y mejorada
 */

class DashboardManager {
    constructor() {
        // Estado inicial
        this.state = {
            photos: this.loadFromStorage('dashboardPhotos') || [],
            metrics: this.loadFromStorage('dashboardMetrics') || this.getDefaultMetrics(),
            currentView: 'photos',
            isSidebarCollapsed: this.loadFromStorage('sidebarCollapsed') === 'true',
            notifications: []
        };

        // Configuración
        this.config = {
            maxFileSize: 5 * 1024 * 1024, // 5MB
            supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
            localStorageKeys: {
                photos: 'dashboardPhotos',
                metrics: 'dashboardMetrics',
                sidebar: 'sidebarCollapsed'
            }
        };

        // Inicializar después de que el DOM esté listo
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupInitialState();
        this.renderDashboard();
        this.setupCharts();
        
        console.log('Dashboard Manager inicializado');
    }

    cacheElements() {
        // Contenedores principales
        this.elements = {
            dashboardModal: document.getElementById('dashboard-modal'),
            openDashboardBtn: document.getElementById('btn-open-dashboard'),
            closeDashboardBtn: document.getElementById('btn-close-dashboard'),
            dashboardContainer: document.querySelector('.dashboard-container'),
            
            // Sidebar
            menuToggle: document.getElementById('menu-toggle'),
            sidebar: document.querySelector('.sidebar-left'),
            photoTypeSelect: document.getElementById('photo-type'),
            photoDateInput: document.getElementById('photo-date'),
            uploadBtn: document.getElementById('btn-trigger-upload'),
            fileInput: document.getElementById('file-input'),
            dropZone: document.getElementById('drop-zone'),
            menuItems: document.querySelectorAll('.menu-item'),
            
            // Contenido principal
            lastPhotoDate: document.getElementById('last-photo-date'),
            frontalGrid: document.getElementById('frontal-grid'),
            metricsTableBody: document.getElementById('metrics-table-body'),
            resultsChart: document.getElementById('results-chart'),
            progressChart: document.getElementById('progress-chart'),
            
            // Footer
            saveBtn: document.getElementById('btn-save-dashboard'),
            
            // Modal de foto
            photoModal: document.getElementById('photo-modal'),
            closePhotoModalBtn: document.getElementById('btn-close-photo-modal'),
            photoModalTitle: document.getElementById('photo-modal-title'),
            photoModalImage: document.getElementById('photo-modal-image'),
            photoModalType: document.getElementById('photo-modal-type'),
            photoModalDate: document.getElementById('photo-modal-date'),
            photoModalDimensions: document.getElementById('photo-modal-dimensions')
        };
    }

    setupEventListeners() {
        // Apertura y cierre del dashboard
        this.elements.openDashboardBtn?.addEventListener('click', () => this.openDashboard());
        this.elements.closeDashboardBtn?.addEventListener('click', () => this.closeDashboard());
        
        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!this.elements.photoModal.classList.contains('hidden')) {
                    this.closePhotoModal();
                } else if (!this.elements.dashboardModal.classList.contains('hidden')) {
                    this.closeDashboard();
                }
            }
        });

        // Sidebar
        this.elements.menuToggle?.addEventListener('click', () => this.toggleSidebar());
        
        // Navegación del menú
        this.elements.menuItems?.forEach(item => {
            item.addEventListener('click', (e) => this.handleMenuClick(e));
        });

        // Subida de fotos
        this.elements.uploadBtn?.addEventListener('click', () => this.elements.fileInput?.click());
        this.elements.fileInput?.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Drag and drop
        this.setupDragAndDrop();
        
        // Guardar dashboard
        this.elements.saveBtn?.addEventListener('click', () => this.saveDashboard());
        
        // Modal de foto
        this.elements.closePhotoModalBtn?.addEventListener('click', () => this.closePhotoModal());
        
        // Cerrar modales al hacer clic fuera
        this.elements.dashboardModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.dashboardModal) this.closeDashboard();
        });
        
        this.elements.photoModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.photoModal) this.closePhotoModal();
        });
        
        // Fecha por defecto
        if (this.elements.photoDateInput) {
            this.elements.photoDateInput.valueAsDate = new Date();
        }
    }

    setupInitialState() {
        // Estado inicial del sidebar
        if (this.state.isSidebarCollapsed) {
            this.elements.sidebar?.classList.add('collapsed');
        }
        
        // Inicializar drop zone
        if (this.elements.dropZone) {
            this.elements.dropZone.classList.remove('hidden');
        }
    }

    setupDragAndDrop() {
        const dropZone = this.elements.dropZone;
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            }, false);
        });

        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload({ target: { files } });
            }
        });
    }

    openDashboard() {
        this.elements.dashboardModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        this.renderDashboard();
    }

    closeDashboard() {
        this.elements.dashboardModal.classList.add('hidden');
        document.body.style.overflow = '';
        this.saveToStorage();
    }

    toggleSidebar() {
        this.elements.sidebar.classList.toggle('collapsed');
        this.state.isSidebarCollapsed = this.elements.sidebar.classList.contains('collapsed');
        this.saveToStorage(this.config.localStorageKeys.sidebar, this.state.isSidebarCollapsed);
    }

    handleMenuClick(event) {
        const menuItem = event.currentTarget;
        const view = menuItem.dataset.view;
        
        // Actualizar estado
        this.state.currentView = view;
        
        // Actualizar UI
        this.elements.menuItems?.forEach(item => item.classList.remove('active'));
        menuItem.classList.add('active');
        
        // Mostrar/ocultar secciones
        this.renderView(view);
    }

    renderView(view) {
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active-view');
        });
        
        // Mostrar sección activa
        const activeSection = document.querySelector(`.${view}-section`);
        if (activeSection) {
            activeSection.classList.add('active-view');
        }
    }

    async handleFileUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        
        // Validar archivo
        if (!this.validateFile(file)) {
            this.showNotification('Archivo no válido. Solo imágenes JPG, PNG o WebP hasta 5MB.', 'error');
            return;
        }

        // Validar campos requeridos
        if (!this.elements.photoDateInput?.value) {
            this.showNotification('Por favor, selecciona una fecha de toma.', 'warning');
            return;
        }

        try {
            // Procesar imagen
            const imageData = await this.processImage(file);
            
            // Crear objeto de foto
            const newPhoto = {
                id: Date.now(),
                ...imageData,
                date: this.elements.photoDateInput.value,
                type: this.elements.photoTypeSelect?.value || 'frontal',
                typeName: this.getTypeName(this.elements.photoTypeSelect?.value || 'frontal')
            };

            // Actualizar estado
            this.state.photos.unshift(newPhoto);
            this.updateMetrics();
            
            // Guardar y renderizar
            this.saveToStorage();
            this.renderDashboard();
            
            // Mostrar notificación
            this.showNotification('Foto subida correctamente', 'success');
            
            // Limpiar input
            event.target.value = '';
            
        } catch (error) {
            console.error('Error al procesar la imagen:', error);
            this.showNotification('Error al procesar la imagen', 'error');
        }
    }

    validateFile(file) {
        // Validar formato
        if (!this.config.supportedFormats.includes(file.type)) {
            return false;
        }

        // Validar tamaño
        if (file.size > this.config.maxFileSize) {
            return false;
        }

        return true;
    }

    processImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const dimensions = await this.getImageDimensions(e.target.result);
                    
                    resolve({
                        image: e.target.result,
                        size: file.size,
                        dimensions,
                        filename: file.name,
                        uploadDate: new Date().toISOString()
                    });
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsDataURL(file);
        });
    }

    getImageDimensions(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };
            img.src = dataUrl;
        });
    }

    getTypeName(type) {
        const types = {
            'frontal': 'Frontal Relajado',
            'perfil': 'Perfil',
            'espalda': 'Espalda'
        };
        return types[type] || 'Desconocido';
    }

    updateMetrics() {
        // Actualizar métricas basadas en las fotos
        const totalPhotos = this.state.photos.length;
        
        this.state.metrics = {
            lastPhotoDate: this.state.photos[0]?.date || null,
            totalPhotos,
            progress: {
                masaGrasa: Math.max(15, 28 - (totalPhotos * 0.5)),
                masaMuscular: Math.min(45, 35 + (totalPhotos * 0.3)),
                sumatorioPliegues: Math.max(90, 120 - (totalPhotos * 2))
            }
        };
    }

    getDefaultMetrics() {
        return {
            lastPhotoDate: null,
            totalPhotos: 0,
            progress: {
                masaGrasa: 28,
                masaMuscular: 35,
                sumatorioPliegues: 120
            }
        };
    }

    renderDashboard() {
        this.renderFrontalSection();
        this.renderMetricsTable();
        this.updateLastPhotoDate();
        this.setupCharts();
    }

    renderFrontalSection() {
        if (!this.elements.frontalGrid) return;

        const frontalPhotos = this.state.photos.filter(photo => photo.type === 'frontal');
        
        if (frontalPhotos.length === 0) {
            this.elements.frontalGrid.innerHTML = `
                <div class="date-card empty-state">
                    <div class="date-label">No hay fotos disponibles</div>
                    <div class="photo-placeholder empty">
                        <span class="placeholder-text">Sube tu primera foto frontal</span>
                    </div>
                </div>
            `;
            return;
        }

        // Mostrar las últimas 5 fotos frontales
        const recentPhotos = frontalPhotos.slice(0, 5);
        
        this.elements.frontalGrid.innerHTML = recentPhotos.map((photo, index) => `
            <div class="date-card" data-photo-id="${photo.id}">
                <div class="date-label">${this.formatDate(photo.date)}</div>
                <div class="photo-placeholder has-image" 
                     style="background-image: url('${photo.image}')"
                     onclick="dashboardManager.viewPhoto(${photo.id})">
                    <div class="photo-overlay">
                        <button class="view-btn" onclick="dashboardManager.viewPhoto(${photo.id}); event.stopPropagation()" 
                                title="Ver foto">
                            👁️
                        </button>
                        <button class="delete-btn" onclick="dashboardManager.deletePhoto(${photo.id}); event.stopPropagation()" 
                                title="Eliminar foto">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderMetricsTable() {
        if (!this.elements.metricsTableBody) return;

        const metricsData = [
            { name: 'Masa Grasa', initial: '28%', current: `${this.state.metrics.progress.masaGrasa.toFixed(1)}%`, trend: 'down' },
            { name: 'Masa Muscular', initial: '35 kg', current: `${this.state.metrics.progress.masaMuscular.toFixed(1)} kg`, trend: 'up' },
            { name: 'Sumatorio Pliegues', initial: '120 mm', current: `${this.state.metrics.progress.sumatorioPliegues.toFixed(0)} mm`, trend: 'down' }
        ];

        this.elements.metricsTableBody.innerHTML = metricsData.map(metric => `
            <tr>
                <td>${metric.name}</td>
                <td>${metric.initial}</td>
                <td class="metric-value ${metric.trend}">${metric.current}</td>
            </tr>
        `).join('');
    }

    updateLastPhotoDate() {
        if (!this.elements.lastPhotoDate) return;
        
        if (this.state.photos.length > 0) {
            const lastPhoto = this.state.photos[0];
            this.elements.lastPhotoDate.textContent = this.formatDate(lastPhoto.date);
        } else {
            this.elements.lastPhotoDate.textContent = '-';
        }
    }

    setupCharts() {
        this.renderResultsChart();
        this.renderProgressChart();
    }

    renderResultsChart() {
        if (!this.elements.resultsChart) return;

        const chartData = [
            { label: '12/03', value: 45 },
            { label: '13/04', value: 30 },
            { label: '15/06', value: 20 },
            { label: '9/08', value: 90 },
            { label: '5/08', value: 50 }
        ];

        // Ajustar valores basados en las fotos
        const photoCount = this.state.photos.length;
        if (photoCount > 0) {
            chartData[3].value = Math.min(100, 20 + photoCount * 10);
        }

        this.elements.resultsChart.innerHTML = chartData.map(item => `
            <div class="bar-group" onclick="dashboardManager.showChartTooltip('${item.label}', ${item.value})">
                <div class="bar" style="height: ${item.value}%"></div>
                <div class="bar-label">${item.label}</div>
            </div>
        `).join('');
    }

    renderProgressChart() {
        if (!this.elements.progressChart) return;

        const progressData = [
            { label: '13/00', value: 90 },
            { label: '12/00', value: 86 },
            { label: '12/00', value: 80 },
            { label: '15/00', value: 100 },
            { label: '12/00', value: 90 },
            { label: '12/00', value: 85 }
        ];

        // Ajustar valores basados en el progreso
        const progress = this.calculateOverallProgress();
        if (progress > 0) {
            progressData[3].value = Math.min(100, progress);
        }

        this.elements.progressChart.innerHTML = progressData.map(item => `
            <div class="value-row" onclick="dashboardManager.showChartTooltip('${item.label}', ${item.value})">
                <span class="value-label">${item.label}</span>
                <span class="value">${item.value}</span>
            </div>
        `).join('');
    }

    calculateOverallProgress() {
        if (this.state.photos.length === 0) return 0;
        
        const maxProgress = 100;
        const baseProgress = Math.min(70, this.state.photos.length * 10);
        const metricProgress = this.calculateMetricProgress();
        
        return Math.min(maxProgress, baseProgress + metricProgress);
    }

    calculateMetricProgress() {
        let progress = 0;
        const metrics = this.state.metrics.progress;
        
        if (metrics.masaGrasa < 25) progress += 10;
        if (metrics.masaMuscular > 36) progress += 10;
        if (metrics.sumatorioPliegues < 110) progress += 10;
        
        return progress;
    }

    viewPhoto(photoId) {
        const photo = this.state.photos.find(p => p.id === photoId);
        if (!photo) return;

        // Actualizar modal
        this.elements.photoModalTitle.textContent = `${photo.typeName} - ${this.formatDate(photo.date)}`;
        this.elements.photoModalImage.src = photo.image;
        this.elements.photoModalImage.alt = `Foto ${photo.typeName}`;
        this.elements.photoModalType.textContent = photo.typeName;
        this.elements.photoModalDate.textContent = this.formatDate(photo.date);
        this.elements.photoModalDimensions.textContent = `${photo.dimensions?.width || '?'} × ${photo.dimensions?.height || '?'} px`;

        // Mostrar modal
        this.elements.photoModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closePhotoModal() {
        this.elements.photoModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    deletePhoto(photoId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta foto?')) return;

        // Eliminar foto
        this.state.photos = this.state.photos.filter(p => p.id !== photoId);
        
        // Actualizar métricas
        this.updateMetrics();
        
        // Guardar y renderizar
        this.saveToStorage();
        this.renderDashboard();
        
        // Mostrar notificación
        this.showNotification('Foto eliminada correctamente', 'success');
    }

    saveDashboard() {
        this.saveToStorage();
        this.showNotification('Dashboard guardado correctamente', 'success');
    }

    // Utilidades de almacenamiento
    loadFromStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error al cargar ${key}:`, error);
            return null;
        }
    }

    saveToStorage(key = null, value = null) {
        try {
            if (key && value !== null) {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                // Guardar todo
                localStorage.setItem(this.config.localStorageKeys.photos, JSON.stringify(this.state.photos));
                localStorage.setItem(this.config.localStorageKeys.metrics, JSON.stringify(this.state.metrics));
                localStorage.setItem(this.config.localStorageKeys.sidebar, JSON.stringify(this.state.isSidebarCollapsed));
            }
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            this.showNotification('Error al guardar datos. Espacio de almacenamiento insuficiente.', 'error');
        }
    }

    // Utilidades de UI
    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${this.getNotificationIcon(type)}</span>
            <span class="notification-text">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        // Añadir al documento
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    showChartTooltip(label, value) {
        this.showNotification(`${label}: ${value}`, 'info');
    }

    // Métodos públicos para acceso desde HTML
    getStats() {
        return {
            totalPhotos: this.state.photos.length,
            lastUpload: this.state.photos[0] ? this.formatDate(this.state.photos[0].date) : 'Nunca',
            progress: this.calculateOverallProgress()
        };
    }
}

// Inicializar cuando el DOM esté listo
let dashboardManager;

document.addEventListener('DOMContentLoaded', () => {
    dashboardManager = new DashboardManager();
    window.dashboardManager = dashboardManager;
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardManager };
}
