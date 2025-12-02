/**
 * Módulo Principal del Dashboard - Seguimiento Visual Corporal
 * Versión 3.6 - Corregido y optimizado
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
            dbInitialized: false,
            isLoading: false
        };

        // Configuración
        this.config = {
            maxFileSize: 10 * 1024 * 1024, // 10MB
            maxCompressedSize: 1.5 * 1024 * 1024, // 1.5MB comprimido
            supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
            compression: {
                maxWidth: 1200,
                maxHeight: 1200,
                quality: 0.85,
                type: 'image/jpeg'
            },
            dbName: 'DashboardPhotosDB',
            dbVersion: 2,
            storageLimits: {
                maxPhotos: 200,
                maxPhotoSize: 2.5 * 1024 * 1024
            }
        };

        // Inicializar IndexedDB
        this.db = null;
        
        // Cache de elementos
        this.elements = {};
        
        // Inicializar después de que el DOM esté listo
        this.init();
    }

    async init() {
        try {
            await this.initIndexedDB();
            this.cacheElements();
            this.setupEventListeners();
            this.setupInitialState();
            await this.loadAllData();
            this.setupCharts();
            
            console.log('✅ Dashboard Manager inicializado con éxito');
        } catch (error) {
            console.error('❌ Error inicializando Dashboard:', error);
            this.showNotification('Error al inicializar el dashboard', 'error');
        }
    }

    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.config.dbName, this.config.dbVersion);
            
            request.onerror = (event) => {
                console.error('Error IndexedDB:', event.target.error);
                this.useLocalStorageFallback();
                resolve();
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.state.dbInitialized = true;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Crear almacenes
                if (!db.objectStoreNames.contains('photos')) {
                    const photosStore = db.createObjectStore('photos', { keyPath: 'id' });
                    photosStore.createIndex('date', 'date', { unique: false });
                    photosStore.createIndex('type', 'type', { unique: false });
                    photosStore.createIndex('uploadDate', 'uploadDate', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('metrics')) {
                    db.createObjectStore('metrics', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    cacheElements() {
        // Seleccionar elementos del DOM
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
            
            // Loading states
            loadingIndicator: document.getElementById('loading-indicator'),
            uploadProgress: document.getElementById('upload-progress')
        };
    }

    setupEventListeners() {
        // Apertura y cierre del dashboard
        this.elements.openDashboardBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openDashboard();
        });
        
        this.elements.closeDashboardBtn?.addEventListener('click', () => this.closeDashboard());
        
        // Atajos de teclado
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Sidebar
        this.elements.menuToggle?.addEventListener('click', () => this.toggleSidebar());
        
        // Menú de navegación
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
        this.setupModalCloseListeners();
        
        // Inicializar fecha
        this.setupDateInput();
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

    setupDateInput() {
        if (this.elements.photoDateInput) {
            const today = new Date().toISOString().split('T')[0];
            this.elements.photoDateInput.value = today;
            this.elements.photoDateInput.max = today;
            this.elements.photoDateInput.min = '2000-01-01';
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
                await this.handleFileUpload({ target: { files } });
            }
        }, false);
    }

    setupModalCloseListeners() {
        // Dashboard modal
        this.elements.dashboardModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.dashboardModal) {
                this.closeDashboard();
            }
        });
        
        // Photo modal
        this.elements.photoModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.photoModal) {
                this.closePhotoModal();
            }
        });
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S para guardar
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveDashboard();
        }
        
        // Ctrl/Cmd + U para subir foto
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            this.elements.fileInput?.click();
        }
        
        // Escape para cerrar modales
        if (e.key === 'Escape') {
            if (this.state.isPhotoModalOpen) {
                this.closePhotoModal();
            } else if (this.state.isDashboardOpen) {
                this.closeDashboard();
            }
        }
    }

    handleMenuClick(event) {
        const menuItem = event.currentTarget;
        const view = menuItem.dataset.view;
        
        if (!view) return;
        
        // Actualizar UI
        this.elements.menuItems?.forEach(item => item.classList.remove('active'));
        menuItem.classList.add('active');
        
        // Mostrar sección
        this.renderView(view);
    }

    async handleFileUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        
        // Validar archivo
        if (!this.validateFile(file)) {
            this.showNotification('Formato no válido. Solo imágenes JPG, PNG, WebP hasta 10MB.', 'error');
            return;
        }

        // Validar fecha
        if (!this.elements.photoDateInput?.value) {
            this.showNotification('Selecciona una fecha de toma', 'warning');
            return;
        }

        try {
            // Mostrar progreso
            this.showUploadProgress(0, 'Iniciando compresión...');
            
            // Comprimir y procesar imagen
            const imageData = await this.compressAndProcessImage(file);
            
            // Validar tamaño después de compresión
            if (imageData.size > this.config.storageLimits.maxPhotoSize) {
                this.showNotification('La imagen es demasiado grande después de compresión', 'error');
                return;
            }

            // Crear objeto de foto
            const newPhoto = {
                id: Date.now(),
                ...imageData,
                date: this.elements.photoDateInput.value,
                type: this.elements.photoTypeSelect?.value || 'frontal',
                typeName: this.getTypeName(this.elements.photoTypeSelect?.value || 'frontal'),
                uploadDate: new Date().toISOString(),
                tags: [],
                metadata: {
                    originalName: file.name,
                    mimeType: file.type,
                    lastModified: file.lastModified
                }
            };

            // Mostrar progreso
            this.showUploadProgress(50, 'Guardando en base de datos...');
            
            // Guardar en IndexedDB
            if (this.state.dbInitialized) {
                await this.saveToDB('photos', newPhoto);
            }
            
            // Actualizar estado local
            this.state.photos.unshift(newPhoto);
            this.updateMetrics();
            
            // Mostrar progreso
            this.showUploadProgress(80, 'Renderizando vista...');
            
            // Renderizar cambios
            this.renderDashboard();
            this.setupCharts();
            
            // Mostrar notificación de éxito
            this.showNotification('Foto subida correctamente', 'success');
            
            // Resetear formulario
            event.target.value = '';
            this.setupDateInput();
            
            // Ocultar progreso
            this.showUploadProgress(100, 'Completado!');
            setTimeout(() => this.hideUploadProgress(), 1000);
            
        } catch (error) {
            console.error('Error al procesar la imagen:', error);
            this.showNotification('Error al procesar la imagen: ' + error.message, 'error');
            this.hideUploadProgress();
        }
    }

    async compressAndProcessImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Calcular nuevas dimensiones manteniendo aspect ratio
                    let { width, height } = this.calculateAspectRatioFit(
                        img.width, 
                        img.height, 
                        this.config.compression.maxWidth, 
                        this.config.compression.maxHeight
                    );
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Dibujar imagen redimensionada
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Aplicar compresión
                    canvas.toBlob(
                        (blob) => {
                            const compressedReader = new FileReader();
                            compressedReader.onload = (e) => {
                                resolve({
                                    image: e.target.result,
                                    size: blob.size,
                                    dimensions: { width, height },
                                    filename: file.name.replace(/\.[^/.]+$/, ""),
                                    originalSize: file.size,
                                    compressionRatio: ((file.size - blob.size) / file.size * 100).toFixed(1),
                                    aspectRatio: (width / height).toFixed(2)
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

    calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return {
            width: Math.round(srcWidth * ratio),
            height: Math.round(srcHeight * ratio)
        };
    }

    validateFile(file) {
        if (!this.config.supportedFormats.includes(file.type)) {
            return false;
        }

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

    showUploadProgress(percent, message = '') {
        if (this.elements.uploadProgress) {
            const progressBar = this.elements.uploadProgress.querySelector('.progress-bar');
            const progressText = this.elements.uploadProgress.querySelector('.progress-text');
            
            if (progressBar) {
                progressBar.style.width = `${percent}%`;
                progressBar.setAttribute('aria-valuenow', percent);
            }
            
            if (progressText) {
                progressText.textContent = message;
            }
            
            this.elements.uploadProgress.classList.remove('hidden');
        }
    }

    hideUploadProgress() {
        if (this.elements.uploadProgress) {
            this.elements.uploadProgress.classList.add('hidden');
        }
    }

    showLoading(show) {
        this.state.isLoading = show;
        
        if (this.elements.loadingIndicator) {
            if (show) {
                this.elements.loadingIndicator.classList.remove('hidden');
            } else {
                this.elements.loadingIndicator.classList.add('hidden');
            }
        }
    }

    async loadAllData() {
        this.showLoading(true);
        
        try {
            if (this.state.dbInitialized) {
                // Cargar desde IndexedDB
                this.state.photos = await this.getAllPhotos();
                const savedMetrics = await this.getFromDB('metrics', 'dashboard');
                this.state.metrics = savedMetrics || this.getDefaultMetrics();
                
                const settings = await this.getFromDB('settings', 'sidebar');
                if (settings) {
                    this.state.isSidebarCollapsed = settings.collapsed || false;
                }
            }
            
            console.log(`📸 ${this.state.photos.length} fotos cargadas`);
            
            // Actualizar métricas
            this.updateMetrics();
            
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            this.showLoading(false);
        }
    }

    useLocalStorageFallback() {
        console.warn('Usando localStorage como fallback');
        
        try {
            const savedData = localStorage.getItem('dashboard_fallback');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.state.photos = data.photos || [];
                this.state.metrics = data.metrics || this.getDefaultMetrics();
                this.state.isSidebarCollapsed = data.isSidebarCollapsed || false;
            }
        } catch (error) {
            console.error('Error cargando fallback:', error);
        }
    }

    async getAllPhotos() {
        if (!this.state.dbInitialized) return this.state.photos;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['photos'], 'readonly');
            const store = transaction.objectStore('photos');
            const request = store.getAll();
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const photos = request.result.sort((a, b) => 
                    new Date(b.uploadDate) - new Date(a.uploadDate)
                );
                resolve(photos);
            };
        });
    }

    async saveToDB(storeName, data) {
        if (!this.state.dbInitialized) return;

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

    updateMetrics() {
        const totalPhotos = this.state.photos.length;
        
        this.state.metrics = {
            lastPhotoDate: this.state.photos[0]?.date || null,
            totalPhotos,
            progress: {
                masaGrasa: Math.max(12, 28 - (totalPhotos * 0.4)),
                masaMuscular: Math.min(48, 35 + (totalPhotos * 0.4)),
                sumatorioPliegues: Math.max(85, 120 - (totalPhotos * 2.5)),
                consistencyScore: Math.min(100, totalPhotos * 8),
                progressScore: this.calculateProgressScore(totalPhotos)
            },
            storage: {
                totalSize: this.calculateTotalSize(),
                averageSize: this.calculateAverageSize(),
                photosCount: totalPhotos,
                byType: this.getPhotosByTypeCount()
            },
            lastUpdated: new Date().toISOString()
        };
    }

    calculateProgressScore(photoCount) {
        const baseScore = Math.min(70, photoCount * 8);
        const consistencyBonus = photoCount > 10 ? 15 : photoCount * 1.5;
        const recencyBonus = this.calculateRecencyBonus();
        
        return Math.min(100, baseScore + consistencyBonus + recencyBonus);
    }

    calculateRecencyBonus() {
        if (this.state.photos.length === 0) return 0;
        
        const lastPhotoDate = new Date(this.state.photos[0].uploadDate);
        const daysSince = (Date.now() - lastPhotoDate) / (1000 * 60 * 60 * 24);
        
        if (daysSince < 7) return 10;
        if (daysSince < 14) return 5;
        if (daysSince < 30) return 2;
        return 0;
    }

    getPhotosByTypeCount() {
        return {
            frontal: this.state.photos.filter(p => p.type === 'frontal').length,
            perfil: this.state.photos.filter(p => p.type === 'perfil').length,
            espalda: this.state.photos.filter(p => p.type === 'espalda').length
        };
    }

    calculateTotalSize() {
        return this.state.photos.reduce((total, photo) => total + (photo.size || 0), 0);
    }

    calculateAverageSize() {
        return this.state.photos.length > 0 ? 
            this.calculateTotalSize() / this.state.photos.length : 0;
    }

    openDashboard() {
        if (!this.elements.dashboardModal) return;
        
        this.elements.dashboardModal.classList.remove('hidden');
        this.state.isDashboardOpen = true;
        document.body.style.overflow = 'hidden';
        
        // Renderizar contenido
        this.renderDashboard();
    }

    closeDashboard() {
        if (!this.elements.dashboardModal) return;
        
        this.elements.dashboardModal.classList.add('hidden');
        this.state.isDashboardOpen = false;
        document.body.style.overflow = '';
        
        // Guardar cambios
        this.saveSettings();
    }

    toggleSidebar() {
        if (!this.elements.sidebar) return;
        
        this.elements.sidebar.classList.toggle('collapsed');
        this.state.isSidebarCollapsed = this.elements.sidebar.classList.contains('collapsed');
        this.saveToDB('settings', {
            key: 'sidebar',
            value: { collapsed: this.state.isSidebarCollapsed }
        });
    }

    renderView(view) {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active-view'));
        
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
        this.updatePhotoStats();
        this.setupCharts();
    }

    renderFrontalSection() {
        if (!this.elements.frontalGrid) return;

        const frontalPhotos = this.state.photos.filter(photo => photo.type === 'frontal');
        
        if (frontalPhotos.length === 0) {
            this.elements.frontalGrid.innerHTML = `
                <div class="date-card empty-state text-center p-4">
                    <div class="date-label mb-2">
                        <i class="fas fa-images fa-2x text-muted mb-3"></i>
                        <h5>No hay fotos disponibles</h5>
                    </div>
                    <div class="photo-placeholder empty">
                        <span class="placeholder-text">
                            <i class="fas fa-upload"></i><br>
                            Sube tu primera foto frontal
                        </span>
                    </div>
                </div>
            `;
            return;
        }

        const recentPhotos = frontalPhotos.slice(0, 6);
        
        this.elements.frontalGrid.innerHTML = recentPhotos.map((photo, index) => {
            const isLatest = index === 0;
            const dateLabel = this.formatDate(photo.date);
            const sizeInfo = photo.compressionRatio ? 
                `<div class="size-info badge bg-info">
                    <i class="fas fa-compress-arrows-alt"></i> ${photo.compressionRatio}%
                </div>` : '';
            
            return `
                <div class="date-card" data-photo-id="${photo.id}">
                    <div class="date-label d-flex justify-content-between align-items-center">
                        <span>${dateLabel}</span>
                        ${isLatest ? '<span class="latest-badge badge bg-success"><i class="fas fa-star"></i> ÚLTIMA</span>' : ''}
                    </div>
                    ${sizeInfo}
                    <div class="photo-placeholder has-image" 
                         style="background-image: url('${photo.image}')"
                         onclick="dashboardManager.viewPhoto(${photo.id})">
                        <div class="photo-overlay">
                            <button class="view-btn btn btn-sm btn-light" 
                                    onclick="dashboardManager.viewPhoto(${photo.id}); event.stopPropagation()" 
                                    title="Ver foto">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="delete-btn btn btn-sm btn-light" 
                                    onclick="dashboardManager.deletePhoto(${photo.id}); event.stopPropagation()" 
                                    title="Eliminar foto">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="photo-info mt-2">
                        <small class="text-muted">
                            <i class="fas fa-ruler-combined"></i> ${photo.dimensions?.width || '?'}×${photo.dimensions?.height || '?'}
                        </small>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderMetricsTable() {
        if (!this.elements.metricsTableBody) return;

        const metricsData = [
            { 
                name: '<i class="fas fa-weight"></i> Masa Grasa', 
                initial: '28%', 
                current: `${(this.state.metrics.progress?.masaGrasa || 28).toFixed(1)}%`, 
                trend: 'down'
            },
            { 
                name: '<i class="fas fa-dumbbell"></i> Masa Muscular', 
                initial: '35 kg', 
                current: `${(this.state.metrics.progress?.masaMuscular || 35).toFixed(1)} kg`, 
                trend: 'up'
            },
            { 
                name: '<i class="fas fa-ruler"></i> Sumatorio Pliegues', 
                initial: '120 mm', 
                current: `${(this.state.metrics.progress?.sumatorioPliegues || 120).toFixed(0)} mm`, 
                trend: 'down'
            },
            { 
                name: '<i class="fas fa-trophy"></i> Progreso Total', 
                initial: '0%', 
                current: `${(this.state.metrics.progress?.progressScore || 0).toFixed(0)}%`, 
                trend: 'up'
            }
        ];

        this.elements.metricsTableBody.innerHTML = metricsData.map(metric => {
            const trendClass = metric.trend === 'up' ? 'text-success' : 'text-primary';
            const trendIcon = metric.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
            
            return `
                <tr>
                    <td class="align-middle">${metric.name}</td>
                    <td class="align-middle">${metric.initial}</td>
                    <td class="align-middle">
                        <div class="d-flex align-items-center justify-content-between">
                            <span class="metric-value ${trendClass} fw-bold">
                                ${metric.current}
                            </span>
                            <span class="${trendClass}">
                                <i class="${trendIcon}"></i>
                            </span>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateLastPhotoDate() {
        if (!this.elements.lastPhotoDate) return;
        
        if (this.state.photos.length > 0) {
            const lastPhoto = this.state.photos[0];
            this.elements.lastPhotoDate.innerHTML = `
                <i class="fas fa-calendar-check"></i> ${this.formatDate(lastPhoto.date)}
            `;
        } else {
            this.elements.lastPhotoDate.innerHTML = `
                <i class="fas fa-calendar-times"></i> Nunca
            `;
        }
    }

    updateStorageStats() {
        const totalSize = this.calculateTotalSize();
        const avgSize = this.calculateAverageSize();
        const remaining = this.config.storageLimits.maxPhotos - this.state.photos.length;
        
        const statsContainer = document.querySelector('.storage-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="row text-center">
                    <div class="col-6 col-md-3">
                        <div class="stat-box">
                            <i class="fas fa-images fa-2x text-primary"></i>
                            <h4 class="mt-2">${this.state.photos.length}</h4>
                            <small class="text-muted">Fotos</small>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="stat-box">
                            <i class="fas fa-hdd fa-2x text-success"></i>
                            <h4 class="mt-2">${this.formatBytes(totalSize)}</h4>
                            <small class="text-muted">Total</small>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="stat-box">
                            <i class="fas fa-weight fa-2x text-warning"></i>
                            <h4 class="mt-2">${this.formatBytes(avgSize)}</h4>
                            <small class="text-muted">Promedio</small>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="stat-box">
                            <i class="fas fa-layer-group fa-2x text-info"></i>
                            <h4 class="mt-2">${remaining}</h4>
                            <small class="text-muted">Restantes</small>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    updatePhotoStats() {
        const typeCounts = this.getPhotosByTypeCount();
        
        const statsContainer = document.querySelector('.photo-type-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="row">
                    <div class="col-md-4">
                        <div class="d-flex align-items-center">
                            <span class="badge bg-primary me-2">
                                <i class="fas fa-user"></i>
                            </span>
                            <div>
                                <h6 class="mb-0">Frontal</h6>
                                <small class="text-muted">${typeCounts.frontal} fotos</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="d-flex align-items-center">
                            <span class="badge bg-success me-2">
                                <i class="fas fa-user-circle"></i>
                            </span>
                            <div>
                                <h6 class="mb-0">Perfil</h6>
                                <small class="text-muted">${typeCounts.perfil} fotos</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="d-flex align-items-center">
                            <span class="badge bg-warning me-2">
                                <i class="fas fa-user-md"></i>
                            </span>
                            <div>
                                <h6 class="mb-0">Espalda</h6>
                                <small class="text-muted">${typeCounts.espalda} fotos</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
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

        const photoCount = this.state.photos.length;
        const chartData = [
            { label: '12/03', value: 45, color: '#4f46e5' },
            { label: '13/04', value: 30, color: '#7c3aed' },
            { label: '15/06', value: 20, color: '#a855f7' },
            { label: '9/08', value: Math.min(100, 20 + photoCount * 12), color: '#10b981' },
            { label: '5/08', value: Math.min(80, 50 + photoCount * 6), color: '#f59e0b' }
        ];

        this.elements.resultsChart.innerHTML = chartData.map(item => {
            const barHeight = Math.max(10, item.value);
            return `
                <div class="bar-group" data-value="${item.value}" data-label="${item.label}">
                    <div class="bar" style="height: ${barHeight}%; background: ${item.color}"></div>
                    <div class="bar-label">${item.label}</div>
                    <div class="bar-value">${item.value}</div>
                </div>
            `;
        }).join('');
    }

    renderProgressChart() {
        if (!this.elements.progressChart) return;

        const progress = this.state.metrics.progress?.progressScore || 0;
        const chartData = [
            { label: '13/00', value: 90, color: '#10b981' },
            { label: '12/00', value: 86, color: '#10b981' },
            { label: '12/00', value: 80, color: '#3b82f6' },
            { label: '15/00', value: Math.min(100, progress), color: progress >= 70 ? '#10b981' : progress >= 50 ? '#f59e0b' : '#ef4444' },
            { label: '12/00', value: 90, color: '#10b981' },
            { label: '12/00', value: 85, color: '#10b981' }
        ];

        this.elements.progressChart.innerHTML = chartData.map(item => {
            return `
                <div class="value-row" data-value="${item.value}" data-label="${item.label}">
                    <span class="value-label">
                        <i class="fas fa-chart-bar"></i> ${item.label}
                    </span>
                    <span class="value" style="background: ${item.color}">
                        ${item.value}
                    </span>
                </div>
            `;
        }).join('');
    }

    viewPhoto(photoId) {
        const photo = this.state.photos.find(p => p.id === photoId);
        if (!photo) return;

        this.elements.photoModalTitle.innerHTML = `
            <i class="fas fa-camera"></i> ${photo.typeName} 
            <small class="text-muted">- ${this.formatDate(photo.date)}</small>
        `;
        
        this.elements.photoModalImage.src = photo.image;
        this.elements.photoModalImage.alt = `Foto ${photo.typeName}`;
        this.elements.photoModalType.textContent = photo.typeName;
        this.elements.photoModalDate.textContent = this.formatDate(photo.date);
        this.elements.photoModalDimensions.innerHTML = `
            <i class="fas fa-expand-alt"></i> ${photo.dimensions?.width || '?'} × ${photo.dimensions?.height || '?'} px
            <br>
            <i class="fas fa-weight-hanging"></i> ${this.formatBytes(photo.size)}
            ${photo.compressionRatio ? `<br><i class="fas fa-compress-arrows-alt"></i> Comprimido: ${photo.compressionRatio}%` : ''}
        `;

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
        if (!confirm('¿Estás seguro de que quieres eliminar esta foto del historial?\nEsta acción no se puede deshacer.')) {
            return;
        }

        try {
            // Eliminar de IndexedDB
            if (this.state.dbInitialized) {
                await this.deleteFromDB('photos', photoId);
            }
            
            // Eliminar del estado local
            const deletedPhoto = this.state.photos.find(p => p.id === photoId);
            this.state.photos = this.state.photos.filter(p => p.id !== photoId);
            
            // Actualizar métricas
            this.updateMetrics();
            
            // Renderizar cambios
            this.renderDashboard();
            this.setupCharts();
            
            // Mostrar notificación
            this.showNotification('Foto eliminada correctamente', 'success');
            
        } catch (error) {
            console.error('Error al eliminar la foto:', error);
            this.showNotification('Error al eliminar la foto', 'error');
        }
    }

    saveDashboard() {
        this.saveSettings();
        
        // Animación de confirmación
        if (this.elements.saveBtn) {
            const originalHtml = this.elements.saveBtn.innerHTML;
            this.elements.saveBtn.innerHTML = '<i class="fas fa-check"></i> Guardado!';
            this.elements.saveBtn.classList.remove('btn-primary');
            this.elements.saveBtn.classList.add('btn-success');
            
            setTimeout(() => {
                this.elements.saveBtn.innerHTML = originalHtml;
                this.elements.saveBtn.classList.remove('btn-success');
                this.elements.saveBtn.classList.add('btn-primary');
            }, 2000);
        }
        
        this.showNotification('Dashboard guardado correctamente', 'success');
    }

    saveSettings() {
        if (this.state.dbInitialized) {
            this.saveToDB('settings', {
                key: 'sidebar',
                value: { collapsed: this.state.isSidebarCollapsed }
            });
            
            this.saveToDB('metrics', {
                id: 'dashboard',
                value: this.state.metrics
            });
        }
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            
            return date.toLocaleDateString('es-ES', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return 'Fecha inválida';
        }
    }

    showNotification(message, type = 'info') {
        // Eliminar notificaciones antiguas
        document.querySelectorAll('.notification').forEach(n => n.remove());

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-times-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const notification = document.createElement('div');
        notification.className = `notification alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="${icons[type] || icons.info} me-2 fa-lg"></i>
                <div class="flex-grow-1">${message}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    getDefaultMetrics() {
        return {
            lastPhotoDate: null,
            totalPhotos: 0,
            progress: {
                masaGrasa: 28,
                masaMuscular: 35,
                sumatorioPliegues: 120,
                consistencyScore: 0,
                progressScore: 0
            },
            storage: {
                totalSize: 0,
                averageSize: 0,
                photosCount: 0,
                byType: { frontal: 0, perfil: 0, espalda: 0 }
            },
            lastUpdated: new Date().toISOString()
        };
    }
}

// Inicialización global
let dashboardManager;

document.addEventListener('DOMContentLoaded', () => {
    try {
        dashboardManager = new DashboardManager();
        window.dashboardManager = dashboardManager;

        // Hacer métodos disponibles globalmente
        window.openDashboard = () => dashboardManager.openDashboard();
        window.closeDashboard = () => dashboardManager.closeDashboard();
        window.saveDashboard = () => dashboardManager.saveDashboard();
        window.exportToExcel = () => dashboardManager.exportToExcel();
        window.captureDashboard = () => dashboardManager.captureDashboard();
        // window.clearAllData = () => dashboardManager.clearAllData(); // Si no está definido, no lo expongas

        console.log('🚀 Dashboard Manager 3.6 inicializado con éxito');

    } catch (error) {
        console.error('Error crítico al inicializar Dashboard Manager:', error);
        
        // Mostrar error crítico
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        errorAlert.style.cssText = `
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 99999;
            max-width: 500px;
        `;
        errorAlert.innerHTML = `
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            <h4><i class="fas fa-exclamation-triangle"></i> Error Crítico</h4>
            <p>No se pudo inicializar el Dashboard de Seguimiento.</p>
            <p><small>${error.message}</small></p>
            <button class="btn btn-sm btn-outline-danger mt-2" onclick="location.reload()">
                <i class="fas fa-redo"></i> Recargar página
            </button>
        `;
        document.body.appendChild(errorAlert);
    }
});

   // Agrega estos métodos justo antes del cierre de la clase DashboardManager
// (antes de la línea "}" que cierra la clase)

// Método para exportar datos usando SheetJS
exportToExcel() {
    try {
        // Verificar si SheetJS está disponible
        if (typeof XLSX === 'undefined') {
            this.showNotification('La biblioteca de Excel no está cargada', 'error');
            return;
        }

        // Preparar datos
        const data = [
            ['Fecha', 'Tipo', 'Tamaño', 'Dimensiones', 'Compresión'],
            ...this.state.photos.map(photo => [
                this.formatDate(photo.date),
                photo.typeName,
                this.formatBytes(photo.size),
                `${photo.dimensions?.width || '?'}x${photo.dimensions?.height || '?'}`,
                photo.compressionRatio ? `${photo.compressionRatio}%` : 'N/A'
            ])
        ];

        // Crear workbook
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Fotos');

        // Exportar
        const fileName = `dashboard-fotos-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        this.showNotification(
            '<i class="fas fa-file-excel"></i> Datos exportados a Excel',
            'success'
        );

    } catch (error) {
        console.error('Error exportando a Excel:', error);
        this.showNotification(
            '<i class="fas fa-times-circle"></i> Error al exportar datos',
            'error'
        );
    }
}

// Método para capturar dashboard como imagen usando html2canvas
captureDashboard() {
    const dashboard = document.querySelector('.dashboard-container');
    if (!dashboard) {
        this.showNotification('No se encontró el dashboard para capturar', 'error');
        return;
    }

    this.showNotification(
        '<i class="fas fa-camera"></i> Capturando dashboard...',
        'info'
    );

    // Verificar si html2canvas está disponible
    if (typeof html2canvas === 'undefined') {
        this.showNotification('La biblioteca de captura no está cargada', 'error');
        return;
    }

    html2canvas(dashboard, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `dashboard-captura-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        this.showNotification(
            '<i class="fas fa-check-circle"></i> Captura guardada',
            'success'
        );
    }).catch(error => {
        console.error('Error capturando dashboard:', error);
        this.showNotification(
            '<i class="fas fa-times-circle"></i> Error al capturar el dashboard',
            'error'
        );
    });
}

// Método para limpiar todos los datos
async clearAllData() {
    if (!confirm('⚠️ ¿ESTÁS SEGURO?\n\nEsta acción eliminará TODAS las fotos y datos del dashboard.\n\nEsta acción NO se puede deshacer.')) {
        return;
    }

    try {
        this.showLoading(true);

        if (this.state.dbInitialized) {
            const transaction = this.db.transaction(['photos', 'metrics', 'settings'], 'readwrite');
            transaction.objectStore('photos').clear();
            transaction.objectStore('metrics').clear();
            transaction.objectStore('settings').clear();
        }

        // Resetear estado
        this.state.photos = [];
        this.state.metrics = this.getDefaultMetrics();
        this.state.isSidebarCollapsed = false;

        // Limpiar localStorage
        localStorage.removeItem('dashboard_fallback');

        // Renderizar estado vacío
        this.renderDashboard();
        this.setupCharts();

        this.showNotification(
            '<i class="fas fa-broom"></i> Todos los datos han sido eliminados',
            'success'
        );

    } catch (error) {
        console.error('Error al limpiar datos:', error);
        this.showNotification(
            '<i class="fas fa-times-circle"></i> Error al eliminar datos',
            'error'
        );
    } finally {
        this.showLoading(false);
    }
}

// Método para obtener estadísticas (ya existe en la versión 3.6)
getStats() {
    return {
        totalPhotos: this.state.photos.length,
        lastUpload: this.state.photos[0] ? this.formatDate(this.state.photos[0].date) : 'Nunca',
        progress: this.state.metrics.progress?.progressScore || 0,
        storage: {
            totalSize: this.formatBytes(this.calculateTotalSize()),
            averageSize: this.formatBytes(this.calculateAverageSize()),
            photosCount: this.state.photos.length
        }
    };
}
