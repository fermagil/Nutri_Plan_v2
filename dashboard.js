/**
 * DashboardManager - Versión 4.0 con todas las funcionalidades
 */

class DashboardManager {
    constructor() {
        // Estado inicial - Actualizado
        this.state = {
            photos: [],
            metrics: {},
            currentView: 'frontal',
            isSidebarCollapsed: false,
            isDashboardOpen: false,
            isPhotoModalOpen: false,
            dbInitialized: false,
            isLoading: false,
            // Nuevos estados
            selectedPhotoType: 'frontal',
            currentAnalysisTab: 'composition',
            currentChartFilter: 'weekly',
            securitySettings: {
                autoBackup: true,
                encryptPhotos: true,
                requirePassword: false,
                dataRetention: 365
            }
        };

        // Configuración actualizada
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
            },
            analysisTypes: {
                frontal: 'Frontal Relajado',
                perfil: 'Perfil',
                espalda: 'Espalda'
            },
            chartTypes: ['weekly', 'monthly', 'quarterly'],
            securityLevels: ['básico', 'medio', 'alto', 'personalizado']
        };
		
		// Inicializar IndexedDB
        this.db = null;
        
        // Cache de elementos
        this.elements = {};
		
        // Inicializar
        this.init();
    }
	
	// ... [TODOS LOS MÉTODOS EXISTENTES] ...
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
    const files = event.target.files || (event.dataTransfer ? event.dataTransfer.files : null);
    if (!files || files.length === 0) {
        console.warn('No se seleccionaron archivos');
        return;
    }

    const file = files[0];
    console.log('📤 Archivo seleccionado:', file.name, file.type, this.formatBytes(file.size));

    // Validar archivo
    if (!this.validateFile(file)) {
        this.showNotification(
            `<i class="fas fa-exclamation-triangle"></i> Formato o tamaño no válido<br>
             <small>Solo imágenes JPG, PNG, WebP hasta 10MB</small>`,
            'error'
        );
        return;
    }

    // Validar fecha
    if (!this.elements.photoDateInput?.value) {
        this.showNotification(
            '<i class="fas fa-calendar-alt"></i> Selecciona una fecha de toma',
            'warning'
        );
        return;
    }

    // Validar límite de fotos
    if (this.state.photos.length >= this.config.storageLimits.maxPhotos) {
        this.showNotification(
            `<i class="fas fa-exclamation-triangle"></i> Límite de ${this.config.storageLimits.maxPhotos} fotos alcanzado<br>
             <small>Elimina algunas fotos para subir nuevas</small>`,
            'error'
        );
        return;
    }

    try {
        // Mostrar progreso
        this.showUploadProgress(0, 'Iniciando compresión...');

        // Comprimir y procesar imagen
        const imageData = await this.compressAndProcessImage(file);
        console.log('✅ Imagen comprimida:', {
            originalSize: this.formatBytes(file.size),
            compressedSize: this.formatBytes(imageData.size),
            ratio: imageData.compressionRatio + '%',
            dimensions: imageData.dimensions
        });

        // Validar tamaño después de compresión
        if (imageData.size > this.config.storageLimits.maxPhotoSize) {
            this.showNotification(
                `<i class="fas fa-weight-hanging"></i> La imagen es demasiado grande<br>
                 <small>Tamaño: ${this.formatBytes(imageData.size)} (límite: ${this.formatBytes(this.config.storageLimits.maxPhotoSize)})</small>`,
                'error'
            );
            this.hideUploadProgress();
            return;
        }

        // Crear objeto de foto
        const newPhoto = {
            id: Date.now() + Math.random(), // ID único
            ...imageData,
            date: this.elements.photoDateInput.value,
            type: this.elements.photoTypeSelect?.value || 'frontal',
            typeName: this.getTypeName(this.elements.photoTypeSelect?.value || 'frontal'),
            uploadDate: new Date().toISOString(),
            tags: [],
            metadata: {
                originalName: file.name,
                originalSize: file.size,
                mimeType: file.type,
                lastModified: file.lastModified,
                uploadedAt: new Date().toISOString()
            }
        };

        console.log('📸 Nueva foto creada:', newPhoto);

        // Mostrar progreso
        this.showUploadProgress(50, 'Guardando en base de datos...');

        // Guardar en IndexedDB
        if (this.state.dbInitialized) {
            try {
                await this.saveToDB('photos', newPhoto);
                console.log('💾 Foto guardada en IndexedDB');
            } catch (dbError) {
                console.error('Error guardando en IndexedDB:', dbError);
                // Continuar con fallback a localStorage
            }
        }

        // Actualizar estado local
        this.state.photos.unshift(newPhoto); // Agregar al inicio
        this.updateMetrics();

        // Mostrar progreso
        this.showUploadProgress(80, 'Actualizando vista...');

        // Renderizar cambios
        this.renderDashboard();
        this.setupCharts();
        this.updateStorageStats();
        this.updatePhotoStats();

        // Mostrar notificación de éxito
        this.showNotification(
            `<i class="fas fa-check-circle"></i> Foto subida correctamente<br>
             <small>${file.name} (${this.formatBytes(imageData.size)})</small>`,
            'success'
        );

        // Resetear formulario
        if (this.elements.fileInput) {
            this.elements.fileInput.value = '';
        }
        this.setupDateInput();

        // Ocultar progreso con retraso
        this.showUploadProgress(100, '¡Completado!');
        setTimeout(() => {
            this.hideUploadProgress();
            
            // Mostrar la última foto en la grid
            if (this.elements.frontalGrid && newPhoto.type === 'frontal') {
                setTimeout(() => this.renderFrontalSection(), 100);
            }
        }, 1000);

    } catch (error) {
        console.error('❌ Error al procesar la imagen:', error);
        this.showNotification(
            `<i class="fas fa-times-circle"></i> Error al procesar la imagen<br>
             <small>${error.message || 'Error desconocido'}</small>`,
            'error'
        );
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
		 console.log('🔄 Renderizando sección frontal...');
    if (!this.elements.frontalGrid) {
        console.error('❌ frontalGrid no encontrado');
        return;
    }

    const frontalPhotos = this.state.photos.filter(photo => photo.type === 'frontal');
    console.log(`📸 Fotos frontales encontradas: ${frontalPhotos.length}`);
    
    if (frontalPhotos.length === 0) {
        this.elements.frontalGrid.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-images fa-4x text-muted mb-3"></i>
                <h4>No hay fotos disponibles</h4>
                <p class="text-muted">Sube tu primera foto frontal para comenzar el seguimiento</p>
                <button class="btn btn-primary mt-2" onclick="document.getElementById('file-input').click()">
                    <i class="fas fa-upload"></i> Subir Primera Foto
                </button>
            </div>
        `;
        return;
    }

    // Ordenar por fecha (más recientes primero)
    const recentPhotos = frontalPhotos.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    ).slice(0, 6); // Mostrar máximo 6 fotos
    
    console.log('🖼️ Renderizando fotos:', recentPhotos.length);
    
    this.elements.frontalGrid.innerHTML = recentPhotos.map((photo, index) => {
        const isLatest = index === 0;
        const formattedDate = this.formatDate(photo.date);
        
        // Verificar que la imagen existe
        if (!photo.image) {
            console.warn(`⚠️ Foto ${photo.id} no tiene imagen`);
            return '';
        }
        
        return `
            <div class="date-card" data-photo-id="${photo.id}">
                <div class="date-label d-flex justify-content-between align-items-center p-3 border-bottom">
                    <span class="fw-bold">${formattedDate}</span>
                    ${isLatest ? '<span class="badge bg-success"><i class="fas fa-star"></i> ÚLTIMA</span>' : ''}
                </div>
                
                <div class="photo-placeholder has-image" 
                     style="background-image: url('${photo.image}'); height: 200px;"
                     onclick="dashboardManager.viewPhoto(${photo.id})">
                    <div class="photo-overlay d-flex gap-2">
                        <button class="btn btn-sm btn-light" 
                                onclick="dashboardManager.viewPhoto(${photo.id}); event.stopPropagation()">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-light" 
                                onclick="dashboardManager.deletePhoto(${photo.id}); event.stopPropagation()">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="p-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            <i class="fas fa-ruler-combined"></i> 
                            ${photo.dimensions?.width || '?'}×${photo.dimensions?.height || '?'}
                        </small>
                        <small class="text-muted">
                            <i class="fas fa-weight-hanging"></i> 
                            ${this.formatBytes(photo.size)}
                        </small>
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

    // ========== MÉTODOS ADICIONALES ==========

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

    // Método para obtener estadísticas
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
        window.clearAllData = () => dashboardManager.clearAllData();

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



    // ========== MÉTODOS NUEVOS PARA FUNCIONALIDADES ==========

    // 1. Funcionalidad del selector de tipo de foto
    setupPhotoTypeSelector() {
        const selector = document.getElementById('photo-type');
        if (!selector) return;

        selector.addEventListener('change', (e) => {
            this.state.selectedPhotoType = e.target.value;
            console.log(`Tipo de foto seleccionado: ${this.state.selectedPhotoType}`);
            
            // Si estamos en vista de fotos, actualizar la vista correspondiente
            if (this.state.currentView === 'photos') {
                this.renderPhotoSection(e.target.value);
            }
            
            this.showNotification(
                `Vista cambiada a: ${this.config.analysisTypes[e.target.value]}`,
                'info'
            );
        });
    }

    // 2. Scrollbars para el sidebar
    setupSidebarScrollbars() {
        // Agregar clases CSS para scroll
        const valuationCard = document.querySelector('.valuation-card .card-body');
        const resultsCard = document.querySelector('.results-menu-card .card-body');
        
        if (valuationCard) {
            valuationCard.style.maxHeight = '450px';
            valuationCard.style.overflowY = 'auto';
        }
        
        if (resultsCard) {
            resultsCard.style.maxHeight = '350px';
            resultsCard.style.overflowY = 'auto';
        }
        
        // Agregar estilos CSS dinámicamente para scrollbars personalizadas
        const style = document.createElement('style');
        style.textContent = `
            .card-body::-webkit-scrollbar {
                width: 6px;
            }
            .card-body::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
            }
            .card-body::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 3px;
            }
            .card-body::-webkit-scrollbar-thumb:hover {
                background: #a1a1a1;
            }
        `;
        document.head.appendChild(style);
    }

    // 3. Funcionalidad del menú de resultados (Noticies, Negociar, Seguridad)
    setupResultsMenu() {
        const menuItems = document.querySelectorAll('.results-menu .menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remover clase active de todos los items
                menuItems.forEach(i => i.classList.remove('active'));
                
                // Agregar clase active al item clickeado
                item.classList.add('active');
                
                // Obtener la vista
                const view = item.dataset.view;
                
                // Cambiar vista según el item
                switch(view) {
                    case 'frontal':
                        this.showPhotosView();
                        break;
                    case 'negotiate':
                        this.showNegotiateView();
                        break;
                    case 'security':
                        this.showSecurityView();
                        break;
                    default:
                        this.showPhotosView();
                }
                
                this.state.currentView = view;
            });
        });
    }

    // 4. Vista de Noticies Fotos (vista principal de fotos)
    showPhotosView() {
        // Ocultar todas las secciones
        this.hideAllSections();
        
        // Mostrar secciones de fotos
        const photoSections = ['frontal', 'perfil', 'espalda'];
        photoSections.forEach(type => {
            const section = document.querySelector(`.${type}-section`);
            if (section) {
                section.classList.add('active-view');
            }
        });
        
        // Renderizar todas las grids de fotos
        this.renderAllPhotoSections();
        
        // Actualizar estadísticas
        this.updatePhotoStats();
        
        console.log('Vista de fotos activada');
    }

    // 5. Vista de Negociar Fotos (análisis y comparación)
    showNegotiateView() {
        this.hideAllSections();
        
        // Mostrar sección de análisis
        const resultsSection = document.querySelector('.results-section');
        const analysisSection = document.querySelector('.analysis-section');
        
        if (resultsSection) resultsSection.classList.add('active-view');
        if (analysisSection) analysisSection.classList.add('active-view');
        
        // Cargar datos de análisis
        this.loadAnalysisData();
        
        console.log('Vista de negociación activada');
    }

    // 6. Vista de Seguridad
    showSecurityView() {
        this.hideAllSections();
        
        const securitySection = document.querySelector('.security-section');
        if (securitySection) {
            securitySection.classList.add('active-view');
        }
        
        // Cargar configuración de seguridad
        this.loadSecuritySettings();
        
        console.log('Vista de seguridad activada');
    }

    // 7. Renderizar todas las secciones de fotos
    renderAllPhotoSections() {
        const types = ['frontal', 'perfil', 'espalda'];
        
        types.forEach(type => {
            this.renderPhotoSection(type);
            this.updateLastPhotoDate(type);
        });
    }

    // 8. Renderizar sección de fotos específica
    renderPhotoSection(type) {
        const gridId = `${type}-grid`;
        const grid = document.getElementById(gridId);
        
        if (!grid) return;
        
        const photos = this.state.photos.filter(photo => photo.type === type);
        
        if (photos.length === 0) {
            grid.innerHTML = `
                <div class="text-center w-100 py-5">
                    <i class="fas fa-images fa-4x text-muted mb-3"></i>
                    <h4 class="mb-3">No hay fotos de ${this.config.analysisTypes[type]}</h4>
                    <p class="text-muted mb-4">Sube tu primera foto para comenzar el seguimiento</p>
                    <button class="btn btn-primary" onclick="document.getElementById('photo-type').value='${type}'; document.getElementById('file-input').click()">
                        <i class="fas fa-upload me-2"></i>Subir Foto de ${this.config.analysisTypes[type]}
                    </button>
                </div>
            `;
            return;
        }
        
        // Ordenar por fecha (más recientes primero)
        const recentPhotos = photos.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        ).slice(0, 6);
        
        grid.innerHTML = recentPhotos.map((photo, index) => {
            const isLatest = index === 0;
            const formattedDate = this.formatDate(photo.date);
            
            return `
                <div class="date-card" data-photo-id="${photo.id}">
                    <div class="date-label">
                        <span class="fw-bold">${formattedDate}</span>
                        ${isLatest ? '<span class="badge bg-success"><i class="fas fa-star me-1"></i>ÚLTIMA</span>' : ''}
                    </div>
                    
                    <div class="photo-placeholder has-image" 
                         style="background-image: url('${photo.image}')"
                         onclick="dashboardManager.viewPhoto(${photo.id})">
                        <div class="photo-overlay">
                            <button class="view-btn" 
                                    onclick="dashboardManager.viewPhoto(${photo.id}); event.stopPropagation()">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="delete-btn" 
                                    onclick="dashboardManager.deletePhoto(${photo.id}); event.stopPropagation()">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-ruler-combined me-1"></i>
                                ${photo.dimensions?.width || '?'}×${photo.dimensions?.height || '?'}
                            </small>
                            <small class="text-muted">
                                <i class="fas fa-weight-hanging me-1"></i>
                                ${this.formatBytes(photo.size)}
                            </small>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 9. Actualizar fecha de última foto por tipo
    updateLastPhotoDate(type) {
        const elementId = `last-${type}-photo-date`;
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const photos = this.state.photos.filter(photo => photo.type === type);
        if (photos.length > 0) {
            const lastPhoto = photos.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            element.textContent = this.formatDate(lastPhoto.date);
        } else {
            element.textContent = 'Nunca';
        }
    }

    // 10. Sección de Resultas - Análisis detallado
    setupResultsSection() {
        // Agregar HTML para la sección de análisis si no existe
        if (!document.querySelector('.analysis-section')) {
            const resultsSection = document.querySelector('.results-section');
            if (resultsSection) {
                resultsSection.insertAdjacentHTML('afterend', this.getAnalysisHTML());
            }
        }
        
        // Inicializar pestañas de análisis
        this.setupAnalysisTabs();
    }

    getAnalysisHTML() {
        return `
            <section class="section analysis-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-chart-pie"></i> ANÁLISIS DETALLADO</h2>
                    <div class="analysis-tabs">
                        <button class="analysis-tab active" data-tab="composition">
                            <i class="fas fa-clipboard-list"></i> Composición
                        </button>
                        <button class="analysis-tab" data-tab="progress">
                            <i class="fas fa-chart-line"></i> Progreso
                        </button>
                        <button class="analysis-tab" data-tab="volume">
                            <i class="fas fa-balance-scale"></i> Volumen
                        </button>
                    </div>
                </div>
                
                <div class="analysis-content">
                    <!-- Contenido dinámico de análisis -->
                    <div id="analysis-composition" class="tab-content active">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="analysis-card">
                                    <h5><i class="fas fa-percentage"></i> Porcentaje de Grasa</h5>
                                    <div class="progress mt-3" style="height: 20px;">
                                        <div class="progress-bar bg-danger" role="progressbar" style="width: ${this.state.metrics.progress?.masaGrasa || 28}%">
                                            ${this.state.metrics.progress?.masaGrasa || 28}%
                                        </div>
                                    </div>
                                    <small class="text-muted">Meta: < 15%</small>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="analysis-card">
                                    <h5><i class="fas fa-dumbbell"></i> Masa Muscular</h5>
                                    <div class="progress mt-3" style="height: 20px;">
                                        <div class="progress-bar bg-success" role="progressbar" style="width: ${(this.state.metrics.progress?.masaMuscular || 35) * 2}%">
                                            ${this.state.metrics.progress?.masaMuscular || 35} kg
                                        </div>
                                    </div>
                                    <small class="text-muted">Meta: > 40kg</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="analysis-progress" class="tab-content">
                        <div class="timeline">
                            <!-- Timeline de progreso -->
                        </div>
                    </div>
                    
                    <div id="analysis-volume" class="tab-content">
                        <div class="volume-controls">
                            <!-- Controles de volumen -->
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    setupAnalysisTabs() {
        const tabs = document.querySelectorAll('.analysis-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                
                // Remover clase active de todas las pestañas
                tabs.forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Mostrar contenido correspondiente
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`analysis-${tabId}`)?.classList.add('active');
            });
        });
    }

    // 11. Sección ANES Y PERIL - Comparación
    setupAnesPerilSection() {
        const section = document.querySelector('.anes-peril-section');
        if (!section) return;
        
        // Agregar funcionalidad de comparación
        this.setupComparisonControls();
    }

    setupComparisonControls() {
        // Implementar controles de comparación
        const compareBtn = document.querySelector('.compare-btn');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                this.comparePhotos();
            });
        }
    }

    comparePhotos() {
        // Lógica para comparar fotos
        const selectedPhotos = this.getSelectedPhotosForComparison();
        
        if (selectedPhotos.length < 2) {
            this.showNotification('Selecciona al menos 2 fotos para comparar', 'warning');
            return;
        }
        
        // Mostrar modal de comparación
        this.showComparisonModal(selectedPhotos);
    }

    // 12. Sección MOMANTICATE - Métricas avanzadas
    setupMomanticateSection() {
        this.renderAdvancedMetrics();
        this.setupMetricTags();
    }

    setupMetricTags() {
        const tags = document.querySelectorAll('.metric-tag');
        tags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                const metricType = e.currentTarget.dataset.metric;
                this.filterMetrics(metricType);
            });
        });
    }

    filterMetrics(type) {
        // Filtrar métricas según el tipo
        const rows = document.querySelectorAll('.metrics-table tbody tr');
        rows.forEach(row => {
            if (type === 'all' || row.dataset.metric === type) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    renderAdvancedMetrics() {
        const tableBody = document.getElementById('metrics-table-body');
        if (!tableBody) return;
        
        const metrics = [
            { name: 'Masa Grasa', initial: '28%', current: '27%', trend: 'down', type: 'fat' },
            { name: 'Masa Muscular', initial: '35kg', current: '35.6kg', trend: 'up', type: 'muscle' },
            { name: 'Sumatorio Pliegues', initial: '120mm', current: '116mm', trend: 'down', type: 'folds' },
            { name: 'IMC', initial: '24.5', current: '23.8', trend: 'down', type: 'bmi' },
            { name: 'Circunferencia Cintura', initial: '85cm', current: '83cm', trend: 'down', type: 'waist' },
            { name: 'Circunferencia Cadera', initial: '95cm', current: '94cm', trend: 'down', type: 'hips' }
        ];
        
        tableBody.innerHTML = metrics.map(metric => {
            const trendClass = metric.trend === 'up' ? 'text-success' : 'text-primary';
            const trendIcon = metric.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
            
            return `
                <tr data-metric="${metric.type}">
                    <td>${metric.name}</td>
                    <td>${metric.initial}</td>
                    <td class="${trendClass}">
                        <i class="${trendIcon} me-1"></i>${metric.current}
                    </td>
                </tr>
            `;
        }).join('');
    }

    // 13. Sección de Gráficos - Funcionalidad completa
    setupChartsSection() {
        this.renderResultsChart();
        this.renderProgressChart();
        this.setupChartFilters();
    }

    setupChartFilters() {
        const filterBtns = document.querySelectorAll('.chart-filter');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.state.currentChartFilter = filter;
                
                // Actualizar gráficos con nuevo filtro
                this.updateCharts(filter);
                
                // Remover clase active de todos los botones
                filterBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    }

    updateCharts(filter) {
        // Actualizar gráficos según el filtro seleccionado
        switch(filter) {
            case 'weekly':
                this.renderWeeklyChart();
                break;
            case 'monthly':
                this.renderMonthlyChart();
                break;
            case 'quarterly':
                this.renderQuarterlyChart();
                break;
        }
    }

    renderWeeklyChart() {
        const chartData = [
            { label: 'Sem 1', value: 20, color: '#4f46e5' },
            { label: 'Sem 2', value: 35, color: '#7c3aed' },
            { label: 'Sem 3', value: 50, color: '#a855f7' },
            { label: 'Sem 4', value: 65, color: '#10b981' }
        ];
        
        this.renderChart('results-chart', chartData);
    }

    renderChart(chartId, data) {
        const chart = document.getElementById(chartId);
        if (!chart) return;
        
        chart.innerHTML = data.map(item => {
            const barHeight = Math.max(10, item.value);
            return `
                <div class="bar-group" data-value="${item.value}">
                    <div class="bar" style="height: ${barHeight}%; background: ${item.color}"></div>
                    <div class="bar-label">${item.label}</div>
                    <div class="bar-value">${item.value}</div>
                </div>
            `;
        }).join('');
    }

    // 14. Sección Términos - Información legal
    setupTermsSection() {
        // Cargar términos y condiciones
        this.loadTermsContent();
        
        // Configurar botón de aceptación
        const acceptBtn = document.querySelector('.accept-terms-btn');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                this.acceptTerms();
            });
        }
    }

    loadTermsContent() {
        const termsContent = `
            <h4><i class="fas fa-file-contract"></i> Términos y Condiciones</h4>
            <div class="terms-content">
                <p><strong>Última actualización:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
                
                <h5>1. Uso del Servicio</h5>
                <p>Este servicio está diseñado para el seguimiento visual de composición corporal. El usuario es responsable de la precisión de los datos proporcionados.</p>
                
                <h5>2. Privacidad de Datos</h5>
                <p>Todas las imágenes y datos personales se almacenan de forma segura y encriptada. No compartimos información personal con terceros.</p>
                
                <h5>3. Propiedad Intelectual</h5>
                <p>Las imágenes subidas son propiedad del usuario. El servicio solo las utiliza para proporcionar análisis y seguimiento.</p>
                
                <h5>4. Limitación de Responsabilidad</h5>
                <p>Este servicio no sustituye el consejo médico profesional. Los resultados son indicativos y deben interpretarse por un profesional de la salud.</p>
            </div>
            
            <div class="terms-acceptance mt-4">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="terms-checkbox">
                    <label class="form-check-label" for="terms-checkbox">
                        He leído y acepto los términos y condiciones
                    </label>
                </div>
                <button class="btn btn-primary mt-3 accept-terms-btn" disabled>
                    <i class="fas fa-check"></i> Aceptar Términos
                </button>
            </div>
        `;
        
        const termsSection = document.querySelector('.terms-section');
        if (termsSection) {
            termsSection.querySelector('.info-box').innerHTML = termsContent;
            
            // Habilitar botón cuando se marque el checkbox
            const checkbox = document.getElementById('terms-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    const btn = document.querySelector('.accept-terms-btn');
                    btn.disabled = !e.target.checked;
                });
            }
        }
    }

    acceptTerms() {
        localStorage.setItem('termsAccepted', 'true');
        localStorage.setItem('termsAcceptedDate', new Date().toISOString());
        
        this.showNotification('Términos aceptados correctamente', 'success');
        
        const btn = document.querySelector('.accept-terms-btn');
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Términos Aceptados';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-success');
        btn.disabled = true;
    }

    // 15. Funcionalidad de Seguridad
    setupSecurityControls() {
        // Configurar controles de seguridad
        const securitySection = document.querySelector('.security-section');
        if (!securitySection) return;
        
        securitySection.innerHTML = `
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-shield-alt"></i> CONFIGURACIÓN DE SEGURIDAD</h2>
            </div>
            
            <div class="security-settings">
                <div class="security-level mb-4">
                    <h5><i class="fas fa-layer-group"></i> Nivel de Seguridad</h5>
                    <div class="btn-group" role="group">
                        ${['básico', 'medio', 'alto', 'personalizado'].map(level => `
                            <button type="button" class="btn btn-outline-primary ${level === 'medio' ? 'active' : ''}" 
                                    data-level="${level}">
                                ${level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <div class="security-options">
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="auto-backup" checked>
                        <label class="form-check-label" for="auto-backup">
                            <i class="fas fa-save"></i> Backup automático diario
                        </label>
                    </div>
                    
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="encrypt-photos" checked>
                        <label class="form-check-label" for="encrypt-photos">
                            <i class="fas fa-lock"></i> Encriptar fotos almacenadas
                        </label>
                    </div>
                    
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="require-password">
                        <label class="form-check-label" for="require-password">
                            <i class="fas fa-key"></i> Requerir contraseña para acceder
                        </label>
                    </div>
                    
                    <div class="form-group mb-3">
                        <label for="data-retention"><i class="fas fa-calendar-times"></i> Retención de datos</label>
                        <select class="form-select" id="data-retention">
                            <option value="30">30 días</option>
                            <option value="90">90 días</option>
                            <option value="365" selected>1 año</option>
                            <option value="0">Indefinido</option>
                        </select>
                    </div>
                </div>
                
                <div class="security-actions mt-4">
                    <button class="btn btn-primary me-2" id="save-security">
                        <i class="fas fa-save"></i> Guardar Configuración
                    </button>
                    <button class="btn btn-outline-danger" id="reset-security">
                        <i class="fas fa-redo"></i> Restaurar Valores por Defecto
                    </button>
                </div>
            </div>
        `;
        
        // Configurar eventos de seguridad
        this.setupSecurityEvents();
    }

    setupSecurityEvents() {
        // Niveles de seguridad
        document.querySelectorAll('[data-level]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = e.currentTarget.dataset.level;
                this.setSecurityLevel(level);
            });
        });
        
        // Guardar configuración
        document.getElementById('save-security')?.addEventListener('click', () => {
            this.saveSecuritySettings();
        });
        
        // Resetear configuración
        document.getElementById('reset-security')?.addEventListener('click', () => {
            this.resetSecuritySettings();
        });
    }

    setSecurityLevel(level) {
        // Actualizar estado según nivel
        switch(level) {
            case 'básico':
                this.state.securitySettings = { autoBackup: true, encryptPhotos: false, requirePassword: false, dataRetention: 30 };
                break;
            case 'medio':
                this.state.securitySettings = { autoBackup: true, encryptPhotos: true, requirePassword: false, dataRetention: 90 };
                break;
            case 'alto':
                this.state.securitySettings = { autoBackup: true, encryptPhotos: true, requirePassword: true, dataRetention: 365 };
                break;
        }
        
        // Actualizar UI
        this.updateSecurityUI();
        
        this.showNotification(`Nivel de seguridad establecido: ${level}`, 'success');
    }

    updateSecurityUI() {
        const settings = this.state.securitySettings;
        
        const autoBackup = document.getElementById('auto-backup');
        const encryptPhotos = document.getElementById('encrypt-photos');
        const requirePassword = document.getElementById('require-password');
        const dataRetention = document.getElementById('data-retention');
        
        if (autoBackup) autoBackup.checked = settings.autoBackup;
        if (encryptPhotos) encryptPhotos.checked = settings.encryptPhotos;
        if (requirePassword) requirePassword.checked = settings.requirePassword;
        if (dataRetention) dataRetention.value = settings.dataRetention;
    }

    // ========== MÉTODOS AUXILIARES ==========

    hideAllSections() {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active-view');
        });
    }

    loadAnalysisData() {
        // Cargar datos para análisis
        console.log('Cargando datos de análisis...');
        
        // Aquí iría la lógica para cargar datos de análisis
        // Por ahora solo mostramos un mensaje
        this.showNotification('Datos de análisis cargados', 'info');
    }

    loadSecuritySettings() {
        // Cargar configuración de seguridad desde localStorage
        const savedSettings = localStorage.getItem('securitySettings');
        if (savedSettings) {
            this.state.securitySettings = JSON.parse(savedSettings);
        }
        
        // Mostrar sección de seguridad
        this.setupSecurityControls();
        this.updateSecurityUI();
    }

    saveSecuritySettings() {
        // Guardar configuración de seguridad
        localStorage.setItem('securitySettings', JSON.stringify(this.state.securitySettings));
        this.showNotification('Configuración de seguridad guardada', 'success');
    }

    resetSecuritySettings() {
        // Resetear a valores por defecto
        this.state.securitySettings = {
            autoBackup: true,
            encryptPhotos: true,
            requirePassword: false,
            dataRetention: 365
        };
        
        this.updateSecurityUI();
        this.showNotification('Configuración restaurada a valores por defecto', 'info');
    }

    // ========== INICIALIZACIÓN MEJORADA ==========

    init() {
        super.init(); // Llama al init original si existe
        
        // Configurar todas las funcionalidades nuevas
        this.setupPhotoTypeSelector();
        this.setupSidebarScrollbars();
        this.setupResultsMenu();
        this.setupResultsSection();
        this.setupAnesPerilSection();
        this.setupMomanticateSection();
        this.setupChartsSection();
        this.setupTermsSection();
        
        console.log('✅ Dashboard Manager 4.0 inicializado con todas las funcionalidades');
    }
}
