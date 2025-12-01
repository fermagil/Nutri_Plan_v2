/**
 * Módulo Principal del Dashboard - Seguimiento Visual Corporal
 * Versión 2.0 - Modal integrado con todas las funcionalidades
 */

class DashboardManager {
    constructor() {
        // Estado inicial
        this.state = {
            photos: this.loadFromStorage('dashboardPhotos') || [],
            metrics: this.loadFromStorage('dashboardMetrics') || this.getDefaultMetrics(),
            currentView: 'frontal',
            isSidebarCollapsed: this.loadFromStorage('sidebarCollapsed') === 'true',
            notifications: [],
            isDashboardOpen: false,
            isPhotoModalOpen: false
        };

        // Configuración
        this.config = {
            maxFileSize: 5 * 1024 * 1024, // 5MB
            supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            localStorageKeys: {
                photos: 'dashboardPhotos',
                metrics: 'dashboardMetrics',
                sidebar: 'sidebarCollapsed'
            },
            chartData: {
                results: [
                    { label: '12/03', value: 45 },
                    { label: '13/04', value: 30 },
                    { label: '15/06', value: 20 },
                    { label: '9/08', value: 90 },
                    { label: '5/08', value: 50 }
                ],
                progress: [
                    { label: '13/00', value: 90 },
                    { label: '12/00', value: 86 },
                    { label: '12/00', value: 80 },
                    { label: '15/00', value: 100 },
                    { label: '12/00', value: 90 },
                    { label: '12/00', value: 85 }
                ]
            }
        };

        // Inicializar después de que el DOM esté listo
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupInitialState();
        this.setupCharts();
        this.setupDateInput();
        
        console.log('✅ Dashboard Manager inicializado correctamente');
    }

    cacheElements() {
        // Contenedores principales del modal
        this.elements = {
            // Dashboard Modal
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
            
            // Photo Modal
            photoModal: document.getElementById('photo-modal'),
            closePhotoModalBtn: document.getElementById('btn-close-photo-modal'),
            photoModalTitle: document.getElementById('photo-modal-title'),
            photoModalImage: document.getElementById('photo-modal-image'),
            photoModalType: document.getElementById('photo-modal-type'),
            photoModalDate: document.getElementById('photo-modal-date'),
            photoModalDimensions: document.getElementById('photo-modal-dimensions'),
            
            // Otros elementos importantes
            metricsTags: document.querySelectorAll('.metric-tag'),
            chartBars: document.querySelectorAll('.bar-group'),
            valueRows: document.querySelectorAll('.value-row')
        };
    }

    setupEventListeners() {
        // Apertura y cierre del dashboard modal
        this.elements.openDashboardBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openDashboard();
        });
        
        this.elements.closeDashboardBtn?.addEventListener('click', () => this.closeDashboard());
        
        // Cerrar dashboard con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.state.isPhotoModalOpen) {
                    this.closePhotoModal();
                } else if (this.state.isDashboardOpen) {
                    this.closeDashboard();
                }
            }
            
            // Atajos de teclado
            if (e.ctrlKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveDashboard();
                        break;
                    case 'u':
                        e.preventDefault();
                        this.elements.fileInput?.click();
                        break;
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
        
        // Etiquetas de métricas
        this.elements.metricsTags?.forEach(tag => {
            tag.addEventListener('click', (e) => this.handleMetricTagClick(e));
        });
        
        // Interactividad de gráficos
        this.elements.chartBars?.forEach(bar => {
            bar.addEventListener('click', (e) => this.handleChartBarClick(e));
        });
        
        this.elements.valueRows?.forEach(row => {
            row.addEventListener('click', (e) => this.handleValueRowClick(e));
        });
    }

    setupInitialState() {
        // Estado inicial del sidebar
        if (this.state.isSidebarCollapsed && this.elements.sidebar) {
            this.elements.sidebar.classList.add('collapsed');
        }
        
        // Inicializar drop zone
        if (this.elements.dropZone) {
            this.elements.dropZone.classList.remove('hidden');
        }
        
        // Cargar datos iniciales
        this.loadInitialData();
    }

    setupDateInput() {
        if (this.elements.photoDateInput) {
            const today = new Date().toISOString().split('T')[0];
            this.elements.photoDateInput.value = today;
            this.elements.photoDateInput.max = today;
            this.elements.photoDateInput.min = '2020-01-01';
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

    loadInitialData() {
        // Cargar fotos y métricas desde localStorage
        this.state.photos = this.loadFromStorage(this.config.localStorageKeys.photos) || [];
        this.state.metrics = this.loadFromStorage(this.config.localStorageKeys.metrics) || this.getDefaultMetrics();
        
        // Actualizar métricas basadas en fotos existentes
        this.updateMetrics();
    }

    openDashboard() {
        if (!this.elements.dashboardModal) return;
        
        this.elements.dashboardModal.classList.remove('hidden');
        this.state.isDashboardOpen = true;
        document.body.style.overflow = 'hidden';
        
        // Renderizar contenido actualizado
        this.renderDashboard();
        
        // Mostrar animación de entrada
        setTimeout(() => {
            if (this.elements.dashboardContainer) {
                this.elements.dashboardContainer.style.opacity = '1';
                this.elements.dashboardContainer.style.transform = 'scale(1)';
            }
        }, 10);
        
        console.log('📊 Dashboard abierto');
    }

    closeDashboard() {
        if (!this.elements.dashboardModal) return;
        
        // Animación de salida
        if (this.elements.dashboardContainer) {
            this.elements.dashboardContainer.style.opacity = '0';
            this.elements.dashboardContainer.style.transform = 'scale(0.95)';
        }
        
        setTimeout(() => {
            this.elements.dashboardModal.classList.add('hidden');
            this.state.isDashboardOpen = false;
            document.body.style.overflow = '';
            
            // Guardar cambios automáticamente
            this.saveToStorage();
            
            // Resetear animación
            if (this.elements.dashboardContainer) {
                this.elements.dashboardContainer.style.opacity = '';
                this.elements.dashboardContainer.style.transform = '';
            }
        }, 300);
        
        console.log('📊 Dashboard cerrado');
    }

    toggleSidebar() {
        if (!this.elements.sidebar) return;
        
        this.elements.sidebar.classList.toggle('collapsed');
        this.state.isSidebarCollapsed = this.elements.sidebar.classList.contains('collapsed');
        this.saveToStorage(this.config.localStorageKeys.sidebar, this.state.isSidebarCollapsed);
        
        // Mostrar notificación
        const action = this.state.isSidebarCollapsed ? 'contraída' : 'expandida';
        this.showNotification(`Sidebar ${action}`, 'info');
    }

    handleMenuClick(event) {
        const menuItem = event.currentTarget;
        const view = menuItem.dataset.view;
        
        if (!view) return;
        
        // Actualizar estado
        this.state.currentView = view;
        
        // Actualizar UI
        this.elements.menuItems?.forEach(item => item.classList.remove('active'));
        menuItem.classList.add('active');
        
        // Mostrar/ocultar secciones
        this.renderView(view);
        
        // Mostrar notificación
        this.showNotification(`Vista cambiada a: ${view}`, 'info');
    }

    renderView(view) {
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active-view'));
        
        // Mostrar sección activa
        const activeSection = document.querySelector(`.${view}-section`);
        if (activeSection) {
            activeSection.classList.add('active-view');
            activeSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
            // Mostrar estado de carga
            this.showNotification('Procesando imagen...', 'info');
            
            // Procesar imagen
            const imageData = await this.processImage(file);
            
            // Crear objeto de foto
            const newPhoto = {
                id: Date.now(),
                ...imageData,
                date: this.elements.photoDateInput.value,
                type: this.elements.photoTypeSelect?.value || 'frontal',
                typeName: this.getTypeName(this.elements.photoTypeSelect?.value || 'frontal'),
                uploadTimestamp: Date.now()
            };

            // Actualizar estado
            this.state.photos.unshift(newPhoto);
            this.updateMetrics();
            
            // Guardar y renderizar
            this.saveToStorage();
            this.renderDashboard();
            this.setupCharts();
            
            // Mostrar notificación de éxito
            this.showNotification('✅ Foto subida correctamente', 'success');
            
            // Limpiar input
            event.target.value = '';
            
            // Resetear fecha a hoy
            this.setupDateInput();
            
        } catch (error) {
            console.error('Error al procesar la imagen:', error);
            this.showNotification('❌ Error al procesar la imagen', 'error');
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
                resolve({ 
                    width: img.width, 
                    height: img.height,
                    aspectRatio: (img.width / img.height).toFixed(2)
                });
            };
            img.onerror = () => resolve({ width: 0, height: 0, aspectRatio: 0 });
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
        const frontalPhotos = this.state.photos.filter(p => p.type === 'frontal').length;
        const perfilPhotos = this.state.photos.filter(p => p.type === 'perfil').length;
        const espaldaPhotos = this.state.photos.filter(p => p.type === 'espalda').length;
        
        this.state.metrics = {
            lastPhotoDate: this.state.photos[0]?.date || null,
            totalPhotos,
            photoDistribution: {
                frontal: frontalPhotos,
                perfil: perfilPhotos,
                espalda: espaldaPhotos
            },
            progress: {
                masaGrasa: Math.max(15, 28 - (totalPhotos * 0.5)),
                masaMuscular: Math.min(45, 35 + (totalPhotos * 0.3)),
                sumatorioPliegues: Math.max(90, 120 - (totalPhotos * 2)),
                consistencyScore: Math.min(100, totalPhotos * 10)
            },
            trends: this.calculateTrends()
        };
    }

    getDefaultMetrics() {
        return {
            lastPhotoDate: null,
            totalPhotos: 0,
            photoDistribution: {
                frontal: 0,
                perfil: 0,
                espalda: 0
            },
            progress: {
                masaGrasa: 28,
                masaMuscular: 35,
                sumatorioPliegues: 120,
                consistencyScore: 0
            },
            trends: {
                weekly: [],
                monthly: []
            }
        };
    }

    calculateTrends() {
        if (this.state.photos.length < 2) {
            return { weekly: [], monthly: [] };
        }
        
        // Simular tendencias basadas en número de fotos
        const weekly = [
            { date: 'Sem 1', value: 20 },
            { date: 'Sem 2', value: 35 },
            { date: 'Sem 3', value: 50 },
            { date: 'Sem 4', value: 65 }
        ];
        
        const monthly = [
            { month: 'Ene', value: 10 },
            { month: 'Feb', value: 25 },
            { month: 'Mar', value: 45 },
            { month: 'Abr', value: 60 },
            { month: 'May', value: 75 },
            { month: 'Jun', value: 85 }
        ];
        
        return { weekly, monthly };
    }

    renderDashboard() {
        this.renderFrontalSection();
        this.renderMetricsTable();
        this.updateLastPhotoDate();
        this.updatePhotoStats();
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
        
        this.elements.frontalGrid.innerHTML = recentPhotos.map((photo, index) => {
            const isLatest = index === 0;
            const dateLabel = this.formatDate(photo.date);
            
            return `
                <div class="date-card" data-photo-id="${photo.id}">
                    <div class="date-label">
                        ${dateLabel}
                        ${isLatest ? '<span class="latest-badge">ÚLTIMA</span>' : ''}
                    </div>
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
            `;
        }).join('');
    }

    renderMetricsTable() {
        if (!this.elements.metricsTableBody) return;

        const metricsData = [
            { 
                name: 'Masa Grasa', 
                initial: '28%', 
                current: `${this.state.metrics.progress.masaGrasa.toFixed(1)}%`, 
                trend: this.state.metrics.progress.masaGrasa < 28 ? 'down' : 'up',
                improvement: `${((28 - this.state.metrics.progress.masaGrasa) / 28 * 100).toFixed(1)}%`
            },
            { 
                name: 'Masa Muscular', 
                initial: '35 kg', 
                current: `${this.state.metrics.progress.masaMuscular.toFixed(1)} kg`, 
                trend: this.state.metrics.progress.masaMuscular > 35 ? 'up' : 'down',
                improvement: `${((this.state.metrics.progress.masaMuscular - 35) / 35 * 100).toFixed(1)}%`
            },
            { 
                name: 'Sumatorio Pliegues', 
                initial: '120 mm', 
                current: `${this.state.metrics.progress.sumatorioPliegues.toFixed(0)} mm`, 
                trend: this.state.metrics.progress.sumatorioPliegues < 120 ? 'down' : 'up',
                improvement: `${((120 - this.state.metrics.progress.sumatorioPliegues) / 120 * 100).toFixed(1)}%`
            },
            { 
                name: 'Consistencia', 
                initial: '0%', 
                current: `${this.state.metrics.progress.consistencyScore.toFixed(0)}%`, 
                trend: 'up',
                improvement: `${this.state.metrics.progress.consistencyScore.toFixed(1)}%`
            }
        ];

        this.elements.metricsTableBody.innerHTML = metricsData.map(metric => {
            const trendIcon = metric.trend === 'up' ? '📈' : '📉';
            return `
                <tr>
                    <td>${metric.name}</td>
                    <td>${metric.initial}</td>
                    <td class="metric-value ${metric.trend}">
                        ${metric.current}
                        <span class="trend-indicator">${trendIcon} ${metric.improvement}</span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateLastPhotoDate() {
        if (!this.elements.lastPhotoDate) return;
        
        if (this.state.photos.length > 0) {
            const lastPhoto = this.state.photos[0];
            this.elements.lastPhotoDate.textContent = this.formatDate(lastPhoto.date);
        } else {
            this.elements.lastPhotoDate.textContent = 'Nunca';
        }
    }

    updatePhotoStats() {
        // Actualizar estadísticas en tiempo real
        const stats = {
            total: this.state.photos.length,
            frontal: this.state.photos.filter(p => p.type === 'frontal').length,
            perfil: this.state.photos.filter(p => p.type === 'perfil').length,
            espalda: this.state.photos.filter(p => p.type === 'espalda').length,
            lastUpload: this.state.photos[0] ? this.formatDate(this.state.photos[0].date) : 'Nunca'
        };

        // Actualizar elementos de estadísticas si existen
        const statElements = document.querySelectorAll('[data-stat]');
        statElements.forEach(el => {
            const statType = el.dataset.stat;
            if (stats[statType] !== undefined) {
                el.textContent = stats[statType];
            }
        });
    }

    setupCharts() {
        this.renderResultsChart();
        this.renderProgressChart();
    }

    renderResultsChart() {
        if (!this.elements.resultsChart) return;

        // Actualizar datos basados en fotos
        const photoCount = this.state.photos.length;
        const chartData = [...this.config.chartData.results];
        
        if (photoCount > 0) {
            // Ajustar valores basados en número de fotos
            chartData[3].value = Math.min(100, 20 + photoCount * 10);
            chartData[4].value = Math.min(80, 50 + photoCount * 5);
        }

        this.elements.resultsChart.innerHTML = chartData.map(item => {
            const barHeight = Math.max(5, item.value); // Mínimo 5% para visibilidad
            return `
                <div class="bar-group" data-value="${item.value}" data-label="${item.label}">
                    <div class="bar" style="height: ${barHeight}%"></div>
                    <div class="bar-label">${item.label}</div>
                    <div class="bar-value">${item.value}</div>
                </div>
            `;
        }).join('');
    }

    renderProgressChart() {
        if (!this.elements.progressChart) return;

        // Actualizar datos basados en progreso
        const progress = this.calculateOverallProgress();
        const chartData = [...this.config.chartData.progress];
        
        if (progress > 0) {
            chartData[3].value = Math.min(100, progress);
            chartData[5].value = Math.min(95, 85 + (progress / 10));
        }

        this.elements.progressChart.innerHTML = chartData.map(item => {
            return `
                <div class="value-row" data-value="${item.value}" data-label="${item.label}">
                    <span class="value-label">${item.label}</span>
                    <span class="value" style="background: ${this.getProgressColor(item.value)}">
                        ${item.value}
                    </span>
                </div>
            `;
        }).join('');
    }

    getProgressColor(value) {
        if (value >= 90) return 'var(--success)';
        if (value >= 70) return 'var(--primary-blue)';
        if (value >= 50) return 'var(--warning)';
        return 'var(--danger)';
    }

    calculateOverallProgress() {
        if (this.state.photos.length === 0) return 0;
        
        const maxProgress = 100;
        const baseProgress = Math.min(70, this.state.photos.length * 10);
        const metricProgress = this.calculateMetricProgress();
        const consistencyBonus = this.state.metrics.progress.consistencyScore * 0.3;
        
        return Math.min(maxProgress, baseProgress + metricProgress + consistencyBonus);
    }

    calculateMetricProgress() {
        let progress = 0;
        const metrics = this.state.metrics.progress;
        
        if (metrics.masaGrasa < 25) progress += 15;
        if (metrics.masaGrasa < 20) progress += 10;
        
        if (metrics.masaMuscular > 36) progress += 15;
        if (metrics.masaMuscular > 40) progress += 10;
        
        if (metrics.sumatorioPliegues < 110) progress += 15;
        if (metrics.sumatorioPliegues < 100) progress += 10;
        
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
        this.elements.photoModalDimensions.textContent = 
            `${photo.dimensions?.width || '?'} × ${photo.dimensions?.height || '?'} px`;

        // Mostrar modal
        this.elements.photoModal.classList.remove('hidden');
        this.state.isPhotoModalOpen = true;
        document.body.style.overflow = 'hidden';
        
        console.log('🖼️ Foto vista:', photoId);
    }

    closePhotoModal() {
        this.elements.photoModal.classList.add('hidden');
        this.state.isPhotoModalOpen = false;
        document.body.style.overflow = '';
    }

    deletePhoto(photoId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta foto del historial?')) return;

        // Encontrar índice de la foto
        const photoIndex = this.state.photos.findIndex(p => p.id === photoId);
        if (photoIndex === -1) return;

        // Guardar info para notificación
        const deletedPhoto = this.state.photos[photoIndex];
        
        // Eliminar foto
        this.state.photos.splice(photoIndex, 1);
        
        // Actualizar métricas
        this.updateMetrics();
        
        // Guardar y renderizar
        this.saveToStorage();
        this.renderDashboard();
        this.setupCharts();
        
        // Mostrar notificación
        this.showNotification(`🗑️ Foto eliminada: ${deletedPhoto.typeName} del ${this.formatDate(deletedPhoto.date)}`, 'success');
    }

    saveDashboard() {
        this.saveToStorage();
        this.showNotification('✅ Dashboard guardado correctamente', 'success');
        
        // Animación de confirmación
        if (this.elements.saveBtn) {
            const originalText = this.elements.saveBtn.textContent;
            this.elements.saveBtn.textContent = '✅ Guardado!';
            this.elements.saveBtn.style.background = 'var(--success)';
            
            setTimeout(() => {
                this.elements.saveBtn.textContent = originalText;
                this.elements.saveBtn.style.background = '';
            }, 2000);
        }
    }

    handleMetricTagClick(event) {
        const tag = event.currentTarget;
        const tags = this.elements.metricsTags;
        
        // Remover active de todos los tags
        tags?.forEach(t => t.classList.remove('active'));
        
        // Agregar active al tag clickeado
        tag.classList.add('active');
        
        // Filtrar métricas basadas en el tag
        const filter = tag.textContent.toLowerCase();
        this.filterMetrics(filter);
        
        this.showNotification(`Filtro aplicado: ${tag.textContent}`, 'info');
    }

    filterMetrics(filter) {
        // Implementar lógica de filtrado según sea necesario
        console.log('Filtrando métricas por:', filter);
    }

    handleChartBarClick(event) {
        const barGroup = event.currentTarget.closest('.bar-group');
        if (!barGroup) return;
        
        const label = barGroup.dataset.label;
        const value = barGroup.dataset.value;
        
        this.showNotification(`Gráfico: ${label} = ${value}`, 'info');
    }

    handleValueRowClick(event) {
        const valueRow = event.currentTarget.closest('.value-row');
        if (!valueRow) return;
        
        const label = valueRow.dataset.label;
        const value = valueRow.dataset.value;
        
        this.showNotification(`Progreso: ${label} = ${value}`, 'info');
    }

    // Utilidades de almacenamiento
    loadFromStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error al cargar ${key}:`, error);
            this.showNotification(`Error al cargar datos de ${key}`, 'error');
            return null;
        }
    }

    saveToStorage(key = null, value = null) {
        try {
            if (key && value !== null) {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                // Guardar todo
                localStorage.setItem(
                    this.config.localStorageKeys.photos, 
                    JSON.stringify(this.state.photos.slice(0, 100)) // Limitar a 100 fotos
                );
                localStorage.setItem(
                    this.config.localStorageKeys.metrics, 
                    JSON.stringify(this.state.metrics)
                );
                localStorage.setItem(
                    this.config.localStorageKeys.sidebar, 
                    JSON.stringify(this.state.isSidebarCollapsed)
                );
            }
            return true;
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            this.showNotification('💾 Error al guardar datos. Espacio de almacenamiento insuficiente.', 'error');
            return false;
        }
    }

    // Utilidades de UI
    showNotification(message, type = 'info') {
        // Eliminar notificaciones existentes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach((notification, index) => {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, index * 100);
        });

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
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Fecha inválida';
            }
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha inválida';
        }
    }

    showChartTooltip(label, value) {
        this.showNotification(`${label}: ${value}`, 'info');
    }

    // Métodos públicos para acceso desde HTML
    getStats() {
        return {
            totalPhotos: this.state.photos.length,
            lastUpload: this.state.photos[0] ? this.formatDate(this.state.photos[0].date) : 'Nunca',
            progress: this.calculateOverallProgress(),
            metrics: this.state.metrics.progress,
            distribution: this.state.metrics.photoDistribution
        };
    }
    
    // Método para exportar datos
    exportData() {
        const data = {
            photos: this.state.photos,
            metrics: this.state.metrics,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('📁 Datos exportados correctamente', 'success');
    }
    
    // Método para importar datos
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validar estructura de datos
                if (!data.photos || !data.metrics) {
                    throw new Error('Formato de archivo inválido');
                }
                
                // Actualizar estado
                this.state.photos = data.photos;
                this.state.metrics = data.metrics;
                
                // Guardar y renderizar
                this.saveToStorage();
                this.renderDashboard();
                this.setupCharts();
                
                this.showNotification('📁 Datos importados correctamente', 'success');
                event.target.value = ''; // Limpiar input
                
            } catch (error) {
                console.error('Error al importar datos:', error);
                this.showNotification('❌ Error al importar datos. Formato inválido.', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    // Método para limpiar datos
    clearData() {
        if (!confirm('¿Estás seguro de que quieres eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
            return;
        }
        
        // Limpiar localStorage
        localStorage.removeItem(this.config.localStorageKeys.photos);
        localStorage.removeItem(this.config.localStorageKeys.metrics);
        localStorage.removeItem(this.config.localStorageKeys.sidebar);
        
        // Resetear estado
        this.state.photos = [];
        this.state.metrics = this.getDefaultMetrics();
        this.state.isSidebarCollapsed = false;
        
        // Renderizar estado vacío
        this.renderDashboard();
        this.setupCharts();
        
        this.showNotification('🗑️ Todos los datos han sido eliminados', 'success');
    }
}

// Inicializar cuando el DOM esté listo
let dashboardManager;

document.addEventListener('DOMContentLoaded', () => {
    try {
        dashboardManager = new DashboardManager();
        window.dashboardManager = dashboardManager;
        
        // Hacer métodos disponibles globalmente
        window.openDashboard = () => dashboardManager.openDashboard();
        window.closeDashboard = () => dashboardManager.closeDashboard();
        window.saveDashboard = () => dashboardManager.saveDashboard();
        window.exportData = () => dashboardManager.exportData();
        window.clearData = () => dashboardManager.clearData();
        
        console.log('🚀 Dashboard Manager inicializado y listo para usar');
    } catch (error) {
        console.error('Error al inicializar Dashboard Manager:', error);
    }
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardManager };
}
