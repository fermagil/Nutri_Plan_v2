/**
 * Módulo Principal del Dashboard - Seguimiento Visual Corporal
 * Versión 3.0 - Con IndexedDB para almacenamiento robusto
 */

class DashboardManager {
    constructor() {
        // Estado inicial
        this.state = {
            photos: [],
            metrics: {},
            currentView: 'frontal',
            isSidebarCollapsed: false,
            isDashboardOpen: false,
            isPhotoModalOpen: false,
            dbInitialized: false
        };

        // Configuración
        this.config = {
            maxFileSize: 5 * 1024 * 1024, // 5MB original
            maxCompressedSize: 1 * 1024 * 1024, // 1MB comprimido
            supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
            compression: {
                maxWidth: 1200,
                maxHeight: 1200,
                quality: 0.8,
                type: 'image/jpeg'
            },
            dbName: 'DashboardPhotosDB',
            dbVersion: 1,
            storageLimits: {
                maxPhotos: 100,
                maxPhotoSize: 2 * 1024 * 1024 // 2MB máximo por foto
            }
        };

        // Inicializar IndexedDB
        this.db = null;
        
        // Inicializar después de que el DOM esté listo
        this.init();
    }

    async init() {
        await this.initIndexedDB();
        this.cacheElements();
        this.setupEventListeners();
        this.setupInitialState();
        await this.loadAllData();
        this.setupCharts();
        
        console.log('✅ Dashboard Manager inicializado con IndexedDB');
    }

    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.config.dbName, this.config.dbVersion);
            
            request.onerror = (event) => {
                console.error('Error al abrir IndexedDB:', event.target.error);
                this.showNotification('Error al inicializar la base de datos', 'error');
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.state.dbInitialized = true;
                console.log('📊 IndexedDB inicializado correctamente');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Crear almacén de fotos
                if (!db.objectStoreNames.contains('photos')) {
                    const photosStore = db.createObjectStore('photos', { keyPath: 'id' });
                    photosStore.createIndex('date', 'date', { unique: false });
                    photosStore.createIndex('type', 'type', { unique: false });
                    photosStore.createIndex('uploadDate', 'uploadDate', { unique: false });
                }
                
                // Crear almacén de métricas
                if (!db.objectStoreNames.contains('metrics')) {
                    db.createObjectStore('metrics', { keyPath: 'id' });
                }
                
                // Crear almacén de configuración
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    async loadAllData() {
        try {
            // Cargar fotos
            this.state.photos = await this.getAllPhotos();
            
            // Cargar métricas
            const savedMetrics = await this.getFromDB('metrics', 'dashboard');
            this.state.metrics = savedMetrics || this.getDefaultMetrics();
            
            // Cargar configuración
            const settings = await this.getFromDB('settings', 'sidebar');
            if (settings) {
                this.state.isSidebarCollapsed = settings.collapsed || false;
            }
            
            console.log(`📸 ${this.state.photos.length} fotos cargadas desde IndexedDB`);
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            this.showNotification('Error al cargar los datos guardados', 'error');
        }
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
            photoModalDimensions: document.getElementById('photo-modal-dimensions')
        };
    }

    setupEventListeners() {
        // Apertura y cierre del dashboard modal
        this.elements.openDashboardBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openDashboard();
        });
        
        this.elements.closeDashboardBtn?.addEventListener('click', () => this.closeDashboard());
        
        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.state.isPhotoModalOpen) {
                    this.closePhotoModal();
                } else if (this.state.isDashboardOpen) {
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
        this.elements.uploadBtn?.addEventListener('click', () => {
            if (this.state.photos.length >= this.config.storageLimits.maxPhotos) {
                this.showNotification(`Límite de ${this.config.storageLimits.maxPhotos} fotos alcanzado`, 'warning');
                return;
            }
            this.elements.fileInput?.click();
        });
        
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
        
        // Establecer fecha por defecto
        if (this.elements.photoDateInput) {
            const today = new Date().toISOString().split('T')[0];
            this.elements.photoDateInput.value = today;
            this.elements.photoDateInput.max = today;
        }
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

        dropZone.addEventListener('drop', async (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                if (this.state.photos.length >= this.config.storageLimits.maxPhotos) {
                    this.showNotification(`Límite de ${this.config.storageLimits.maxPhotos} fotos alcanzado`, 'warning');
                    return;
                }
                await this.handleFileUpload({ target: { files } });
            }
        });
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
            this.showNotification('Comprimiendo y procesando imagen...', 'info');
            
            // Comprimir y procesar imagen
            const imageData = await this.compressAndProcessImage(file);
            
            // Validar tamaño después de compresión
            if (imageData.size > this.config.storageLimits.maxPhotoSize) {
                this.showNotification('La imagen es demasiado grande incluso después de compresión', 'error');
                return;
            }

            // Crear objeto de foto
            const newPhoto = {
                id: Date.now(),
                ...imageData,
                date: this.elements.photoDateInput.value,
                type: this.elements.photoTypeSelect?.value || 'frontal',
                typeName: this.getTypeName(this.elements.photoTypeSelect?.value || 'frontal'),
                uploadDate: new Date().toISOString()
            };

            // Guardar en IndexedDB
            await this.saveToDB('photos', newPhoto);
            
            // Actualizar estado local
            this.state.photos.unshift(newPhoto);
            this.updateMetrics();
            
            // Renderizar cambios
            this.renderDashboard();
            this.setupCharts();
            
            // Mostrar notificación de éxito
            this.showNotification('✅ Foto subida y comprimida correctamente', 'success');
            
            // Limpiar input
            event.target.value = '';
            
        } catch (error) {
            console.error('Error al procesar la imagen:', error);
            this.showNotification('❌ Error al procesar la imagen', 'error');
        }
    }

    async compressAndProcessImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Calcular nuevas dimensiones manteniendo aspect ratio
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > this.config.compression.maxWidth) {
                        height = (this.config.compression.maxWidth / width) * height;
                        width = this.config.compression.maxWidth;
                    }
                    
                    if (height > this.config.compression.maxHeight) {
                        width = (this.config.compression.maxHeight / height) * width;
                        height = this.config.compression.maxHeight;
                    }
                    
                    // Crear canvas para compresión
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    
                    // Dibujar imagen redimensionada
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Comprimir a JPEG con calidad ajustable
                    canvas.toBlob(
                        (blob) => {
                            const compressedReader = new FileReader();
                            compressedReader.onload = (e) => {
                                resolve({
                                    image: e.target.result,
                                    size: blob.size,
                                    dimensions: { width, height },
                                    filename: file.name,
                                    originalSize: file.size,
                                    compressionRatio: ((file.size - blob.size) / file.size * 100).toFixed(1)
                                });
                            };
                            compressedReader.readAsDataURL(blob);
                        },
                        this.config.compression.type,
                        this.config.compression.quality
                    );
                };
                
                img.onerror = () => reject(new Error('Error al cargar la imagen'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsDataURL(file);
        });
    }

    validateFile(file) {
        // Validar formato
        if (!this.config.supportedFormats.includes(file.type)) {
            return false;
        }

        // Validar tamaño original
        if (file.size > this.config.maxFileSize) {
            return false;
        }

        return true;
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
                sumatorioPliegues: Math.max(90, 120 - (totalPhotos * 2)),
                consistencyScore: Math.min(100, totalPhotos * 10)
            },
            storage: {
                totalSize: this.calculateTotalSize(),
                averageSize: this.calculateAverageSize(),
                photosCount: totalPhotos
            }
        };
    }

    calculateTotalSize() {
        return this.state.photos.reduce((total, photo) => total + (photo.size || 0), 0);
    }

    calculateAverageSize() {
        if (this.state.photos.length === 0) return 0;
        return this.calculateTotalSize() / this.state.photos.length;
    }

    getDefaultMetrics() {
        return {
            lastPhotoDate: null,
            totalPhotos: 0,
            progress: {
                masaGrasa: 28,
                masaMuscular: 35,
                sumatorioPliegues: 120,
                consistencyScore: 0
            },
            storage: {
                totalSize: 0,
                averageSize: 0,
                photosCount: 0
            }
        };
    }

    async getAllPhotos() {
        if (!this.state.dbInitialized) {
            console.warn('IndexedDB no inicializado');
            return [];
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['photos'], 'readonly');
            const store = transaction.objectStore('photos');
            const index = store.index('uploadDate');
            const request = index.getAll();
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                // Ordenar por fecha más reciente primero
                const photos = request.result.sort((a, b) => 
                    new Date(b.uploadDate) - new Date(a.uploadDate)
                );
                resolve(photos);
            };
        });
    }

    async getPhotosByType(type) {
        const allPhotos = await this.getAllPhotos();
        return allPhotos.filter(photo => photo.type === type);
    }

    async saveToDB(storeName, data) {
        if (!this.state.dbInitialized) {
            throw new Error('IndexedDB no inicializado');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async getFromDB(storeName, key) {
        if (!this.state.dbInitialized) return null;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result?.value || request.result);
        });
    }

    async deleteFromDB(storeName, key) {
        if (!this.state.dbInitialized) return;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    openDashboard() {
        if (!this.elements.dashboardModal) return;
        
        this.elements.dashboardModal.classList.remove('hidden');
        this.state.isDashboardOpen = true;
        document.body.style.overflow = 'hidden';
        
        // Renderizar contenido actualizado
        this.renderDashboard();
        
        console.log('📊 Dashboard abierto');
    }

    closeDashboard() {
        if (!this.elements.dashboardModal) return;
        
        this.elements.dashboardModal.classList.add('hidden');
        this.state.isDashboardOpen = false;
        document.body.style.overflow = '';
        
        // Guardar configuración
        this.saveSettings();
        
        console.log('📊 Dashboard cerrado');
    }

    async saveSettings() {
        try {
            await this.saveToDB('settings', {
                key: 'sidebar',
                value: { collapsed: this.state.isSidebarCollapsed }
            });
            
            await this.saveToDB('metrics', {
                id: 'dashboard',
                value: this.state.metrics
            });
        } catch (error) {
            console.error('Error guardando configuración:', error);
        }
    }

    toggleSidebar() {
        if (!this.elements.sidebar) return;
        
        this.elements.sidebar.classList.toggle('collapsed');
        this.state.isSidebarCollapsed = this.elements.sidebar.classList.contains('collapsed');
        
        // Guardar preferencia
        this.saveToDB('settings', {
            key: 'sidebar',
            value: { collapsed: this.state.isSidebarCollapsed }
        });
    }

    handleMenuClick(event) {
        const menuItem = event.currentTarget;
        const view = menuItem.dataset.view;
        
        if (!view) return;
        
        // Actualizar UI
        this.elements.menuItems?.forEach(item => item.classList.remove('active'));
        menuItem.classList.add('active');
        
        // Mostrar/ocultar secciones
        this.renderView(view);
    }

    renderView(view) {
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active-view'));
        
        // Mostrar sección activa
        const activeSection = document.querySelector(`.${view}-section`);
        if (activeSection) {
            activeSection.classList.add('active-view');
        }
    }

    renderDashboard() {
        this.renderFrontalSection();
        this.renderMetricsTable();
        this.updateLastPhotoDate();
        this.updateStorageStats();
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
            const sizeInfo = photo.compressionRatio ? 
                `<div class="size-info">Comprimido: ${photo.compressionRatio}%</div>` : '';
            
            return `
                <div class="date-card" data-photo-id="${photo.id}">
                    <div class="date-label">
                        ${dateLabel}
                        ${isLatest ? '<span class="latest-badge">ÚLTIMA</span>' : ''}
                    </div>
                    ${sizeInfo}
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
                current: `${this.state.metrics.progress?.masaGrasa?.toFixed(1) || 28}%`, 
                trend: 'down'
            },
            { 
                name: 'Masa Muscular', 
                initial: '35 kg', 
                current: `${this.state.metrics.progress?.masaMuscular?.toFixed(1) || 35} kg`, 
                trend: 'up'
            },
            { 
                name: 'Sumatorio Pliegues', 
                initial: '120 mm', 
                current: `${this.state.metrics.progress?.sumatorioPliegues?.toFixed(0) || 120} mm`, 
                trend: 'down'
            },
            { 
                name: 'Consistencia', 
                initial: '0%', 
                current: `${this.state.metrics.progress?.consistencyScore?.toFixed(0) || 0}%`, 
                trend: 'up'
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
                        <span class="trend-indicator">${trendIcon}</span>
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

    updateStorageStats() {
        // Actualizar información de almacenamiento en la UI
        const storageElements = document.querySelectorAll('[data-storage]');
        storageElements.forEach(el => {
            const stat = el.dataset.storage;
            let value = '';
            
            switch(stat) {
                case 'totalPhotos':
                    value = this.state.photos.length;
                    break;
                case 'totalSize':
                    value = this.formatBytes(this.calculateTotalSize());
                    break;
                case 'averageSize':
                    value = this.formatBytes(this.calculateAverageSize());
                    break;
                case 'remaining':
                    const remaining = this.config.storageLimits.maxPhotos - this.state.photos.length;
                    value = `${remaining} fotos`;
                    break;
            }
            
            el.textContent = value;
        });
    }

    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    setupCharts() {
        this.renderResultsChart();
        this.renderProgressChart();
    }

    renderResultsChart() {
        if (!this.elements.resultsChart) return;

        // Actualizar datos basados en fotos
        const photoCount = this.state.photos.length;
        const chartData = [
            { label: '12/03', value: 45 },
            { label: '13/04', value: 30 },
            { label: '15/06', value: 20 },
            { label: '9/08', value: Math.min(100, 20 + photoCount * 10) },
            { label: '5/08', value: 50 }
        ];

        this.elements.resultsChart.innerHTML = chartData.map(item => {
            const barHeight = Math.max(5, item.value);
            return `
                <div class="bar-group">
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
        const chartData = [
            { label: '13/00', value: 90 },
            { label: '12/00', value: 86 },
            { label: '12/00', value: 80 },
            { label: '15/00', value: Math.min(100, progress) },
            { label: '12/00', value: 90 },
            { label: '12/00', value: 85 }
        ];

        this.elements.progressChart.innerHTML = chartData.map(item => {
            const color = this.getProgressColor(item.value);
            return `
                <div class="value-row">
                    <span class="value-label">${item.label}</span>
                    <span class="value" style="background: ${color}">
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
        const consistencyBonus = this.state.metrics.progress?.consistencyScore * 0.3 || 0;
        
        return Math.min(maxProgress, baseProgress + metricProgress + consistencyBonus);
    }

    calculateMetricProgress() {
        let progress = 0;
        const metrics = this.state.metrics.progress || {};
        
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
    }

    closePhotoModal() {
        this.elements.photoModal.classList.add('hidden');
        this.state.isPhotoModalOpen = false;
        document.body.style.overflow = '';
    }

    async deletePhoto(photoId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta foto del historial?')) return;

        try {
            // Eliminar de IndexedDB
            await this.deleteFromDB('photos', photoId);
            
            // Eliminar del estado local
            this.state.photos = this.state.photos.filter(p => p.id !== photoId);
            
            // Actualizar métricas
            this.updateMetrics();
            
            // Renderizar cambios
            this.renderDashboard();
            this.setupCharts();
            
            // Mostrar notificación
            this.showNotification('🗑️ Foto eliminada correctamente', 'success');
            
        } catch (error) {
            console.error('Error al eliminar la foto:', error);
            this.showNotification('❌ Error al eliminar la foto', 'error');
        }
    }

    saveDashboard() {
        this.saveSettings();
        this.showNotification('✅ Configuración guardada correctamente', 'success');
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

    // Métodos públicos para acceso desde HTML
    getStats() {
        return {
            totalPhotos: this.state.photos.length,
            lastUpload: this.state.photos[0] ? this.formatDate(this.state.photos[0].date) : 'Nunca',
            progress: this.calculateOverallProgress(),
            storage: {
                totalSize: this.formatBytes(this.calculateTotalSize()),
                averageSize: this.formatBytes(this.calculateAverageSize()),
                photosCount: this.state.photos.length
            }
        };
    }
    
    // Método para exportar datos
    async exportData() {
        try {
            const allPhotos = await this.getAllPhotos();
            const metrics = await this.getFromDB('metrics', 'dashboard');
            
            const data = {
                photos: allPhotos,
                metrics: metrics,
                exportDate: new Date().toISOString(),
                version: '3.0-indexeddb'
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
            
        } catch (error) {
            console.error('Error exportando datos:', error);
            this.showNotification('❌ Error al exportar datos', 'error');
        }
    }
    
    // Método para limpiar datos
    async clearData() {
        if (!confirm('¿Estás seguro de que quieres eliminar TODAS las fotos y datos? Esta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            // Limpiar IndexedDB
            const transaction = this.db.transaction(['photos', 'metrics', 'settings'], 'readwrite');
            
            transaction.objectStore('photos').clear();
            transaction.objectStore('metrics').clear();
            transaction.objectStore('settings').clear();
            
            // Resetear estado
            this.state.photos = [];
            this.state.metrics = this.getDefaultMetrics();
            this.state.isSidebarCollapsed = false;
            
            // Renderizar estado vacío
            this.renderDashboard();
            this.setupCharts();
            
            this.showNotification('🗑️ Todos los datos han sido eliminados', 'success');
            
        } catch (error) {
            console.error('Error al limpiar datos:', error);
            this.showNotification('❌ Error al eliminar datos', 'error');
        }
    }
}

// Inicializar cuando el DOM esté listo
let dashboardManager;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        dashboardManager = new DashboardManager();
        window.dashboardManager = dashboardManager;
        
        // Hacer métodos disponibles globalmente
        window.openDashboard = () => dashboardManager.openDashboard();
        window.closeDashboard = () => dashboardManager.closeDashboard();
        window.saveDashboard = () => dashboardManager.saveDashboard();
        window.exportData = () => dashboardManager.exportData();
        window.clearData = () => dashboardManager.clearData();
        
        console.log('🚀 Dashboard Manager con IndexedDB inicializado');
        
    } catch (error) {
        console.error('Error al inicializar Dashboard Manager:', error);
        
        // Mostrar error al usuario
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ef4444;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        errorDiv.innerHTML = `
            <strong>Error al cargar el dashboard:</strong><br>
            ${error.message}<br>
            <small>Por favor, recarga la página o usa otro navegador.</small>
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 10000);
    }
});
