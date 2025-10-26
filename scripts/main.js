class MatterUIVisualizer {
    constructor() {
        this.xmlParser = new MatterXMLParser();
        this.uiComponents = new UIComponents();
        this.configGenerator = new UIConfigGenerator();
        this.currentCluster = null;
        this.currentConfig = null;
        this.showJSON = false;

        this.initializeApp();
    }

    async initializeApp() {
        this.setupEventListeners();
        await this.loadClusterData();
        this.setupStateChangeListener();
    }

    setupEventListeners() {
        // Cluster selection
        const clusterSelect = document.getElementById('cluster-select');
        clusterSelect.addEventListener('change', (e) => {
            this.loadCluster(e.target.value);
        });

        // View toggle
        const toggleView = document.getElementById('toggle-view');
        toggleView.addEventListener('click', () => {
            this.toggleJSONView();
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
    }

    async loadClusterData() {
        // Simulate loading cluster data
        // In a real implementation, you would load XML files here
        console.log('Loading cluster data...');
    }

    async loadCluster(clusterType) {
        if (!clusterType) {
            this.showPlaceholder();
            return;
        }

        try {
            // Simulate cluster info (in real app, this would come from XML parsing)
            const clusterInfo = this.getMockClusterInfo(clusterType);

            // Update device info
            this.updateDeviceInfo(clusterType);

            // Create UI component
            const uiContainer = document.getElementById('ui-container');
            uiContainer.innerHTML = '';

            const component = this.uiComponents.createComponent(clusterType, uiContainer);
            uiContainer.appendChild(component);

            // Generate UI config
            this.currentConfig = this.configGenerator.generateUIConfig(
                clusterType,
                clusterInfo
            );

            // Update config display
            this.updateConfigDisplay();

            // Show cluster info
            this.showClusterInfo(clusterInfo);

            this.currentCluster = clusterType;

        } catch (error) {
            console.error('Error loading cluster:', error);
            this.showError('Failed to load cluster');
        }
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

    updateDeviceInfo(clusterType) {
        const deviceType = document.getElementById('device-type');
        const deviceStatus = document.getElementById('device-status');

        if (deviceType) {
            deviceType.textContent = clusterType;
        }
        if (deviceStatus) {
            deviceStatus.textContent = 'Online';
        }
    }

    updateConfigDisplay() {
        const configDisplay = document.getElementById('config-display');
        if (!configDisplay || !this.currentConfig) return;

        const configJSON = this.configGenerator.formatConfigAsJSON(this.currentConfig);
        configDisplay.textContent = configJSON;

        // Add syntax highlighting (basic)
        this.highlightJSON(configDisplay);
    }

    highlightJSON(element) {
        const text = element.textContent;
        const highlighted = text
            .replace(/(".*?")\s*:/g, '<span style="color: #0066cc;">$1</span>:')
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

    toggleJSONView() {
        this.showJSON = !this.showJSON;
        const configPanel = document.querySelector('.config-panel');
        const uiPanel = document.querySelector('.ui-panel');

        if (this.showJSON) {
            configPanel.style.display = 'block';
            uiPanel.style.display = 'none';
        } else {
            configPanel.style.display = 'block';
            uiPanel.style.display = 'block';
        }
    }

    resetState() {
        if (this.currentCluster) {
            this.loadCluster(this.currentCluster);
        }
    }

    async copyConfig() {
        if (!this.currentConfig) return;

        const configJSON = this.configGenerator.formatConfigAsJSON(this.currentConfig);

        try {
            await navigator.clipboard.writeText(configJSON);
            this.showNotification('Configuration copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showNotification('Failed to copy configuration', 'error');
        }
    }

    downloadConfig() {
        if (!this.currentConfig) return;

        const configJSON = this.configGenerator.formatConfigAsJSON(this.currentConfig);
        const blob = new Blob([configJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentCluster}_ui_config.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Configuration downloaded!');
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
                // Update config display
                this.updateConfigDisplay();
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
