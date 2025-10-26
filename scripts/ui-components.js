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
    }

    createComponent(clusterType, container) {
        const componentCreator = this.components.get(clusterType);
        if (!componentCreator) {
            throw new Error(`Unknown cluster type: ${clusterType}`);
        }

        return componentCreator.call(this, container);
    }

    createOnOffComponent(container) {
        const component = document.createElement('div');
        component.className = 'onoff-switch';

        const label = document.createElement('div');
        label.className = 'switch-label';
        label.textContent = 'Power';

        const toggle = document.createElement('div');
        toggle.className = 'switch-toggle';
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            const isOn = toggle.classList.contains('active');
            this.updateState('OnOff', { on: isOn });
            this.updateDeviceStatus(isOn ? 'Online' : 'Offline');
        });

        component.appendChild(label);
        component.appendChild(toggle);

        return component;
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
            <span class="min-value">${displayMin}</span>
            <span class="max-value">${displayMax}</span>
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
        component.className = 'temperature-control';

        const display = document.createElement('div');
        display.className = 'temp-display';
        display.innerHTML = '22<span class="temp-unit">°C</span>';

        const controls = document.createElement('div');
        controls.className = 'temp-controls';

        const decreaseBtn = document.createElement('button');
        decreaseBtn.className = 'temp-button';
        decreaseBtn.innerHTML = '<i class="fas fa-minus"></i>';
        decreaseBtn.addEventListener('click', () => {
            const currentTemp = parseInt(display.textContent);
            const newTemp = Math.max(16, currentTemp - 1);
            display.innerHTML = `${newTemp}<span class="temp-unit">°C</span>`;
            this.updateState('Thermostat', { temperature: newTemp });
        });

        const increaseBtn = document.createElement('button');
        increaseBtn.className = 'temp-button';
        increaseBtn.innerHTML = '<i class="fas fa-plus"></i>';
        increaseBtn.addEventListener('click', () => {
            const currentTemp = parseInt(display.textContent);
            const newTemp = Math.min(30, currentTemp + 1);
            display.innerHTML = `${newTemp}<span class="temp-unit">°C</span>`;
            this.updateState('Thermostat', { temperature: newTemp });
        });

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'temp-slider';
        slider.min = '16';
        slider.max = '30';
        slider.value = '22';
        slider.addEventListener('input', (e) => {
            const temp = e.target.value;
            display.innerHTML = `${temp}<span class="temp-unit">°C</span>`;
            this.updateState('Thermostat', { temperature: parseInt(temp) });
        });

        controls.appendChild(decreaseBtn);
        controls.appendChild(increaseBtn);

        component.appendChild(display);
        component.appendChild(controls);
        component.appendChild(slider);

        return component;
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
        const gradient = `linear-gradient(to right, #2F6B9C 0%, #2F6B9C ${percentage}%, #E0E0E0 ${percentage}%, #E0E0E0 100%)`;
        slider.style.background = gradient;
        console.log(`Updating slider track: ${currentValue} (${percentage.toFixed(1)}%) - ${gradient}`);
    }
}

// Export for use in other modules
window.UIComponents = UIComponents;
