class MatterUIVisualizer {
    constructor() {
        this.xmlParser = new MatterXMLParser();
        this.deviceTypeParser = new DeviceTypeParser();
        this.uiComponents = new UIComponents();
        this.configGenerator = new UIConfigGenerator();
        this.currentCluster = null;
        this.currentDeviceType = null;
        this.currentConfig = null;

        this.initializeApp();
    }

    async initializeApp() {
        this.setupEventListeners();
        await this.loadClusterData();
        this.setupStateChangeListener();
    }

    setupEventListeners() {
        // Device category selection
        const deviceCategorySelect = document.getElementById('device-category-select');
        deviceCategorySelect.addEventListener('change', (e) => {
            this.loadDeviceCategory(e.target.value);
        });

        // Device type selection
        const deviceTypeSelect = document.getElementById('device-type-select');
        deviceTypeSelect.addEventListener('change', (e) => {
            this.loadDeviceType(e.target.value);
        });

        // Cluster selection
        const clusterSelect = document.getElementById('cluster-select');
        clusterSelect.addEventListener('change', (e) => {
            this.loadCluster(e.target.value);
        });


        // Reset button
        const resetBtn = document.getElementById('reset-state');
        resetBtn.addEventListener('click', () => {
            this.resetState();
        });

        // Copy config button
        const copyBtn = document.getElementById('copy-config');
        copyBtn.addEventListener('click', () => {
            this.copyConfig();
        });

        // Download config button
        const downloadBtn = document.getElementById('download-config');
        downloadBtn.addEventListener('click', () => {
            this.downloadConfig();
        });

        // Copy UI config button
        const copyUIConfigBtn = document.getElementById('copy-ui-config');
        copyUIConfigBtn.addEventListener('click', () => {
            this.copyUIConfig();
        });

        // Download UI config button
        const downloadUIConfigBtn = document.getElementById('download-ui-config');
        downloadUIConfigBtn.addEventListener('click', () => {
            this.downloadUIConfig();
        });
    }

    async loadClusterData() {
        // Load device type data
        await this.deviceTypeParser.loadDeviceTypeData();
        console.log('Loading cluster data...');
    }

    loadDeviceCategory(categoryKey) {
        if (!categoryKey) {
            this.showPlaceholder();
            this.updateDeviceTypeSelector([]);
            this.updateClusterSelector([]);
            return;
        }

        const category = this.deviceTypeParser.deviceTypes.get(categoryKey);
        if (!category) {
            console.error('Device category not found:', categoryKey);
            return;
        }

        // Update device type selector with available device types
        this.updateDeviceTypeSelector(category.deviceTypes);

        // Reset device type and cluster selections
        const deviceTypeSelect = document.getElementById('device-type-select');
        const clusterSelect = document.getElementById('cluster-select');
        deviceTypeSelect.value = '';
        clusterSelect.value = '';
        this.showPlaceholder();

        this.currentDeviceCategory = categoryKey;
    }

    loadDeviceType(deviceTypeKey) {
        if (!deviceTypeKey) {
            this.showPlaceholder();
            this.updateClusterSelector([]);
            return;
        }

        // Find the device type in the current category
        const category = this.deviceTypeParser.deviceTypes.get(this.currentDeviceCategory);
        if (!category) {
            console.error('Current category not found:', this.currentDeviceCategory);
            return;
        }

        const deviceType = category.deviceTypes.find(dt => dt.key === deviceTypeKey);
        if (!deviceType) {
            console.error('Device type not found:', deviceTypeKey);
            return;
        }

        // Get clusters for this device type
        const clusters = deviceType.clusters.map(clusterName => {
            const cluster = category.clusters.find(c => c.type === clusterName);
            return cluster ? { id: cluster.id, name: cluster.name, type: cluster.type } : null;
        }).filter(Boolean);

        // Update cluster selector with available clusters
        this.updateClusterSelector(clusters);

        // Update device info
        this.updateDeviceInfo(deviceType.name, 'Select a cluster');

        // Reset cluster selection
        const clusterSelect = document.getElementById('cluster-select');
        clusterSelect.value = '';
        this.showPlaceholder();

        this.currentDeviceType = deviceTypeKey;
    }

    updateDeviceTypeSelector(deviceTypes) {
        const deviceTypeSelect = document.getElementById('device-type-select');
        deviceTypeSelect.innerHTML = '<option value="">Choose a device type...</option>';
        
        if (deviceTypes.length === 0) {
            deviceTypeSelect.disabled = true;
            return;
        }

        deviceTypeSelect.disabled = false;
        deviceTypes.forEach(deviceType => {
            const option = document.createElement('option');
            option.value = deviceType.key;
            option.textContent = deviceType.name;
            deviceTypeSelect.appendChild(option);
        });
    }

    updateClusterSelector(clusters) {
        const clusterSelect = document.getElementById('cluster-select');
        clusterSelect.innerHTML = '<option value="">Choose a cluster...</option>';
        
        if (clusters.length === 0) {
            clusterSelect.disabled = true;
            clusterSelect.innerHTML = '<option value="">Choose a device type first...</option>';
            return;
        }

        clusterSelect.disabled = false;
        
        clusters.forEach(cluster => {
            const option = document.createElement('option');
            option.value = cluster.type;
            option.textContent = `${cluster.name} (${cluster.id})`;
            clusterSelect.appendChild(option);
        });
    }

    async loadCluster(clusterType) {
        if (!clusterType) {
            this.showPlaceholder();
            return;
        }

        try {
            // Get cluster info from device type parser
            const clusterId = this.getClusterIdForType(clusterType);
            const clusterInfo = this.deviceTypeParser.getClusterInfo(clusterId);

            if (!clusterInfo) {
                this.showError(`Cluster information not found for ${clusterType}`);
                return;
            }

            // Update device info
            const category = this.deviceTypeParser.deviceTypes.get(this.currentDeviceCategory);
            const deviceType = category.deviceTypes.find(dt => dt.key === this.currentDeviceType);
            this.updateDeviceInfo(deviceType.name, clusterInfo.name);

            // Create UI component
            const uiContainer = document.getElementById('ui-container');
            uiContainer.innerHTML = '';

            // Set current device type for UI components
            window.currentDeviceType = this.currentDeviceType;

            const component = this.uiComponents.createComponent(clusterType, uiContainer);
            uiContainer.appendChild(component);

            // Generate UI config
            this.currentConfig = this.configGenerator.generateUIConfig(
                clusterType,
                clusterInfo
            );

            // Update config displays
            this.updateConfigDisplay();
            this.updateUIConfigDisplay();

            // Show cluster info
            this.showClusterInfo(clusterInfo);

            this.currentCluster = clusterType;

        } catch (error) {
            console.error('Error loading cluster:', error);
            this.showError('Failed to load cluster');
        }
    }

    getClusterIdForType(clusterType) {
        const clusterIdMap = {
            'Identify': '0x0003',
            'Groups': '0x0004',
            'OnOff': '0x0006',
            'LevelControl': '0x0008',
            'ColorControl': '0x0300',
            'DoorLock': '0x0101',
            'Thermostat': '0x0201',
            'FanControl': '0x0202',
            'ScenesManagement': '0x0062',
            'PumpConfigurationAndControl': '0x0200',
            'ValveConfigurationAndControl': '0x0201'
        };
        return clusterIdMap[clusterType] || '0x0006';
    }

    getMockClusterInfo(clusterType) {
        const clusterInfos = {
            'OnOff': {
                id: '0x0006',
                name: 'On/Off',
                revision: '6',
                classification: {
                    hierarchy: 'base',
                    role: 'application',
                    picsCode: 'OO',
                    scope: 'Endpoint'
                },
                features: [
                    { bit: '0', code: 'LT', name: 'Lighting', summary: 'Lighting behavior' }
                ],
                attributes: [
                    { id: '0x0000', name: 'OnOff', type: 'boolean' }
                ],
                commands: [
                    { id: '0x00', name: 'Off', direction: 'commandToServer' },
                    { id: '0x01', name: 'On', direction: 'commandToServer' },
                    { id: '0x02', name: 'Toggle', direction: 'commandToServer' }
                ]
            },
            'LevelControl': {
                id: '0x0008',
                name: 'Level Control',
                revision: '6',
                classification: {
                    hierarchy: 'base',
                    role: 'application',
                    picsCode: 'LVL',
                    scope: 'Endpoint'
                },
                features: [
                    { bit: '0', code: 'OO', name: 'OnOff', summary: 'On/Off dependency' },
                    { bit: '1', code: 'LT', name: 'Lighting', summary: 'Lighting behavior' }
                ],
                attributes: [
                    { id: '0x0000', name: 'CurrentLevel', type: 'uint8' },
                    { id: '0x0001', name: 'RemainingTime', type: 'uint16' }
                ],
                commands: [
                    { id: '0x00', name: 'MoveToLevel', direction: 'commandToServer' },
                    { id: '0x01', name: 'Move', direction: 'commandToServer' },
                    { id: '0x02', name: 'Step', direction: 'commandToServer' }
                ]
            },
            'ColorControl': {
                id: '0x0300',
                name: 'Color Control',
                revision: '7',
                classification: {
                    hierarchy: 'base',
                    role: 'application',
                    picsCode: 'CC',
                    scope: 'Endpoint'
                },
                features: [
                    { bit: '0', code: 'HS', name: 'HueSaturation', summary: 'Hue/Saturation support' },
                    { bit: '1', code: 'EHUE', name: 'EnhancedHue', summary: 'Enhanced hue support' },
                    { bit: '2', code: 'CL', name: 'ColorLoop', summary: 'Color loop support' }
                ],
                attributes: [
                    { id: '0x0000', name: 'CurrentHue', type: 'uint8' },
                    { id: '0x0001', name: 'CurrentSaturation', type: 'uint8' },
                    { id: '0x0007', name: 'ColorTemperatureMireds', type: 'uint16' }
                ],
                commands: [
                    { id: '0x00', name: 'MoveToHue', direction: 'commandToServer' },
                    { id: '0x01', name: 'MoveHue', direction: 'commandToServer' },
                    { id: '0x02', name: 'StepHue', direction: 'commandToServer' }
                ]
            }
        };

        return clusterInfos[clusterType] || clusterInfos['OnOff'];
    }

    updateDeviceInfo(deviceTypeName, clusterName) {
        const deviceType = document.getElementById('device-type');
        const deviceStatus = document.getElementById('device-status');

        if (deviceType) {
            deviceType.textContent = deviceTypeName;
        }
        if (deviceStatus) {
            deviceStatus.textContent = clusterName || 'Online';
        }
    }

    updateUIConfigDisplay() {
        const uiConfigDisplay = document.getElementById('ui-config-display');
        if (!uiConfigDisplay || !this.currentConfig) return;

        // Extract everything except cluster_info and capabilities
        const uiConfig = { ...this.currentConfig };
        delete uiConfig.cluster_info;
        delete uiConfig.capabilities;

        const configJSON = this.configGenerator.formatConfigAsJSON(uiConfig);
        uiConfigDisplay.textContent = configJSON;

        // Add syntax highlighting (basic)
        this.highlightJSON(uiConfigDisplay);
    }

    updateConfigDisplay() {
        const configDisplay = document.getElementById('config-display');
        if (!configDisplay || !this.currentConfig) return;

        // Extract only cluster_info and capabilities from the current config
        const capabilityConfig = {
            cluster_info: this.currentConfig.cluster_info || {},
            capabilities: this.currentConfig.capabilities || {}
        };

        const configJSON = this.configGenerator.formatConfigAsJSON(capabilityConfig);
        configDisplay.textContent = configJSON;

        // Add syntax highlighting (basic)
        this.highlightJSON(configDisplay);
    }

    highlightJSON(element) {
        const text = element.textContent;
        const highlighted = text
            .replace(/(".*?")\s*:/g, '<span style="color: #055E88;">$1</span>:')
            .replace(/:\s*(".*?")/g, ': <span style="color: #009900;">$1</span>')
            .replace(/:\s*(\d+)/g, ': <span style="color: #ff6600;">$1</span>')
            .replace(/:\s*(true|false)/g, ': <span style="color: #cc0000;">$1</span>');

        element.innerHTML = highlighted;
    }

    showClusterInfo(clusterInfo) {
        const infoPanel = document.getElementById('info-panel');
        const clusterInfoDiv = document.getElementById('cluster-info');

        if (!infoPanel || !clusterInfoDiv) return;

        clusterInfoDiv.innerHTML = `
            <div class="info-section">
                <h4>Cluster Details</h4>
                <p><strong>ID:</strong> ${clusterInfo.id}</p>
                <p><strong>Name:</strong> ${clusterInfo.name}</p>
                <p><strong>Revision:</strong> ${clusterInfo.revision}</p>
                <p><strong>Role:</strong> ${clusterInfo.classification?.role || 'N/A'}</p>
            </div>
            <div class="info-section">
                <h4>Features</h4>
                <ul>
                    ${clusterInfo.features?.map(f => `<li>${f.name}: ${f.summary}</li>`).join('') || '<li>No features</li>'}
                </ul>
            </div>
            <div class="info-section">
                <h4>Attributes</h4>
                <ul>
                    ${clusterInfo.attributes?.map(a => `<li>${a.name} (${a.type})</li>`).join('') || '<li>No attributes</li>'}
                </ul>
            </div>
            <div class="info-section">
                <h4>Commands</h4>
                <ul>
                    ${clusterInfo.commands?.map(c => `<li>${c.name}</li>`).join('') || '<li>No commands</li>'}
                </ul>
            </div>
        `;

        infoPanel.style.display = 'block';
        
        // Show flags and telemetry panels
        this.showFlagsPanel();
        this.showTelemetryPanel();
    }

    showFlagsPanel() {
        const flagsPanel = document.getElementById('flags-panel');
        if (!flagsPanel || !this.currentConfig?.ui_metadata) return;

        const uiMetadata = this.currentConfig.ui_metadata;
        
        // Generate feature flag name based on cluster name (kebab-case with -cluster suffix)
        const clusterName = this.currentConfig?.cluster_info?.name || 'Unknown';
        const flagName = `matter-ui-${clusterName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}-cluster`;
        
        // Determine environment (this could be dynamic based on actual environment)
        const environments = ['GoldenDev', 'GoldenQA', 'Release'];
        const environment = environments[Math.floor(Math.random() * environments.length)]; // For demo purposes
        
        // Generate last updated timestamp
        const lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        // Update flag values
        document.getElementById('flag-name').textContent = flagName;
        document.getElementById('flag-environment').textContent = environment;
        document.getElementById('flag-last-updated').textContent = lastUpdated;

        flagsPanel.style.display = 'block';
    }

    showTelemetryPanel() {
        const telemetryPanel = document.getElementById('telemetry-panel');
        if (!telemetryPanel) return;

        // Just show the panel with dashboard links - no dynamic content needed
        telemetryPanel.style.display = 'block';
    }

    showPlaceholder() {
        const uiContainer = document.getElementById('ui-container');
        const configDisplay = document.getElementById('config-display');
        const infoPanel = document.getElementById('info-panel');

        uiContainer.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-mouse-pointer"></i>
                <p>Select a cluster to see its UI component</p>
            </div>
        `;

        configDisplay.textContent = '{\n  "message": "Select a cluster to see its configuration"\n}';

        if (infoPanel) {
            infoPanel.style.display = 'none';
        }

        // Hide flags and telemetry panels
        const flagsPanel = document.getElementById('flags-panel');
        const telemetryPanel = document.getElementById('telemetry-panel');
        
        if (flagsPanel) {
            flagsPanel.style.display = 'none';
        }
        if (telemetryPanel) {
            telemetryPanel.style.display = 'none';
        }
    }

    showError(message) {
        const uiContainer = document.getElementById('ui-container');
        uiContainer.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-exclamation-triangle" style="color: #e53e3e;"></i>
                <p style="color: #e53e3e;">${message}</p>
            </div>
        `;
    }


    resetState() {
        // Reset device category selection
        const deviceCategorySelect = document.getElementById('device-category-select');
        deviceCategorySelect.value = '';
        
        // Reset device type selection
        const deviceTypeSelect = document.getElementById('device-type-select');
        deviceTypeSelect.value = '';
        deviceTypeSelect.disabled = true;
        deviceTypeSelect.innerHTML = '<option value="">Choose a category first...</option>';
        
        // Reset cluster selection
        const clusterSelect = document.getElementById('cluster-select');
        clusterSelect.value = '';
        clusterSelect.disabled = true;
        clusterSelect.innerHTML = '<option value="">Choose a device type first...</option>';
        
        // Reset current state
        this.currentDeviceCategory = null;
        this.currentDeviceType = null;
        this.currentCluster = null;
        
        // Show placeholder
        this.showPlaceholder();
    }

    async copyConfig() {
        if (!this.currentConfig) return;

        // Extract only cluster_info and capabilities from the current config
        const capabilityConfig = {
            cluster_info: this.currentConfig.cluster_info || {},
            capabilities: this.currentConfig.capabilities || {}
        };

        const configJSON = this.configGenerator.formatConfigAsJSON(capabilityConfig);

        try {
            await navigator.clipboard.writeText(configJSON);
            this.showNotification('Capabilities copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showNotification('Failed to copy capabilities', 'error');
        }
    }

    downloadConfig() {
        if (!this.currentConfig) return;

        // Extract only cluster_info and capabilities from the current config
        const capabilityConfig = {
            cluster_info: this.currentConfig.cluster_info || {},
            capabilities: this.currentConfig.capabilities || {}
        };

        const configJSON = this.configGenerator.formatConfigAsJSON(capabilityConfig);
        const blob = new Blob([configJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentCluster}_capabilities.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Capabilities downloaded!');
    }

    async copyUIConfig() {
        if (!this.currentConfig) return;

        // Extract everything except cluster_info and capabilities
        const uiConfig = { ...this.currentConfig };
        delete uiConfig.cluster_info;
        delete uiConfig.capabilities;

        const configJSON = this.configGenerator.formatConfigAsJSON(uiConfig);

        try {
            await navigator.clipboard.writeText(configJSON);
            this.showNotification('UI Configuration copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showNotification('Failed to copy UI configuration', 'error');
        }
    }

    downloadUIConfig() {
        if (!this.currentConfig) return;

        // Extract everything except cluster_info and capabilities
        const uiConfig = { ...this.currentConfig };
        delete uiConfig.cluster_info;
        delete uiConfig.capabilities;

        const configJSON = this.configGenerator.formatConfigAsJSON(uiConfig);
        const blob = new Blob([configJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentCluster}_ui_configuration.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('UI Configuration downloaded!');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#e53e3e' : '#38a169'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    setupStateChangeListener() {
        document.addEventListener('stateChange', (event) => {
            const { clusterType, state } = event.detail;

            if (this.currentCluster === clusterType && this.currentConfig) {
                // Update config displays
                this.updateConfigDisplay();
                this.updateUIConfigDisplay();
            }
        });
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MatterUIVisualizer();
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .info-section {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .info-section:last-child {
        border-bottom: none;
    }
    
    .info-section h4 {
        color: #2d3748;
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }
    
    .info-section p, .info-section li {
        color: #4a5568;
        margin-bottom: 0.25rem;
    }
    
    .info-section ul {
        list-style: none;
        padding-left: 0;
    }
    
    .info-section li {
        padding: 0.25rem 0;
        border-left: 3px solid #e2e8f0;
        padding-left: 0.75rem;
        margin-bottom: 0.25rem;
    }
`;
document.head.appendChild(style);
