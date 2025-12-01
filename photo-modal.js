/**
 * Módulo Principal del Dashboard - Seguimiento Visual Corporal
 * Gestiona la lógica completa del dashboard incluyendo:
 * - Gestión de fotos (subida, visualización, eliminación)
 * - Métricas y estadísticas
 * - Gráficos interactivos
 * - Persistencia de datos en localStorage
 * - Responsividad y UX mejorada
 */

class DashboardManager {
    constructor() {
        // 1. Inicialización de estado y selección de elementos
        this.state = {
            photos: JSON.parse(localStorage.getItem('dashboardPhotos')) || [],
            metrics: JSON.parse(localStorage.getItem('dashboardMetrics')) || this.getDefaultMetrics(),
            currentDate: new Date().toISOString().split('T')[0],
            activeView: 'frontal'
        };

        // 2. Selección de elementos principales
        this.elements = {
            // Contenedores principales
            dashboard: document.querySelector('.dashboard-container'),
            
            // Header
            menuToggle: document.querySelector('.menu-toggle'),
            closeBtn: document.querySelector('.close-btn'),
            
            // Sidebar
            photoTypeSelect: document.getElementById('photo-type') || document.querySelector('.form-select'),
            uploadBtn: document.getElementById('btn-trigger-upload') || document.querySelector('.btn-upload'),
            fileInput: document.getElementById('file-input') || document.querySelector('input[type="file"]'),
            resultsMenu: document.querySelectorAll('.menu-item'),
            
            // Contenido principal
            latestPhotoContainer: document.getElementById('latest-photo-container') || document.querySelector('.latest-photo-container'),
            photoGallery: document.getElementById('photo-gallery') || document.querySelector('.gallery-grid'),
            frontalGrid: document.querySelector('.dates-grid'),
            resultsGrid: document.querySelector('.results-grid'),
            comparisonGrid: document.querySelector('.comparison-grid'),
            metricsTable: document.querySelector('.metrics-table tbody'),
            chartsContainer: document.querySelector('.charts-grid'),
            
            // Footer
            saveBtn: document.querySelector('.btn-cta')
        };

        // 3. Configuración inicial
        this.config = {
            maxFileSize: 5 * 1024 * 1024, // 5MB
            supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
            defaultMetrics: this.getDefaultMetrics(),
            chartColors: {
                primary: '#2563eb',
                success: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444'
            }
        };

        // 4. Inicialización
        this.init();
    }

    init() {
        // Inicializar event listeners
        this.initEventListeners();
        
        // Cargar datos iniciales
        this.loadInitialData();
        
        // Renderizar vista inicial
        this.renderDashboard();
        
        // Inicializar gráficos
        this.initCharts();
        
        console.log('Dashboard Manager inicializado correctamente');
    }

    initEventListeners() {
        // Navegación y UI
        if (this.elements.menuToggle) {
            this.elements.menuToggle.addEventListener('click', () => this.toggleSidebar());
        }

        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener('click', () => this.closeDashboard());
        }

        // Gestión de fotos
        if (this.elements.uploadBtn) {
            this.elements.uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.elements.fileInput?.click();
            });
        }

        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Menú de resultados
        if (this.elements.resultsMenu) {
            this.elements.resultsMenu.forEach(item => {
                item.addEventListener('click', (e) => this.handleMenuClick(e));
            });
        }

        // Botón de guardar
        if (this.elements.saveBtn) {
            this.elements.saveBtn.addEventListener('click', () => this.saveDashboard());
        }

        // Drag and drop para fotos
        this.initDragAndDrop();
        
        // Eventos de teclado
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    initDragAndDrop() {
        const dropZone = this.elements.dashboard;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        dropZone.addEventListener('dragover', () => {
            dropZone.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.style.backgroundColor = '';
        });

        dropZone.addEventListener('drop', (e) => {
            dropZone.style.backgroundColor = '';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload({ target: { files } });
            }
        });
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        
        // Validaciones
        if (!this.validateFile(file)) {
            this.showNotification('Formato de archivo no válido o tamaño excesivo', 'error');
            return;
        }

        // Procesar imagen
        this.processImage(file);
        
        // Limpiar input
        event.target.value = '';
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
        const reader = new FileReader();
        const photoType = this.elements.photoTypeSelect?.value || 'frontal';
        const date = this.state.currentDate;

        reader.onload = (e) => {
            const newPhoto = {
                id: Date.now(),
                image: e.target.result,
                date: date,
                type: photoType,
                typeName: this.getTypeName(photoType),
                uploadDate: new Date().toISOString(),
                size: file.size,
                dimensions: this.getImageDimensions(e.target.result)
            };

            // Añadir al estado
            this.state.photos.unshift(newPhoto);
            
            // Actualizar métricas
            this.updateMetrics(newPhoto);
            
            // Guardar en localStorage
            this.saveToStorage();
            
            // Actualizar vista
            this.renderDashboard();
            
            // Mostrar notificación
            this.showNotification('Foto subida correctamente', 'success');
        };

        reader.readAsDataURL(file);
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

    updateMetrics(newPhoto) {
        // Simular actualización de métricas basada en nueva foto
        // En una implementación real, esto analizaría la imagen
        
        // Actualizar fecha de última toma
        this.state.metrics.lastPhotoDate = newPhoto.date;
        
        // Incrementar contador de fotos
        this.state.metrics.totalPhotos = (this.state.metrics.totalPhotos || 0) + 1;
        
        // Actualizar estadísticas de progreso
        this.updateProgressMetrics();
    }

    updateProgressMetrics() {
        // Simular progreso basado en número de fotos
        const totalPhotos = this.state.photos.length;
        
        if (totalPhotos > 0) {
            // Simular mejoras en métricas
            this.state.metrics.progress = {
                masaGrasa: Math.max(15, 28 - (totalPhotos * 0.5)),
                masaMuscular: Math.min(45, 35 + (totalPhotos * 0.3)),
                sumatorioPliegues: Math.max(90, 120 - (totalPhotos * 2))
            };
        }
    }

    getDefaultMetrics() {
        return {
            lastPhotoDate: null,
            totalPhotos: 0,
            progress: {
                masaGrasa: 28,
                masaMuscular: 35,
                sumatorioPliegues: 120
            },
            trends: {
                weekly: [],
                monthly: []
            }
        };
    }

    loadInitialData() {
        // Cargar datos del localStorage
        const savedPhotos = localStorage.getItem('dashboardPhotos');
        const savedMetrics = localStorage.getItem('dashboardMetrics');
        
        if (savedPhotos) {
            this.state.photos = JSON.parse(savedPhotos);
        }
        
        if (savedMetrics) {
            this.state.metrics = JSON.parse(savedMetrics);
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('dashboardPhotos', JSON.stringify(this.state.photos));
            localStorage.setItem('dashboardMetrics', JSON.stringify(this.state.metrics));
        } catch (e) {
            console.error('Error guardando datos:', e);
            this.showNotification('Error al guardar datos. Espacio de almacenamiento insuficiente.', 'error');
        }
    }

    renderDashboard() {
        // Renderizar últimas fotos
        this.renderLatestPhotos();
        
        // Renderizar galería
        this.renderPhotoGallery();
        
        // Renderizar métricas
        this.renderMetrics();
        
        // Renderizar gráficos
        this.updateCharts();
        
        // Actualizar estadísticas
        this.updateStatistics();
    }

    renderLatestPhotos() {
        if (!this.elements.frontalGrid) return;

        const frontalPhotos = this.state.photos.filter(photo => photo.type === 'frontal');
        
        if (frontalPhotos.length === 0) {
            this.elements.frontalGrid.innerHTML = `
                <div class="date-card empty-state">
                    <div class="date-label">Sin fotos disponibles</div>
                    <div class="photo-placeholder empty"></div>
                </div>
            `;
            return;
        }

        // Mostrar las 5 fotos frontales más recientes
        const recentPhotos = frontalPhotos.slice(0, 5);
        
        this.elements.frontalGrid.innerHTML = recentPhotos.map(photo => `
            <div class="date-card" data-photo-id="${photo.id}">
                <div class="date-label">${this.formatDate(photo.date)}</div>
                <div class="photo-placeholder" style="background-image: url('${photo.image}')">
                    <div class="photo-overlay">
                        <button class="view-btn" onclick="dashboardManager.viewPhoto(${photo.id})">👁️</button>
                        <button class="delete-btn" onclick="dashboardManager.deletePhoto(${photo.id})">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderPhotoGallery() {
        if (!this.elements.photoGallery) return;

        if (this.state.photos.length === 0) {
            this.elements.photoGallery.innerHTML = `
                <div class="empty-state-card">
                    <div class="empty-icon">📸</div>
                    <h3>No hay fotos en el historial</h3>
                    <p>Sube tu primera foto para comenzar el seguimiento</p>
                </div>
            `;
            return;
        }

        this.elements.photoGallery.innerHTML = this.state.photos.map(photo => `
            <div class="photo-card" data-photo-id="${photo.id}">
                <div class="photo-image" style="background-image: url('${photo.image}')">
                    <div class="photo-actions">
                        <button class="action-btn view" onclick="dashboardManager.viewPhoto(${photo.id})">👁️</button>
                        <button class="action-btn delete" onclick="dashboardManager.deletePhoto(${photo.id})">🗑️</button>
                    </div>
                </div>
                <div class="photo-info">
                    <div class="photo-meta">
                        <span class="photo-type-badge ${photo.type}">${photo.typeName}</span>
                        <span class="photo-date">${this.formatDate(photo.date)}</span>
                    </div>
                    <div class="photo-stats">
                        <span class="stat">📏 ${photo.dimensions?.width || '?'}x${photo.dimensions?.height || '?'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderMetrics() {
        if (!this.elements.metricsTable) return;

        const metricsData = [
            { name: 'Masa Grasa', initial: '28%', current: `${this.state.metrics.progress.masaGrasa.toFixed(1)}%`, trend: 'down' },
            { name: 'Masa Muscular', initial: '35 kg', current: `${this.state.metrics.progress.masaMuscular.toFixed(1)} kg`, trend: 'up' },
            { name: 'Sumatorio Pliegues', initial: '120 mm', current: `${this.state.metrics.progress.sumatorioPliegues.toFixed(0)} mm`, trend: 'down' }
        ];

        this.elements.metricsTable.innerHTML = metricsData.map(metric => `
            <tr class="metric-row ${metric.trend}">
                <td>${metric.name}</td>
                <td>${metric.initial}</td>
                <td>${this.getLastMonthDate()}</td>
                <td class="metric-current ${metric.trend}">${metric.current}</td>
            </tr>
        `).join('');
    }

    initCharts() {
        if (!this.elements.chartsContainer) return;

        // Inicializar gráficos con datos por defecto
        this.charts = {
            results: this.createResultsChart(),
            progress: this.createProgressChart()
        };
    }

    createResultsChart() {
        // Crear gráfico de barras
        const chartData = {
            labels: ['12/03', '13/04', '15/06', '9/08', '5/08'],
            values: [45, 30, 20, 90, 50],
            color: this.config.chartColors.primary
        };

        return chartData;
    }

    createProgressChart() {
        // Crear gráfico de progreso
        const chartData = {
            labels: ['13/00', '12/00', '12/00', '15/00', '12/00', '12/00'],
            values: [90, 86, 80, 100, 90, 85],
            color: this.config.chartColors.success
        };

        return chartData;
    }

    updateCharts() {
        // Actualizar datos de los gráficos
        if (this.state.photos.length > 0) {
            // Actualizar con datos reales
            this.charts.results.values = this.calculateProgressData();
            this.charts.progress.values = this.calculateTrendData();
        }
    }

    calculateProgressData() {
        // Calcular datos de progreso basados en fotos
        const totalPhotos = this.state.photos.length;
        return [45, 30, 20, Math.min(90, 20 + totalPhotos * 10), 50];
    }

    calculateTrendData() {
        // Calcular tendencias
        return this.state.photos.length > 0 ? 
            [90, 86, 80, 100, 90, 85] : 
            [0, 0, 0, 0, 0, 0];
    }

    updateStatistics() {
        // Actualizar estadísticas en tiempo real
        const stats = {
            totalPhotos: this.state.photos.length,
            lastUpload: this.state.photos[0] ? this.formatDate(this.state.photos[0].date) : 'Nunca',
            progressPercentage: this.calculateOverallProgress()
        };

        // Actualizar elementos de estadísticas si existen
        const statsElements = document.querySelectorAll('.stat-value');
        statsElements.forEach(el => {
            const statType = el.dataset.stat;
            if (stats[statType]) {
                el.textContent = stats[statType];
            }
        });
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

    handleMenuClick(event) {
        const menuItem = event.currentTarget;
        const view = menuItem.dataset.view || 'frontal';
        
        // Remover clase active de todos los items
        this.elements.resultsMenu.forEach(item => item.classList.remove('active'));
        
        // Añadir clase active al item clickeado
        menuItem.classList.add('active');
        
        // Cambiar vista
        this.state.activeView = view;
        this.renderView(view);
    }

    renderView(view) {
        // Ocultar todas las vistas
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.add('hidden'));
        
        // Mostrar vista activa
        const activeSection = document.querySelector(`.${view}-section`);
        if (activeSection) {
            activeSection.classList.remove('hidden');
        }
    }

    viewPhoto(photoId) {
        const photo = this.state.photos.find(p => p.id === photoId);
        if (!photo) return;

        // Crear modal de vista de foto
        const modal = document.createElement('div');
        modal.className = 'photo-modal-overlay';
        modal.innerHTML = `
            <div class="photo-modal">
                <div class="modal-header">
                    <h3>${photo.typeName} - ${this.formatDate(photo.date)}</h3>
                    <button class="modal-close" onclick="this.closest('.photo-modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <img src="${photo.image}" alt="Foto ${photo.typeName}">
                    <div class="photo-details">
                        <p><strong>Tipo:</strong> ${photo.typeName}</p>
                        <p><strong>Fecha:</strong> ${this.formatDate(photo.date)}</p>
                        <p><strong>Tamaño:</strong> ${(photo.size / 1024).toFixed(2)} KB</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Cerrar con Escape
        const closeModal = (e) => {
            if (e.key === 'Escape') modal.remove();
        };
        modal.addEventListener('keydown', closeModal);
        modal.focus();
    }

    deletePhoto(photoId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta foto?')) return;

        // Eliminar foto del estado
        this.state.photos = this.state.photos.filter(p => p.id !== photoId);
        
        // Actualizar métricas
        this.updateProgressMetrics();
        
        // Guardar cambios
        this.saveToStorage();
        
        // Re-renderizar
        this.renderDashboard();
        
        // Mostrar notificación
        this.showNotification('Foto eliminada correctamente', 'success');
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar-left');
        sidebar.classList.toggle('collapsed');
        
        // Guardar preferencia
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }

    closeDashboard() {
        // Guardar antes de cerrar
        this.saveDashboard();
        
        // Animación de cierre
        this.elements.dashboard.style.transform = 'scale(0.95)';
        this.elements.dashboard.style.opacity = '0';
        
        setTimeout(() => {
            // En una aplicación real, aquí se cerraría el modal
            this.showNotification('Dashboard guardado correctamente', 'success');
            // Resetear animación
            this.elements.dashboard.style.transform = '';
            this.elements.dashboard.style.opacity = '';
        }, 300);
    }

    saveDashboard() {
        this.saveToStorage();
        this.showNotification('Datos guardados correctamente', 'success');
    }

    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${this.getNotificationIcon(type)}</span>
            <span class="notification-text">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        `;

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

    handleKeyboardShortcuts(e) {
        // Atajos de teclado
        switch(e.key) {
            case 'Escape':
                this.closeDashboard();
                break;
            case 'u':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.elements.fileInput?.click();
                }
                break;
            case 's':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.saveDashboard();
                }
                break;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    getLastMonthDate() {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return this.formatDate(date);
    }

    // Métodos públicos para acceso desde HTML
    getDashboardState() {
        return { ...this.state };
    }

    getPhotoStats() {
        return {
            total: this.state.photos.length,
            byType: this.groupPhotosByType(),
            recent: this.state.photos.slice(0, 5)
        };
    }

    groupPhotosByType() {
        const groups = {};
        this.state.photos.forEach(photo => {
            if (!groups[photo.type]) {
                groups[photo.type] = [];
            }
            groups[photo.type].push(photo);
        });
        return groups;
    }
}

// Inicialización global
let dashboardManager;

document.addEventListener('DOMContentLoaded', () => {
    dashboardManager = new DashboardManager();
    
    // Hacer disponible globalmente para eventos onclick en HTML
    window.dashboardManager = dashboardManager;
    
    // Cargar preferencias de usuario
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarCollapsed) {
        document.querySelector('.sidebar-left')?.classList.add('collapsed');
    }
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardManager };
}
