class UIComponents {
    constructor() {
        this.components = new Map();
        this.currentState = new Map();
        this.initializeComponents();
    }

    initializeComponents() {
        this.components.set('OnOff', this.createOnOffComponent);
        this.components.set('LevelControl', this.createLevelControlComponent);
        this.components.set('ColorControl', this.createColorControlComponent);
        this.components.set('Thermostat', this.createThermostatComponent);
        this.components.set('DoorLock', this.createDoorLockComponent);
        this.components.set('FanControl', this.createFanControlComponent);
        this.components.set('Switch', this.createSwitchComponent);
        this.components.set('Identify', this.createIdentifyComponent);
        this.components.set('Groups', this.createGroupsComponent);
        this.components.set('ScenesManagement', this.createScenesManagementComponent);
        this.components.set('PumpConfigurationAndControl', this.createPumpControlComponent);
        this.components.set('ValveConfigurationAndControl', this.createValveControlComponent);
    }

    createComponent(clusterType, container) {
        const componentCreator = this.components.get(clusterType);
        if (!componentCreator) {
            throw new Error(`Unknown cluster type: ${clusterType}`);
        }

        return componentCreator.call(this, container);
    }

    createOnOffComponent(container) {
        // Check if this is for a plug device type
        const deviceType = this.getCurrentDeviceType();
        if (deviceType === 'onoff-plug') {
            return this.createPlugOnOffComponent(container);
        }
        
        // Special handling for door locks - show lock/unlock toggle
        if (deviceType === 'door-lock') {
            return this.createDoorLockOnOffComponent(container);
        }

        // Default light switch component
        const component = document.createElement('div');
        component.className = 'onoff-light-switch';

        // Create the toggle container
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'light-toggle-container';

        // Off state section
        const offSection = document.createElement('div');
        offSection.className = 'light-state off-state';
        offSection.innerHTML = `
            <div class="light-icon">
                <i class="fas fa-lightbulb"></i>
            </div>
        `;

        // On state section
        const onSection = document.createElement('div');
        onSection.className = 'light-state on-state active';
        onSection.innerHTML = `
            <div class="light-icon">
                <i class="fas fa-lightbulb"></i>
            </div>
        `;

        // Add click handlers to both sections
        offSection.addEventListener('click', () => {
            this.setLightState(false, offSection, onSection);
        });

        onSection.addEventListener('click', () => {
            this.setLightState(true, offSection, onSection);
        });

        toggleContainer.appendChild(offSection);
        toggleContainer.appendChild(onSection);
        component.appendChild(toggleContainer);

        return component;
    }

    createPlugOnOffComponent(container) {
        const component = document.createElement('div');
        component.className = 'plug-onoff-component';

        // Header explaining the cluster behavior
        const header = document.createElement('div');
        header.className = 'plug-header';
        header.innerHTML = `
            <h3><i class="fas fa-plug"></i> Plug On/Off Cluster Behavior</h3>
            <p>This demonstrates how the On/Off cluster configuration affects device behavior, not just visual appearance</p>
        `;

        // Power state indicator
        const powerState = document.createElement('div');
        powerState.className = 'power-state-indicator';
        powerState.innerHTML = `
            <div class="state-display">
                <div class="power-indicator active">
                    <i class="fas fa-bolt"></i>
                    <span class="state-text">POWER ON</span>
                </div>
                <div class="voltage-display">
                    <span class="voltage-value">120V</span>
                    <span class="voltage-label">AC</span>
                </div>
            </div>
        `;

        // Control section
        const controlSection = document.createElement('div');
        controlSection.className = 'plug-control-section';
        controlSection.innerHTML = `
            <div class="control-buttons">
                <button class="plug-button on-button active">
                    <i class="fas fa-power-off"></i>
                    <span>Turn On</span>
                </button>
                <button class="plug-button off-button">
                    <i class="fas fa-power-off"></i>
                    <span>Turn Off</span>
                </button>
            </div>
        `;

        // Cluster behavior metrics
        const metricsSection = document.createElement('div');
        metricsSection.className = 'cluster-metrics';
        metricsSection.innerHTML = `
            <h4>Cluster Behavior Metrics</h4>
            <div class="metrics-grid">
                <div class="metric-item">
                    <span class="metric-label">State Changes:</span>
                    <span class="metric-value" id="state-changes">0</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Last Command:</span>
                    <span class="metric-value" id="last-command">None</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Response Time:</span>
                    <span class="metric-value" id="response-time">--ms</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Error Count:</span>
                    <span class="metric-value" id="error-count">0</span>
                </div>
            </div>
        `;

        // Configuration details
        const configSection = document.createElement('div');
        configSection.className = 'cluster-config-details';
        configSection.innerHTML = `
            <h4>Cluster Configuration Impact</h4>
            <div class="config-items">
                <div class="config-item">
                    <i class="fas fa-cog"></i>
                    <div class="config-text">
                        <strong>Command Processing:</strong> On/Off commands trigger device state changes
                    </div>
                </div>
                <div class="config-item">
                    <i class="fas fa-chart-line"></i>
                    <div class="config-text">
                        <strong>Metrics Collection:</strong> State changes are tracked for analytics
                    </div>
                </div>
                <div class="config-item">
                    <i class="fas fa-shield-alt"></i>
                    <div class="config-text">
                        <strong>Access Control:</strong> Commands require proper privileges
                    </div>
                </div>
                <div class="config-item">
                    <i class="fas fa-bell"></i>
                    <div class="config-text">
                        <strong>Event Reporting:</strong> State changes generate events for other devices
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const onButton = controlSection.querySelector('.on-button');
        const offButton = controlSection.querySelector('.off-button');
        const powerIndicator = powerState.querySelector('.power-indicator');
        const stateText = powerState.querySelector('.state-text');
        const voltageValue = powerState.querySelector('.voltage-value');
        const stateChanges = metricsSection.querySelector('#state-changes');
        const lastCommand = metricsSection.querySelector('#last-command');
        const responseTime = metricsSection.querySelector('#response-time');

        let stateChangeCount = 0;
        let isOn = true;

        const updatePlugState = (newState) => {
            const startTime = Date.now();
            
            // Simulate command processing delay
            setTimeout(() => {
                isOn = newState;
                stateChangeCount++;
                
                // Update visual state
                if (isOn) {
                    onButton.classList.add('active');
                    offButton.classList.remove('active');
                    powerIndicator.classList.add('active');
                    stateText.textContent = 'POWER ON';
                    voltageValue.textContent = '120V';
                } else {
                    onButton.classList.remove('active');
                    offButton.classList.add('active');
                    powerIndicator.classList.remove('active');
                    stateText.textContent = 'POWER OFF';
                    voltageValue.textContent = '0V';
                }

                // Update metrics
                stateChanges.textContent = stateChangeCount;
                lastCommand.textContent = isOn ? 'On Command' : 'Off Command';
                responseTime.textContent = `${Date.now() - startTime}ms`;

                // Update state
                this.updateState('OnOff', { on: isOn });
                this.updateDeviceStatus(isOn ? 'Online' : 'Offline');
            }, Math.random() * 200 + 50); // Random delay 50-250ms
        };

        onButton.addEventListener('click', () => updatePlugState(true));
        offButton.addEventListener('click', () => updatePlugState(false));

        component.appendChild(header);
        component.appendChild(powerState);
        component.appendChild(controlSection);
        component.appendChild(metricsSection);
        component.appendChild(configSection);

        return component;
    }

    getCurrentDeviceType() {
        // Get the current device type from the main app
        return window.currentDeviceType || 'onoff-light';
    }

    setLightState(isOn, offSection, onSection) {
        if (isOn) {
            offSection.classList.remove('active');
            onSection.classList.add('active');
        } else {
            offSection.classList.add('active');
            onSection.classList.remove('active');
        }
        
        this.updateState('OnOff', { on: isOn });
        this.updateDeviceStatus(isOn ? 'Online' : 'Offline');
    }

    createLevelControlComponent(container) {
        const component = document.createElement('div');
        component.className = 'level-control';

        // Parse XML to get min/max values
        const xmlData = this.parseLevelControlXML();
        const xmlMinLevel = xmlData.minLevel || 1;
        const xmlMaxLevel = xmlData.maxLevel || 254;

        // User-friendly display range (1-100%)
        const displayMin = 1;
        const displayMax = 100;
        const currentDisplayValue = 50; // Start at 50% for user
        const currentXmlValue = this.transformDisplayToXml(currentDisplayValue, displayMin, displayMax, xmlMinLevel, xmlMaxLevel);
        const units = xmlData.units || '%';

        const label = document.createElement('div');
        label.className = 'level-label';

        const labelText = document.createElement('span');
        labelText.textContent = 'Brightness';

        const value = document.createElement('span');
        value.className = 'level-value';
        value.textContent = `${currentDisplayValue}${units}`;

        label.appendChild(labelText);
        label.appendChild(value);

        // Add min/max labels positioned around slider
        const rangeInfo = document.createElement('div');
        rangeInfo.className = 'level-range-info';
        rangeInfo.innerHTML = `
            <span class="min-value">Min ${displayMin}</span>
            <span class="max-value">Max ${displayMax}</span>
        `;

        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'level-slider';
        slider.min = displayMin;
        slider.max = displayMax;
        slider.step = '1';
        slider.value = currentDisplayValue;
        slider.addEventListener('input', (e) => {
            const displayValue = parseInt(e.target.value);
            const xmlValue = this.transformDisplayToXml(displayValue, displayMin, displayMax, xmlMinLevel, xmlMaxLevel);

            value.textContent = `${displayValue}${units}`;
            this.updateState('LevelControl', {
                level: xmlValue,
                displayLevel: displayValue,
                minLevel: xmlMinLevel,
                maxLevel: xmlMaxLevel,
                units: units
            });
            this.updateSliderTrack(slider, displayValue, displayMin, displayMax);
        });

        // Initialize the slider track with the correct gradient
        setTimeout(() => {
            this.updateSliderTrack(slider, slider.value, displayMin, displayMax);
        }, 10);

        sliderContainer.appendChild(slider);
        component.appendChild(label);
        component.appendChild(sliderContainer);
        component.appendChild(rangeInfo);

        return component;
    }

    createColorControlComponent(container) {
        const component = document.createElement('div');
        component.className = 'color-control';

        const colorPicker = document.createElement('div');
        colorPicker.className = 'color-picker';

        const colorWheel = document.createElement('div');
        colorWheel.className = 'color-wheel';
        colorWheel.addEventListener('click', (e) => {
            const rect = colorWheel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const angle = Math.atan2(y - centerY, x - centerX);
            const hue = (angle + Math.PI) * 180 / Math.PI;
            this.updateState('ColorControl', { hue: Math.round(hue) });
        });

        const presets = document.createElement('div');
        presets.className = 'color-presets';

        const colors = ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'];
        colors.forEach(color => {
            const preset = document.createElement('div');
            preset.className = 'color-preset';
            preset.style.backgroundColor = color;
            preset.addEventListener('click', () => {
                document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
                this.updateState('ColorControl', { color: color });
            });
            presets.appendChild(preset);
        });

        colorPicker.appendChild(colorWheel);
        colorPicker.appendChild(presets);
        component.appendChild(colorPicker);

        return component;
    }

    createThermostatComponent(container) {
        const component = document.createElement('div');
        component.className = 'circular-thermostat';

        component.innerHTML = `
            <div class="thermostat-container">
                <div class="circular-dial">
                    <svg class="dial-svg" viewBox="0 0 200 200">
                        <circle class="dial-track" cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" stroke-width="8"/>
                        <circle class="dial-fill" cx="100" cy="100" r="80" fill="none" stroke="#055E88" stroke-width="8" 
                                stroke-dasharray="0 502.4" stroke-dashoffset="0" transform="rotate(-90 100 100)"/>
                        <circle class="dial-handle" cx="100" cy="20" r="8" fill="white" stroke="#055E88" stroke-width="2" cursor="pointer"/>
                    </svg>
                    <div class="temperature-display">
                        <div class="current-temperature">72°F</div>
                    </div>
                </div>
                
                <div class="temperature-controls">
                    <button class="temp-btn decrease-btn">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="temp-btn increase-btn">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div class="mode-selector">
                    <button class="mode-btn heat-btn active" data-mode="heat">Heat</button>
                    <button class="mode-btn cool-btn" data-mode="cool">Cool</button>
                    <button class="mode-btn auto-btn" data-mode="auto">Auto</button>
                </div>
            </div>
        `;

        // Add event listeners
        const decreaseBtn = component.querySelector('.decrease-btn');
        const increaseBtn = component.querySelector('.increase-btn');
        const modeBtns = component.querySelectorAll('.mode-btn');
        const dialFill = component.querySelector('.dial-fill');
        const dialHandle = component.querySelector('.dial-handle');
        const dialTrack = component.querySelector('.dial-track');
        const tempDisplay = component.querySelector('.current-temperature');
        const dialSvg = component.querySelector('.dial-svg');

        let currentTemp = 72;
        let currentMode = 'heat';
        const minTemp = 60;
        const maxTemp = 85;
        let isDragging = false;

        // Update the circular dial based on temperature
        function updateDial() {
            const percentage = (currentTemp - minTemp) / (maxTemp - minTemp);
            const circumference = 2 * Math.PI * 80; // r=80
            
            dialFill.style.strokeDasharray = `${circumference * percentage} ${circumference}`;
            dialFill.style.strokeDashoffset = '0';
            
            // Update handle position
            const angle = -90 + (percentage * 270); // -90 to 180 degrees
            const radians = (angle * Math.PI) / 180;
            const x = 100 + 80 * Math.cos(radians);
            const y = 100 + 80 * Math.sin(radians);
            
            dialHandle.setAttribute('cx', x);
            dialHandle.setAttribute('cy', y);
        }

        function updateDisplay() {
            tempDisplay.textContent = `${currentTemp}°F`;
            updateDial();
        }

        // Convert angle to temperature
        function angleToTemperature(angle) {
            const normalizedAngle = (angle + 90) / 270; // Convert -90 to 180 range to 0-1
            return Math.round(minTemp + normalizedAngle * (maxTemp - minTemp));
        }

        // Convert temperature to angle
        function temperatureToAngle(temp) {
            const percentage = (temp - minTemp) / (maxTemp - minTemp);
            return -90 + (percentage * 270);
        }

        // Handle mouse/touch events for dragging
        function startDrag(e) {
            isDragging = true;
            e.preventDefault();
        }

        function drag(e) {
            if (!isDragging) return;
            
            const rect = dialSvg.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            let clientX, clientY;
            if (e.touches) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            
            const deltaX = clientX - centerX;
            const deltaY = clientY - centerY;
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            
            const newTemp = angleToTemperature(angle);
            if (newTemp >= minTemp && newTemp <= maxTemp) {
                currentTemp = newTemp;
                updateDisplay();
                this.updateState('Thermostat', { action: 'setTemperature', temperature: currentTemp });
            }
        }

        function endDrag() {
            isDragging = false;
        }

        // Add drag event listeners
        dialHandle.addEventListener('mousedown', startDrag);
        dialSvg.addEventListener('mousemove', drag.bind(this));
        dialSvg.addEventListener('mouseup', endDrag);
        dialSvg.addEventListener('mouseleave', endDrag);

        // Touch events for mobile
        dialHandle.addEventListener('touchstart', startDrag);
        dialSvg.addEventListener('touchmove', drag.bind(this));
        dialSvg.addEventListener('touchend', endDrag);

        // Click on dial to set temperature
        dialSvg.addEventListener('click', (e) => {
            if (e.target === dialSvg || e.target === dialFill || e.target === dialTrack) {
                const rect = dialSvg.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                let clientX, clientY;
                if (e.touches) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else {
                    clientX = e.clientX;
                    clientY = e.clientY;
                }
                
                const deltaX = clientX - centerX;
                const deltaY = clientY - centerY;
                const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
                
                const newTemp = angleToTemperature(angle);
                if (newTemp >= minTemp && newTemp <= maxTemp) {
                    currentTemp = newTemp;
                    updateDisplay();
                    this.updateState('Thermostat', { action: 'setTemperature', temperature: currentTemp });
                }
            }
        });

        decreaseBtn.addEventListener('click', () => {
            currentTemp = Math.max(minTemp, currentTemp - 1);
            updateDisplay();
            this.updateState('Thermostat', { action: 'setTemperature', temperature: currentTemp });
        });

        increaseBtn.addEventListener('click', () => {
            currentTemp = Math.min(maxTemp, currentTemp + 1);
            updateDisplay();
            this.updateState('Thermostat', { action: 'setTemperature', temperature: currentTemp });
        });

        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
                this.updateState('Thermostat', { action: 'setMode', mode: currentMode });
            });
        });

        // Initialize display
        updateDisplay();

        return component;
    }

    createDoorLockOnOffComponent(container) {
        const component = document.createElement('div');
        component.className = 'door-lock-toggle';

        component.innerHTML = `
            <div class="lock-toggle-container">
                <div class="lock-state unlocked-state active" data-state="unlocked">
                    <div class="lock-icon">
                        <i class="fas fa-lock-open"></i>
                    </div>
                </div>
                <div class="lock-state locked-state" data-state="locked">
                    <div class="lock-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const lockStates = component.querySelectorAll('.lock-state');
        
        lockStates.forEach(state => {
            state.addEventListener('click', () => {
                const newState = state.dataset.state;
                this.setLockState(component, newState);
                this.updateState('OnOff', { state: newState === 'unlocked' ? 'on' : 'off' });
            });
        });

        return component;
    }

    setLockState(component, state) {
        const unlockedState = component.querySelector('.unlocked-state');
        const lockedState = component.querySelector('.locked-state');
        
        if (state === 'unlocked') {
            unlockedState.classList.add('active');
            lockedState.classList.remove('active');
        } else {
            lockedState.classList.add('active');
            unlockedState.classList.remove('active');
        }
    }

    createDoorLockComponent(container) {
        const component = document.createElement('div');
        component.className = 'door-lock';

        const status = document.createElement('div');
        status.className = 'lock-status locked';
        status.textContent = 'Locked';

        const controls = document.createElement('div');
        controls.className = 'lock-controls';

        const lockBtn = document.createElement('button');
        lockBtn.className = 'lock-button lock';
        lockBtn.innerHTML = '<i class="fas fa-lock"></i> Lock';
        lockBtn.addEventListener('click', () => {
            status.textContent = 'Locked';
            status.className = 'lock-status locked';
            this.updateState('DoorLock', { locked: true });
        });

        const unlockBtn = document.createElement('button');
        unlockBtn.className = 'lock-button unlock';
        unlockBtn.innerHTML = '<i class="fas fa-unlock"></i> Unlock';
        unlockBtn.addEventListener('click', () => {
            status.textContent = 'Unlocked';
            status.className = 'lock-status unlocked';
            this.updateState('DoorLock', { locked: false });
        });

        controls.appendChild(lockBtn);
        controls.appendChild(unlockBtn);

        component.appendChild(status);
        component.appendChild(controls);

        return component;
    }

    createFanControlComponent(container) {
        const component = document.createElement('div');
        component.className = 'fan-control';

        const icon = document.createElement('div');
        icon.className = 'fan-icon';
        icon.innerHTML = '<i class="fas fa-fan"></i>';

        const speed = document.createElement('div');
        speed.className = 'fan-speed';
        speed.textContent = 'Speed: 3';

        const modes = document.createElement('div');
        modes.className = 'fan-modes';

        const modeNames = ['Off', 'Low', 'Medium', 'High', 'Auto'];
        modeNames.forEach((modeName, index) => {
            const mode = document.createElement('div');
            mode.className = 'fan-mode';
            if (index === 3) mode.classList.add('active');
            mode.textContent = modeName;
            mode.addEventListener('click', () => {
                document.querySelectorAll('.fan-mode').forEach(m => m.classList.remove('active'));
                mode.classList.add('active');
                speed.textContent = `Speed: ${index}`;
                icon.className = index > 0 ? 'fan-icon spinning' : 'fan-icon';
                this.updateState('FanControl', { speed: index });
            });
            modes.appendChild(mode);
        });

        component.appendChild(icon);
        component.appendChild(speed);
        component.appendChild(modes);

        return component;
    }

    createSwitchComponent(container) {
        const component = document.createElement('div');
        component.className = 'switch-control';

        const grid = document.createElement('div');
        grid.className = 'switch-grid';

        const switches = [
            { name: 'Switch 1', icon: 'fas fa-lightbulb' },
            { name: 'Switch 2', icon: 'fas fa-plug' },
            { name: 'Switch 3', icon: 'fas fa-tv' },
            { name: 'Switch 4', icon: 'fas fa-desktop' }
        ];

        switches.forEach((switchInfo, index) => {
            const switchItem = document.createElement('div');
            switchItem.className = 'switch-item';
            if (index % 2 === 0) switchItem.classList.add('active');

            const icon = document.createElement('i');
            icon.className = switchInfo.icon;

            const label = document.createElement('span');
            label.className = 'switch-item-label';
            label.textContent = switchInfo.name;

            switchItem.appendChild(icon);
            switchItem.appendChild(label);

            switchItem.addEventListener('click', () => {
                switchItem.classList.toggle('active');
                this.updateState('Switch', {
                    [`switch${index + 1}`]: switchItem.classList.contains('active')
                });
            });

            grid.appendChild(switchItem);
        });

        component.appendChild(grid);

        return component;
    }

    createIdentifyComponent(container) {
        const component = document.createElement('div');
        component.className = 'identify-control';

        // Header
        const header = document.createElement('div');
        header.className = 'identify-header';
        header.innerHTML = `
            <h3><i class="fas fa-fingerprint"></i> Device Identification</h3>
            <p>Control device identification behavior and visual effects</p>
        `;

        // Identify Time Configuration
        const timeConfig = document.createElement('div');
        timeConfig.className = 'identify-time-config';
        timeConfig.innerHTML = `
            <label for="identify-time">Identify Duration (seconds):</label>
            <div class="time-input-group">
                <input type="number" id="identify-time" min="0" max="65535" value="10" step="1">
                <span class="time-unit">sec</span>
            </div>
        `;

        // Identify Type Selection
        const typeConfig = document.createElement('div');
        typeConfig.className = 'identify-type-config';
        typeConfig.innerHTML = `
            <label for="identify-type">Identify Type:</label>
            <select id="identify-type">
                <option value="0">None</option>
                <option value="1" selected>Light Output</option>
                <option value="2">Visible Indicator (LED)</option>
                <option value="3">Audible Beep</option>
                <option value="4">Display</option>
                <option value="5">Actuator</option>
            </select>
        `;

        // Effect Selection
        const effectConfig = document.createElement('div');
        effectConfig.className = 'identify-effect-config';
        effectConfig.innerHTML = `
            <label for="identify-effect">Visual Effect:</label>
            <select id="identify-effect">
                <option value="0">Blink</option>
                <option value="1" selected>Breathe</option>
                <option value="2">Okay</option>
                <option value="11">Channel Change</option>
                <option value="254">Finish Effect</option>
                <option value="255">Stop Effect</option>
            </select>
        `;

        // Control Buttons
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'identify-buttons';

        const identifyBtn = document.createElement('button');
        identifyBtn.className = 'identify-button primary';
        identifyBtn.innerHTML = '<i class="fas fa-eye"></i> Start Identify';
        identifyBtn.addEventListener('click', () => {
            const identifyTime = parseInt(document.getElementById('identify-time').value);
            const identifyType = parseInt(document.getElementById('identify-type').value);
            
            this.startIdentify(identifyBtn, identifyTime, identifyType);
        });

        const triggerEffectBtn = document.createElement('button');
        triggerEffectBtn.className = 'identify-button secondary';
        triggerEffectBtn.innerHTML = '<i class="fas fa-magic"></i> Trigger Effect';
        triggerEffectBtn.addEventListener('click', () => {
            const effectId = parseInt(document.getElementById('identify-effect').value);
            this.triggerEffect(triggerEffectBtn, effectId);
        });

        const stopBtn = document.createElement('button');
        stopBtn.className = 'identify-button danger';
        stopBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
        stopBtn.addEventListener('click', () => {
            this.stopIdentify(stopBtn);
        });

        // Status Display
        const statusDisplay = document.createElement('div');
        statusDisplay.className = 'identify-status';
        statusDisplay.innerHTML = `
            <div class="status-indicator">
                <span class="status-dot"></span>
                <span class="status-text">Ready</span>
            </div>
        `;

        // Visual Effect Preview
        const effectPreview = document.createElement('div');
        effectPreview.className = 'identify-preview';
        effectPreview.innerHTML = `
            <div class="preview-light"></div>
            <span class="preview-label">Effect Preview</span>
        `;

        buttonGroup.appendChild(identifyBtn);
        buttonGroup.appendChild(triggerEffectBtn);
        buttonGroup.appendChild(stopBtn);

        component.appendChild(header);
        component.appendChild(timeConfig);
        component.appendChild(typeConfig);
        component.appendChild(effectConfig);
        component.appendChild(buttonGroup);
        component.appendChild(statusDisplay);
        component.appendChild(effectPreview);

        return component;
    }

    startIdentify(button, identifyTime, identifyType) {
        button.classList.add('identifying');
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Identifying...';
        button.disabled = true;

        const statusText = document.querySelector('.status-text');
        const statusDot = document.querySelector('.status-dot');
        const previewLight = document.querySelector('.preview-light');

        statusText.textContent = `Identifying for ${identifyTime}s`;
        statusDot.classList.add('identifying');

        // Start visual effect based on type
        this.startVisualEffect(identifyType, identifyTime);

        this.updateState('Identify', { 
            identifying: true, 
            identifyTime: identifyTime,
            identifyType: identifyType,
            command: 'Identify'
        });

        // Stop after the specified time
        setTimeout(() => {
            this.stopIdentify(button);
        }, identifyTime * 1000);
    }

    triggerEffect(button, effectId) {
        button.classList.add('triggering');
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Triggering...';
        button.disabled = true;

        const statusText = document.querySelector('.status-text');
        const statusDot = document.querySelector('.status-dot');
        const previewLight = document.querySelector('.preview-light');

        const effectNames = {
            0: 'Blink',
            1: 'Breathe', 
            2: 'Okay',
            11: 'Channel Change',
            254: 'Finish Effect',
            255: 'Stop Effect'
        };

        statusText.textContent = `Triggering ${effectNames[effectId] || 'Effect'}`;
        statusDot.classList.add('triggering');

        // Start effect animation
        this.startEffectAnimation(effectId);

        this.updateState('Identify', { 
            triggering: true, 
            effectId: effectId,
            command: 'TriggerEffect'
        });

        // Reset button after effect
        setTimeout(() => {
            button.classList.remove('triggering');
            button.innerHTML = '<i class="fas fa-magic"></i> Trigger Effect';
            button.disabled = false;
            statusText.textContent = 'Ready';
            statusDot.classList.remove('triggering');
        }, 3000);
    }

    stopIdentify(button) {
        // Reset all buttons
        document.querySelectorAll('.identify-button').forEach(btn => {
            btn.classList.remove('identifying', 'triggering');
            btn.disabled = false;
        });

        // Reset primary button
        const identifyBtn = document.querySelector('.identify-button.primary');
        identifyBtn.innerHTML = '<i class="fas fa-eye"></i> Start Identify';

        // Reset status
        const statusText = document.querySelector('.status-text');
        const statusDot = document.querySelector('.status-dot');
        const previewLight = document.querySelector('.preview-light');

        statusText.textContent = 'Ready';
        statusDot.classList.remove('identifying', 'triggering');
        previewLight.classList.remove('blink', 'breathe', 'okay', 'channel-change');

        this.updateState('Identify', { 
            identifying: false, 
            triggering: false,
            command: 'Stop'
        });
    }

    startVisualEffect(identifyType, duration) {
        const previewLight = document.querySelector('.preview-light');
        
        switch(identifyType) {
            case 1: // Light Output
                previewLight.classList.add('breathe');
                break;
            case 2: // Visible Indicator
                previewLight.classList.add('blink');
                break;
            case 3: // Audible Beep
                // Could add sound effect here
                previewLight.classList.add('okay');
                break;
            case 4: // Display
                previewLight.classList.add('okay');
                break;
            case 5: // Actuator
                previewLight.classList.add('channel-change');
                break;
            default:
                previewLight.classList.add('blink');
        }
    }

    startEffectAnimation(effectId) {
        const previewLight = document.querySelector('.preview-light');
        
        // Remove all effect classes
        previewLight.classList.remove('blink', 'breathe', 'okay', 'channel-change');
        
        switch(effectId) {
            case 0: // Blink
                previewLight.classList.add('blink');
                break;
            case 1: // Breathe
                previewLight.classList.add('breathe');
                break;
            case 2: // Okay
                previewLight.classList.add('okay');
                break;
            case 11: // Channel Change
                previewLight.classList.add('channel-change');
                break;
            case 254: // Finish Effect
                previewLight.classList.add('finish-effect');
                break;
            case 255: // Stop Effect
                previewLight.classList.remove('blink', 'breathe', 'okay', 'channel-change', 'finish-effect');
                break;
        }
    }

    createGroupsComponent(container) {
        const component = document.createElement('div');
        component.className = 'groups-control';

        const label = document.createElement('div');
        label.className = 'groups-label';
        label.textContent = 'Device Groups';

        const groupsList = document.createElement('div');
        groupsList.className = 'groups-list';

        const groups = [
            { id: 1, name: 'Living Room' },
            { id: 2, name: 'Bedroom' },
            { id: 3, name: 'Kitchen' }
        ];

        groups.forEach(group => {
            const groupItem = document.createElement('div');
            groupItem.className = 'group-item';
            groupItem.innerHTML = `
                <span class="group-name">${group.name}</span>
                <button class="group-remove-btn" data-group-id="${group.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            groupsList.appendChild(groupItem);
        });

        const addGroupBtn = document.createElement('button');
        addGroupBtn.className = 'add-group-btn';
        addGroupBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Group';
        addGroupBtn.addEventListener('click', () => {
            this.updateState('Groups', { action: 'addToGroup' });
        });

        component.appendChild(label);
        component.appendChild(groupsList);
        component.appendChild(addGroupBtn);

        return component;
    }

    createScenesManagementComponent(container) {
        const component = document.createElement('div');
        component.className = 'scenes-control';

        const label = document.createElement('div');
        label.className = 'scenes-label';
        label.textContent = 'Scene Management';

        const scenesList = document.createElement('div');
        scenesList.className = 'scenes-list';

        const scenes = [
            { id: 1, name: 'Movie Night', active: false },
            { id: 2, name: 'Reading', active: true },
            { id: 3, name: 'Party Mode', active: false }
        ];

        scenes.forEach(scene => {
            const sceneItem = document.createElement('div');
            sceneItem.className = `scene-item ${scene.active ? 'active' : ''}`;
            sceneItem.innerHTML = `
                <span class="scene-name">${scene.name}</span>
                <button class="scene-activate-btn" data-scene-id="${scene.id}">
                    ${scene.active ? 'Deactivate' : 'Activate'}
                </button>
            `;
            sceneItem.addEventListener('click', () => {
                document.querySelectorAll('.scene-item').forEach(s => s.classList.remove('active'));
                sceneItem.classList.add('active');
                this.updateState('ScenesManagement', { 
                    activeScene: scene.id, 
                    sceneName: scene.name 
                });
            });
            scenesList.appendChild(sceneItem);
        });

        const createSceneBtn = document.createElement('button');
        createSceneBtn.className = 'create-scene-btn';
        createSceneBtn.innerHTML = '<i class="fas fa-plus"></i> Create Scene';
        createSceneBtn.addEventListener('click', () => {
            this.updateState('ScenesManagement', { action: 'createScene' });
        });

        component.appendChild(label);
        component.appendChild(scenesList);
        component.appendChild(createSceneBtn);

        return component;
    }

    updateState(clusterType, state) {
        this.currentState.set(clusterType, state);
        this.dispatchStateChange(clusterType, state);
    }

    updateDeviceStatus(status) {
        const statusElement = document.getElementById('device-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    dispatchStateChange(clusterType, state) {
        const event = new CustomEvent('stateChange', {
            detail: { clusterType, state }
        });
        document.dispatchEvent(event);
    }

    getCurrentState(clusterType) {
        return this.currentState.get(clusterType) || {};
    }

    parseLevelControlXML() {
        // Parse the LevelControl XML to extract min/max values and units
        try {
            const xmlContent = `
                <cluster id="0x0008" name="Level Control Cluster">
                    <attributes>
                        <attribute name="MinLevel" default="1"/>
                        <attribute name="MaxLevel" default="254"/>
                    </attributes>
                </cluster>
            `;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

            const minLevelAttr = xmlDoc.querySelector('attribute[name="MinLevel"]');
            const maxLevelAttr = xmlDoc.querySelector('attribute[name="MaxLevel"]');

            return {
                minLevel: minLevelAttr ? parseInt(minLevelAttr.getAttribute('default')) || 1 : 1,
                maxLevel: maxLevelAttr ? parseInt(maxLevelAttr.getAttribute('default')) || 254 : 254,
                units: '%'
            };
        } catch (error) {
            console.warn('Error parsing LevelControl XML, using defaults:', error);
            return { minLevel: 1, maxLevel: 254, units: '%' };
        }
    }

    transformDisplayToXml(displayValue, displayMin, displayMax, xmlMin, xmlMax) {
        // Transform user-friendly display value (1-100) to XML range (1-254)
        const percentage = (displayValue - displayMin) / (displayMax - displayMin);
        return Math.round(xmlMin + percentage * (xmlMax - xmlMin));
    }

    transformXmlToDisplay(xmlValue, displayMin, displayMax, xmlMin, xmlMax) {
        // Transform XML range (1-254) to user-friendly display value (1-100)
        const percentage = (xmlValue - xmlMin) / (xmlMax - xmlMin);
        return Math.round(displayMin + percentage * (displayMax - displayMin));
    }

    updateSliderTrack(slider, value, minLevel = 0, maxLevel = 100) {
        const currentValue = parseInt(value);
        const percentage = ((currentValue - minLevel) / (maxLevel - minLevel)) * 100;
        const gradient = `linear-gradient(to right, #055E88 0%, #055E88 ${percentage}%, #E0E0E0 ${percentage}%, #E0E0E0 100%)`;
        slider.style.background = gradient;
        console.log(`Updating slider track: ${currentValue} (${percentage.toFixed(1)}%) - ${gradient}`);
    }

    createPumpControlComponent(container) {
        const component = document.createElement('div');
        component.className = 'pump-control-component';

        component.innerHTML = `
            <div class="pump-header">
                <h3><i class="fas fa-tint"></i> Pump Control</h3>
                <p>Control pump operation, speed, and pressure settings</p>
            </div>
            
            <div class="pump-status">
                <div class="status-indicator">
                    <div class="pump-icon">
                        <i class="fas fa-tint"></i>
                    </div>
                    <div class="status-text">
                        <span class="status-label">Pump Status:</span>
                        <span class="status-value" id="pump-status">Stopped</span>
                    </div>
                </div>
                <div class="pump-metrics">
                    <div class="metric">
                        <span class="metric-label">Speed:</span>
                        <span class="metric-value" id="pump-speed">0 RPM</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Pressure:</span>
                        <span class="metric-value" id="pump-pressure">0 PSI</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Power:</span>
                        <span class="metric-value" id="pump-power">0 W</span>
                    </div>
                </div>
            </div>

            <div class="pump-controls">
                <div class="control-section">
                    <h4>Operation Mode</h4>
                    <div class="mode-buttons">
                        <button class="mode-btn active" data-mode="constant-pressure">Constant Pressure</button>
                        <button class="mode-btn" data-mode="constant-speed">Constant Speed</button>
                        <button class="mode-btn" data-mode="constant-flow">Constant Flow</button>
                    </div>
                </div>

                <div class="control-section">
                    <h4>Speed Control</h4>
                    <div class="slider-container">
                        <input type="range" id="speed-slider" min="0" max="100" value="0" class="pump-slider">
                        <div class="slider-labels">
                            <span>0%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>

                <div class="control-section">
                    <h4>Pressure Control</h4>
                    <div class="slider-container">
                        <input type="range" id="pressure-slider" min="0" max="100" value="0" class="pump-slider">
                        <div class="slider-labels">
                            <span>0 PSI</span>
                            <span>100 PSI</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pump-actions">
                <button class="pump-btn start-btn">
                    <i class="fas fa-play"></i>
                    Start Pump
                </button>
                <button class="pump-btn stop-btn">
                    <i class="fas fa-stop"></i>
                    Stop Pump
                </button>
                <button class="pump-btn emergency-btn">
                    <i class="fas fa-exclamation-triangle"></i>
                    Emergency Stop
                </button>
            </div>
        `;

        // Add event listeners
        const startBtn = component.querySelector('.start-btn');
        const stopBtn = component.querySelector('.stop-btn');
        const emergencyBtn = component.querySelector('.emergency-btn');
        const speedSlider = component.querySelector('#speed-slider');
        const pressureSlider = component.querySelector('#pressure-slider');
        const modeButtons = component.querySelectorAll('.mode-btn');

        let isRunning = false;
        let currentSpeed = 0;
        let currentPressure = 0;

        startBtn.addEventListener('click', () => {
            isRunning = true;
            updatePumpStatus();
            this.updateState('PumpConfigurationAndControl', { action: 'start', speed: currentSpeed, pressure: currentPressure });
        });

        stopBtn.addEventListener('click', () => {
            isRunning = false;
            currentSpeed = 0;
            currentPressure = 0;
            speedSlider.value = 0;
            pressureSlider.value = 0;
            updatePumpStatus();
            this.updateState('PumpConfigurationAndControl', { action: 'stop' });
        });

        emergencyBtn.addEventListener('click', () => {
            isRunning = false;
            currentSpeed = 0;
            currentPressure = 0;
            speedSlider.value = 0;
            pressureSlider.value = 0;
            updatePumpStatus();
            this.updateState('PumpConfigurationAndControl', { action: 'emergencyStop' });
        });

        speedSlider.addEventListener('input', (e) => {
            currentSpeed = parseInt(e.target.value);
            updatePumpMetrics();
            if (isRunning) {
                this.updateState('PumpConfigurationAndControl', { action: 'setSpeed', speed: currentSpeed });
            }
        });

        pressureSlider.addEventListener('input', (e) => {
            currentPressure = parseInt(e.target.value);
            updatePumpMetrics();
            if (isRunning) {
                this.updateState('PumpConfigurationAndControl', { action: 'setPressure', pressure: currentPressure });
            }
        });

        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateState('PumpConfigurationAndControl', { action: 'setMode', mode: btn.dataset.mode });
            });
        });

        function updatePumpStatus() {
            const statusElement = component.querySelector('#pump-status');
            const pumpIcon = component.querySelector('.pump-icon i');
            
            if (isRunning) {
                statusElement.textContent = 'Running';
                statusElement.className = 'status-value running';
                pumpIcon.className = 'fas fa-tint running';
            } else {
                statusElement.textContent = 'Stopped';
                statusElement.className = 'status-value stopped';
                pumpIcon.className = 'fas fa-tint stopped';
            }
        }

        function updatePumpMetrics() {
            component.querySelector('#pump-speed').textContent = `${currentSpeed} RPM`;
            component.querySelector('#pump-pressure').textContent = `${currentPressure} PSI`;
            component.querySelector('#pump-power').textContent = `${Math.round(currentSpeed * 2.5)} W`;
        }

        return component;
    }

    createValveControlComponent(container) {
        const component = document.createElement('div');
        component.className = 'valve-control-component';

        component.innerHTML = `
            <div class="valve-header">
                <h3><i class="fas fa-faucet"></i> Water Valve Control</h3>
                <p>Control water valve position, timing, and flow settings</p>
            </div>
            
            <div class="valve-status">
                <div class="status-indicator">
                    <div class="valve-icon">
                        <i class="fas fa-faucet"></i>
                    </div>
                    <div class="status-text">
                        <span class="status-label">Valve Status:</span>
                        <span class="status-value" id="valve-status">Closed</span>
                    </div>
                </div>
                <div class="valve-metrics">
                    <div class="metric">
                        <span class="metric-label">Position:</span>
                        <span class="metric-value" id="valve-position">0%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Flow Rate:</span>
                        <span class="metric-value" id="valve-flow">0 GPM</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Duration:</span>
                        <span class="metric-value" id="valve-duration">0 min</span>
                    </div>
                </div>
            </div>

            <div class="valve-controls">
                <div class="control-section">
                    <h4>Position Control</h4>
                    <div class="slider-container">
                        <input type="range" id="position-slider" min="0" max="100" value="0" class="valve-slider">
                        <div class="slider-labels">
                            <span>Closed (0%)</span>
                            <span>Open (100%)</span>
                        </div>
                    </div>
                </div>

                <div class="control-section">
                    <h4>Timing Control</h4>
                    <div class="timing-controls">
                        <div class="timing-input">
                            <label for="open-duration">Open Duration (minutes):</label>
                            <input type="number" id="open-duration" min="0" max="1440" value="0">
                        </div>
                        <div class="timing-input">
                            <label for="closed-duration">Closed Duration (minutes):</label>
                            <input type="number" id="closed-duration" min="0" max="1440" value="0">
                        </div>
                    </div>
                </div>
            </div>

            <div class="valve-actions">
                <button class="valve-btn open-btn">
                    <i class="fas fa-faucet"></i>
                    Open Valve
                </button>
                <button class="valve-btn close-btn">
                    <i class="fas fa-faucet-drip"></i>
                    Close Valve
                </button>
                <button class="valve-btn set-position-btn">
                    <i class="fas fa-adjust"></i>
                    Set Position
                </button>
            </div>
        `;

        // Add event listeners
        const openBtn = component.querySelector('.open-btn');
        const closeBtn = component.querySelector('.close-btn');
        const setPositionBtn = component.querySelector('.set-position-btn');
        const positionSlider = component.querySelector('#position-slider');
        const openDurationInput = component.querySelector('#open-duration');
        const closedDurationInput = component.querySelector('#closed-duration');

        let isOpen = false;
        let currentPosition = 0;
        let openDuration = 0;
        let closedDuration = 0;

        openBtn.addEventListener('click', () => {
            isOpen = true;
            currentPosition = 100;
            positionSlider.value = 100;
            updateValveStatus();
            this.updateState('ValveConfigurationAndControl', { action: 'open' });
        });

        closeBtn.addEventListener('click', () => {
            isOpen = false;
            currentPosition = 0;
            positionSlider.value = 0;
            updateValveStatus();
            this.updateState('ValveConfigurationAndControl', { action: 'close' });
        });

        setPositionBtn.addEventListener('click', () => {
            currentPosition = parseInt(positionSlider.value);
            isOpen = currentPosition > 0;
            updateValveStatus();
            this.updateState('ValveConfigurationAndControl', { action: 'setPosition', position: currentPosition });
        });

        positionSlider.addEventListener('input', (e) => {
            currentPosition = parseInt(e.target.value);
            updateValveMetrics();
        });

        openDurationInput.addEventListener('input', (e) => {
            openDuration = parseInt(e.target.value);
            this.updateState('ValveConfigurationAndControl', { action: 'setOpenDuration', duration: openDuration });
        });

        closedDurationInput.addEventListener('input', (e) => {
            closedDuration = parseInt(e.target.value);
            this.updateState('ValveConfigurationAndControl', { action: 'setClosedDuration', duration: closedDuration });
        });

        function updateValveStatus() {
            const statusElement = component.querySelector('#valve-status');
            const valveIcon = component.querySelector('.valve-icon i');
            
            if (isOpen) {
                statusElement.textContent = 'Open';
                statusElement.className = 'status-value open';
                valveIcon.className = 'fas fa-faucet open';
            } else {
                statusElement.textContent = 'Closed';
                statusElement.className = 'status-value closed';
                valveIcon.className = 'fas fa-faucet closed';
            }
        }

        function updateValveMetrics() {
            component.querySelector('#valve-position').textContent = `${currentPosition}%`;
            component.querySelector('#valve-flow').textContent = `${Math.round(currentPosition * 0.5)} GPM`;
            component.querySelector('#valve-duration').textContent = `${openDuration} min`;
        }

        return component;
    }
}

// Export for use in other modules
window.UIComponents = UIComponents;
