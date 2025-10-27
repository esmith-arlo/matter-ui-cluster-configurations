class UIConfigGenerator {
    constructor() {
        this.configTemplates = new Map();
        this.initializeTemplates();
    }

    initializeTemplates() {
        this.configTemplates.set('OnOff', {
            accessibility: {
                screen_reader: 'Power switch',
                content_description: 'Toggle power on or off for this device',
                haptic_feedback: {
                    enabled: true,
                    on_toggle: true,
                    intensity: 'medium',
                    pattern: 'single_tap'
                }
            },
            metrics: {
                xray_view: true,
                tracker: ['Amplitude', 'Splunk'],
                events: {
                    power_event: {
                        event_name: 'power_state_changed',
                        properties: {
                            type: 'string',
                            state: 'string',
                            previous_state: 'string',
                            device_id: 'string',
                            cluster_id: 'string',
                            timestamp: 'string',
                            error: 'string'
                        },
                        type_values: ['toggled', 'on', 'off', 'toggle_start', 'toggle_end']
                    }
                }
            }
        });

        this.configTemplates.set('LevelControl', {
            min_level: 1,
            max_level: 254,
            accessibility: {
                screen_reader: 'Brightness control',
                content_description: 'Adjust brightness level from 1% to 100%',
                haptic_feedback: {
                    enabled: true,
                    on_slide: true,
                    on_step: true,
                    intensity: 'light',
                    pattern: 'continuous'
                }
            },
            metrics: {
                xray_view: true,
                tracker: ['Amplitude', 'Splunk'],
                events: {
                    brightness_event: {
                        event_name: 'brightness_level_changed',
                        properties: {
                            type: 'string',
                            level: 'integer',
                            previous_level: 'integer',
                            change_type: 'string',
                            duration_ms: 'integer',
                            device_id: 'string',
                            cluster_id: 'string',
                            error: 'string'
                        },
                        type_values: ['changed', 'slide_start', 'slide_end', 'step_up', 'step_down']
                    }
                }
            }
        });

        this.configTemplates.set('ColorControl', {
            color_modes: ['rgb', 'hsv', 'xy', 'temperature'],
            color_picker: {
                type: 'wheel',
                presets: [
                    { name: 'Red', color: '#ff0000' },
                    { name: 'Green', color: '#00ff00' },
                    { name: 'Blue', color: '#0000ff' },
                    { name: 'White', color: '#ffffff' }
                ]
            },
            temperature_range: [153, 500],
            accessibility: {
                screen_reader: 'Color control',
                content_description: 'Select color using color wheel or temperature slider',
                haptic_feedback: {
                    enabled: true,
                    on_color_change: true,
                    on_preset_select: true,
                    intensity: 'medium',
                    pattern: 'double_tap'
                }
            },
            metrics: {
                xray_view: true,
                tracker: ['Amplitude', 'Splunk'],
                events: {
                    color_changed: {
                        event_name: 'color_value_changed',
                        properties: {
                            color_mode: 'string',
                            hue: 'integer',
                            saturation: 'integer',
                            brightness: 'integer',
                            temperature: 'integer',
                            device_id: 'string',
                            cluster_id: 'string'
                        }
                    },
                    preset_selected: {
                        event_name: 'color_preset_selected',
                        properties: {
                            preset_name: 'string',
                            color_value: 'string',
                            device_id: 'string',
                            cluster_id: 'string'
                        }
                    },
                    color_wheel_interaction: {
                        event_name: 'color_wheel_used',
                        properties: {
                            interaction_type: 'string',
                            final_color: 'string',
                            device_id: 'string',
                            cluster_id: 'string'
                        }
                    }
                }
            }
        });

        this.configTemplates.set('Thermostat', {
            temperature_range: [16, 30],
            temperature_unit: 'celsius',
            modes: ['heat', 'cool', 'auto', 'off'],
            accessibility: {
                screen_reader: 'Thermostat control',
                content_description: 'Set temperature and heating/cooling mode',
                haptic_feedback: {
                    enabled: true,
                    on_temperature_change: true,
                    on_mode_change: true,
                    intensity: 'medium',
                    pattern: 'single_tap'
                }
            },
            metrics: {
                xray_view: true,
                tracker: ['Amplitude', 'Splunk'],
                events: {
                    temperature_event: {
                        event_name: 'temperature_changed',
                        properties: {
                            type: 'string',
                            temperature: 'integer',
                            previous_temperature: 'integer',
                            mode: 'string',
                            device_id: 'string',
                            cluster_id: 'string',
                            error: 'string'
                        },
                        type_values: ['changed', 'mode_changed', 'setpoint_adjusted']
                    }
                }
            }
        });

        this.configTemplates.set('DoorLock', {
            security_features: ['pin_code', 'fingerprint', 'rfid'],
            accessibility: {
                screen_reader: 'Door lock control',
                content_description: 'Lock or unlock the door with security features',
                haptic_feedback: {
                    enabled: true,
                    on_lock: true,
                    on_unlock: true,
                    intensity: 'strong',
                    pattern: 'long_press'
                }
            },
            metrics: {
                xray_view: true,
                tracker: ['Amplitude', 'Splunk'],
                events: {
                    lock_event: {
                        event_name: 'door_lock_changed',
                        properties: {
                            type: 'string',
                            state: 'string',
                            previous_state: 'string',
                            device_id: 'string',
                            cluster_id: 'string',
                            error: 'string'
                        },
                        type_values: ['locked', 'unlocked', 'jammed', 'lock_failed', 'unlock_failed']
                    }
                }
            }
        });

        this.configTemplates.set('FanControl', {
            speed_levels: ['off', 'low', 'medium', 'high', 'auto'],
            accessibility: {
                screen_reader: 'Fan speed control',
                content_description: 'Control fan speed from off to high with auto mode',
                haptic_feedback: {
                    enabled: true,
                    on_speed_change: true,
                    on_mode_change: true,
                    intensity: 'light',
                    pattern: 'single_tap'
                }
            },
            metrics: {
                xray_view: true,
                tracker: ['Amplitude', 'Splunk'],
                events: {
                    fan_event: {
                        event_name: 'fan_speed_changed',
                        properties: {
                            type: 'string',
                            speed: 'string',
                            previous_speed: 'string',
                            mode: 'string',
                            device_id: 'string',
                            cluster_id: 'string',
                            error: 'string'
                        },
                        type_values: ['speed_changed', 'mode_changed', 'auto_enabled', 'auto_disabled']
                    }
                }
            }
        });

        this.configTemplates.set('Switch', {
            switch_count: 4,
            accessibility: {
                screen_reader: 'Multi-switch control',
                content_description: 'Control multiple switches individually or all at once',
                haptic_feedback: {
                    enabled: true,
                    on_switch_toggle: true,
                    on_bulk_action: true,
                    intensity: 'medium',
                    pattern: 'single_tap'
                }
            },
            metrics: {
                xray_view: true,
                tracker: ['Amplitude', 'Splunk'],
                events: {
                    switch_event: {
                        event_name: 'switch_state_changed',
                        properties: {
                            type: 'string',
                            switch_id: 'string',
                            state: 'string',
                            previous_state: 'string',
                            action_type: 'string',
                            device_id: 'string',
                            cluster_id: 'string',
                            error: 'string'
                        },
                        type_values: ['individual_toggle', 'all_on', 'all_off', 'bulk_action']
                    }
                }
            }
        });

        this.configTemplates.set('Identify', {
            identify_time: {
                min: 0,
                max: 65535,
                default: 10,
                unit: 'seconds'
            },
            identify_types: [
                { value: 0, name: 'None', description: 'No presentation' },
                { value: 1, name: 'Light Output', description: 'Light output of a lighting product' },
                { value: 2, name: 'Visible Indicator', description: 'Typically a small LED' },
                { value: 3, name: 'Audible Beep', description: 'Audio indication' },
                { value: 4, name: 'Display', description: 'Presentation on display screen' },
                { value: 5, name: 'Actuator', description: 'Physical actuator movement' }
            ],
            effects: [
                { value: 0, name: 'Blink', description: 'Light turns on/off once' },
                { value: 1, name: 'Breathe', description: 'Light pulses over 1 second, repeated 15 times' },
                { value: 2, name: 'Okay', description: 'Colored light turns green for 1 second' },
                { value: 11, name: 'Channel Change', description: 'Orange light for 8 seconds' },
                { value: 254, name: 'Finish Effect', description: 'Complete current effect sequence' },
                { value: 255, name: 'Stop Effect', description: 'Terminate effect immediately' }
            ],
            accessibility: {
                screen_reader: 'Device identification control',
                content_description: 'Control device identification behavior and visual effects',
                haptic_feedback: {
                    enabled: true,
                    on_identify_start: true,
                    on_effect_trigger: true,
                    intensity: 'medium',
                    pattern: 'single_tap'
                }
            },
            metrics: {
                xray_view: true,
                tracker: ['Amplitude', 'Splunk'],
                events: {
                    identify_event: {
                        event_name: 'identify_action',
                        properties: {
                            type: 'string',
                            action: 'string',
                            identify_time: 'number',
                            identify_type: 'number',
                            effect_id: 'number',
                            device_id: 'string',
                            cluster_id: 'string',
                            error: 'string'
                        },
                        type_values: ['identify_start', 'identify_stop', 'effect_trigger', 'effect_stop']
                    }
                }
            }
        });

        this.configTemplates.set('Groups', {
            accessibility: {
                screen_reader: 'Device group management',
                content_description: 'Manage device group memberships',
                haptic_feedback: {
                    enabled: true,
                    on_group_action: true,
                    intensity: 'light',
                    pattern: 'single_tap'
                }
            },
            metrics: {
                xray_view: true,
                tracker: ['Amplitude', 'Splunk'],
                events: {
                    group_event: {
                        event_name: 'group_action',
                        properties: {
                            type: 'string',
                            action: 'string',
                            group_id: 'string',
                            device_id: 'string',
                            cluster_id: 'string',
                            error: 'string'
                        },
                        type_values: ['add_to_group', 'remove_from_group', 'view_groups']
                    }
                }
            }
        });

        this.configTemplates.set('ScenesManagement', {
            accessibility: {
                screen_reader: 'Scene management control',
                content_description: 'Create and manage device scenes',
                haptic_feedback: {
                    enabled: true,
                    on_scene_action: true,
                    intensity: 'medium',
                    pattern: 'single_tap'
                }
            },
            metrics: {
                xray_view: true,
                tracker: ['Amplitude', 'Splunk'],
                events: {
                    scene_event: {
                        event_name: 'scene_action',
                        properties: {
                            type: 'string',
                            action: 'string',
                            scene_id: 'string',
                            scene_name: 'string',
                            device_id: 'string',
                            cluster_id: 'string',
                            error: 'string'
                        },
                        type_values: ['create_scene', 'activate_scene', 'deactivate_scene', 'delete_scene']
                    }
                }
            }
        });

        this.configTemplates.set('PumpConfigurationAndControl', {
            operation_modes: ['constant_pressure', 'constant_speed', 'constant_flow'],
            accessibility: {
                screen_reader: 'Pump control panel',
                content_description: 'Control pump operation, speed, and pressure',
                haptic_feedback: {
                    enabled: true,
                    on_start_stop: true,
                    intensity: 'high',
                    pattern: 'long_press'
                }
            },
            metrics: {
                xray_view: true,
                tracker: ['Amplitude', 'Splunk'],
                events: {
                    pump_event: {
                        event_name: 'pump_operation_changed',
                        properties: {
                            type: 'string',
                            action: 'string',
                            speed: 'number',
                            pressure: 'number',
                            mode: 'string',
                            device_id: 'string',
                            cluster_id: 'string',
                            timestamp: 'string',
                            error: 'string'
                        },
                        type_values: ['pump_started', 'pump_stopped', 'speed_changed', 'pressure_changed', 'mode_changed']
                    }
                }
            }
        });

        this.configTemplates.set('ValveConfigurationAndControl', {
            position_range: [0, 100],
            accessibility: {
                screen_reader: 'Valve control panel',
                content_description: 'Control water valve position and timing',
                haptic_feedback: {
                    enabled: true,
                    on_position_change: true,
                    intensity: 'medium',
                    pattern: 'single_tap'
                }
            },
            metrics: {
                xray_view: true,
                tracker: ['Amplitude', 'Splunk'],
                events: {
                    valve_event: {
                        event_name: 'valve_operation_changed',
                        properties: {
                            type: 'string',
                            action: 'string',
                            position: 'number',
                            duration: 'number',
                            device_id: 'string',
                            cluster_id: 'string',
                            timestamp: 'string',
                            error: 'string'
                        },
                        type_values: ['valve_opened', 'valve_closed', 'position_changed', 'duration_set']
                    }
                }
            }
        });
    }

    generateUIConfig(clusterType, clusterInfo) {
        const template = this.configTemplates.get(clusterType);
        if (!template) {
            throw new Error(`No UI config template for cluster type: ${clusterType}`);
        }

        const config = {
            revision_ts: Date.now(),
            ...template,
            cluster_info: {
                id: clusterInfo.id,
                name: clusterInfo.name,
                revision: clusterInfo.revision,
                classification: clusterInfo.classification
            },
            capabilities: {
                clusters: [clusterInfo.id],
                attributes: this.extractAttributes(clusterInfo),
                commands: this.extractCommands(clusterInfo),
                features: this.extractFeatures(clusterInfo),
                defaults: this.getDefaults(clusterType)
            },
            ui_metadata: {
                component_type: this.getComponentType(clusterType),
                animations: this.getAnimations(clusterType),
                confirmation_required: this.getConfirmationRequired(clusterType),
                display_range: this.getDisplayRange(clusterType),
                step_size: this.getStepSize(clusterType),
                labels: this.getLabels(clusterType)
            },
            version: '1.0.0'
        };

        return config;
    }

    extractAttributes(clusterInfo) {
        const attributes = {};
        clusterInfo.attributes.forEach(attr => {
            attributes[attr.id] = {
                name: attr.name,
                type: attr.type,
                access: attr.access,
                quality: attr.quality
            };
        });
        return attributes;
    }

    extractCommands(clusterInfo) {
        const commands = {};
        clusterInfo.commands.forEach(cmd => {
            commands[cmd.id] = {
                name: cmd.name,
                direction: cmd.direction,
                response: cmd.response,
                fields: cmd.fields
            };
        });
        return commands;
    }

    extractFeatures(clusterInfo) {
        const features = {};
        clusterInfo.features.forEach(feature => {
            features[feature.code] = {
                name: feature.name,
                summary: feature.summary
            };
        });
        return features;
    }

    getComponentType(clusterType) {
        const componentTypes = {
            'OnOff': 'switch',
            'LevelControl': 'slider',
            'ColorControl': 'color_picker',
            'Thermostat': 'temperature_dial',
            'DoorLock': 'lock_control',
            'FanControl': 'speed_selector',
            'Switch': 'switch_grid',
            'Identify': 'identify_panel',
            'Groups': 'groups_panel',
            'ScenesManagement': 'scenes_panel',
            'PumpConfigurationAndControl': 'pump_control_panel',
            'ValveConfigurationAndControl': 'valve_control_panel'
        };
        return componentTypes[clusterType] || 'generic_control';
    }

    getAnimations(clusterType) {
        const animations = {
            'OnOff': ['fade', 'slide'],
            'LevelControl': ['smooth_transition'],
            'ColorControl': ['color_transition', 'pulse'],
            'Thermostat': ['temperature_change'],
            'DoorLock': ['lock_animation'],
            'FanControl': ['spin', 'speed_change'],
            'Switch': ['toggle'],
            'Identify': ['pulse', 'blink', 'breathe'],
            'Groups': ['fade', 'slide'],
            'ScenesManagement': ['fade', 'slide'],
            'PumpConfigurationAndControl': ['pulse', 'rotation'],
            'ValveConfigurationAndControl': ['flow', 'position_change']
        };
        return animations[clusterType] || [];
    }

    getConfirmationRequired(clusterType) {
        const confirmationRequired = {
            'OnOff': false,                    // Simple toggle, no confirmation needed
            'LevelControl': false,             // Slider control, immediate feedback
            'ColorControl': false,             // Color picker, immediate preview
            'Thermostat': false,              // Temperature dial, immediate feedback
            'DoorLock': true,                  // Security action, requires confirmation
            'FanControl': false,              // Fan speed, immediate feedback
            'Switch': false,                  // Simple switch, immediate feedback
            'Identify': false,                // Identification, immediate action
            'Groups': true,                   // Group operations, requires confirmation
            'ScenesManagement': true,          // Scene changes, requires confirmation
            'PumpConfigurationAndControl': true, // Pump control, safety confirmation
            'ValveConfigurationAndControl': true // Valve control, safety confirmation
        };
        return confirmationRequired[clusterType] || false;
    }

    getDisplayRange(clusterType) {
        const displayRanges = {
            'LevelControl': [1, 100],           // Display as percentage (1-100%)
            'ColorControl': [0, 360],          // Hue range (0-360 degrees)
            'Thermostat': [16, 28],            // Temperature range (16-28°C)
            'FanControl': [0, 7],              // Fan speed levels (0-7)
            'OnOff': [0, 1],                   // Binary state (0-1)
            'DoorLock': [0, 1],                // Lock state (0-1)
            'Switch': [0, 1],                   // Switch state (0-1)
            'Identify': [0, 1],                // Identify state (0-1)
            'Groups': [0, 1],                   // Group state (0-1)
            'ScenesManagement': [0, 1],         // Scene state (0-1)
            'PumpConfigurationAndControl': [0, 100], // Pump level (0-100%)
            'ValveConfigurationAndControl': [0, 100] // Valve position (0-100%)
        };
        return displayRanges[clusterType] || [0, 100];
    }

    getStepSize(clusterType) {
        const stepSizes = {
            'LevelControl': 1,                    // Brightness steps of 1%
            'ColorControl': 1,                    // Color steps of 1
            'Thermostat': 0.5,                   // Temperature steps of 0.5°C
            'FanControl': 1,                      // Fan speed steps of 1
            'OnOff': 1,                          // Binary steps of 1
            'DoorLock': 1,                       // Lock state steps of 1
            'Switch': 1,                         // Switch steps of 1
            'Identify': 1,                       // Identify steps of 1
            'Groups': 1,                         // Group steps of 1
            'ScenesManagement': 1,               // Scene steps of 1
            'PumpConfigurationAndControl': 1,    // Pump level steps of 1%
            'ValveConfigurationAndControl': 1    // Valve position steps of 1%
        };
        return stepSizes[clusterType] || 1;
    }

    getDefaults(clusterType) {
        const defaults = {
            'LevelControl': {
                min_level: 1,
                max_level: 254
            },
            'ColorControl': {
                min_hue: 0,
                max_hue: 360,
                min_saturation: 0,
                max_saturation: 100
            },
            'Thermostat': {
                min_temperature: 16,
                max_temperature: 28,
                target_temperature: 22
            },
            'DoorLock': {
                lock_state: 0,
                door_state: 0
            },
            'FanControl': {
                min_speed: 0,
                max_speed: 7,
                current_speed: 0
            },
            'OnOff': {
                on_off: 0
            },
            'Switch': {
                switch_state: 0
            },
            'Identify': {
                identify_time: 0
            },
            'Groups': {
                group_id: 0
            },
            'ScenesManagement': {
                scene_id: 0
            },
            'PumpConfigurationAndControl': {
                min_level: 0,
                max_level: 100,
                current_level: 0
            },
            'ValveConfigurationAndControl': {
                min_position: 0,
                max_position: 100,
                current_position: 0
            }
        };
        return defaults[clusterType] || {};
    }

    getLabels(clusterType) {
        const labelSets = {
            'LevelControl': {
                title: "Brightness Control",
                description: "Adjust the brightness level of your light",
                min_label: "Min",
                max_label: "Max",
                value_label: "Brightness",
                unit_label: "%",
                tooltips: {
                    min: "Minimum brightness level",
                    max: "Maximum brightness level",
                    value: "Current brightness level"
                }
            },
            'ColorControl': {
                title: "Color Control",
                description: "Select and adjust the color of your light",
                min_label: "Min",
                max_label: "Max",
                value_label: "Color",
                unit_label: "°",
                tooltips: {
                    min: "Minimum color value",
                    max: "Maximum color value",
                    value: "Current color value"
                }
            },
            'Thermostat': {
                title: "Temperature Control",
                description: "Set your desired room temperature",
                min_label: "16°C",
                max_label: "28°C",
                value_label: "Temperature",
                unit_label: "°C",
                tooltips: {
                    min: "Minimum temperature",
                    max: "Maximum temperature",
                    value: "Current temperature setting"
                }
            },
            'DoorLock': {
                title: "Door Lock Control",
                description: "Lock or unlock your door",
                min_label: "Unlocked",
                max_label: "Locked",
                value_label: "Lock Status",
                unit_label: "",
                tooltips: {
                    min: "Door is unlocked",
                    max: "Door is locked",
                    value: "Current lock status"
                }
            },
            'FanControl': {
                title: "Fan Speed Control",
                description: "Adjust the speed of your fan",
                min_label: "Off",
                max_label: "High",
                value_label: "Fan Speed",
                unit_label: "",
                tooltips: {
                    min: "Fan is off",
                    max: "Fan at maximum speed",
                    value: "Current fan speed"
                }
            },
            'OnOff': {
                title: "Power Control",
                description: "Turn your device on or off",
                min_label: "Off",
                max_label: "On",
                value_label: "Power",
                unit_label: "",
                tooltips: {
                    min: "Device is off",
                    max: "Device is on",
                    value: "Current power state"
                }
            },
            'Switch': {
                title: "Switch Control",
                description: "Control multiple switches",
                min_label: "Off",
                max_label: "On",
                value_label: "Switch",
                unit_label: "",
                tooltips: {
                    min: "Switch is off",
                    max: "Switch is on",
                    value: "Current switch state"
                }
            },
            'Identify': {
                title: "Device Identification",
                description: "Identify this device",
                min_label: "Stop",
                max_label: "Identify",
                value_label: "Status",
                unit_label: "",
                tooltips: {
                    min: "Stop identification",
                    max: "Start identification",
                    value: "Identification status"
                }
            },
            'Groups': {
                title: "Group Management",
                description: "Manage device groups",
                min_label: "Remove",
                max_label: "Add",
                value_label: "Group",
                unit_label: "",
                tooltips: {
                    min: "Remove from group",
                    max: "Add to group",
                    value: "Group membership"
                }
            },
            'ScenesManagement': {
                title: "Scene Control",
                description: "Control and manage scenes",
                min_label: "Off",
                max_label: "On",
                value_label: "Scene",
                unit_label: "",
                tooltips: {
                    min: "Scene is off",
                    max: "Scene is on",
                    value: "Current scene state"
                }
            },
            'PumpConfigurationAndControl': {
                title: "Pump Control",
                description: "Control pump operation and settings",
                min_label: "Off",
                max_label: "100%",
                value_label: "Pump Level",
                unit_label: "%",
                tooltips: {
                    min: "Pump is off",
                    max: "Pump at maximum",
                    value: "Current pump level"
                }
            },
            'ValveConfigurationAndControl': {
                title: "Valve Control",
                description: "Control valve position and settings",
                min_label: "Closed",
                max_label: "Open",
                value_label: "Valve Position",
                unit_label: "%",
                tooltips: {
                    min: "Valve is closed",
                    max: "Valve is fully open",
                    value: "Current valve position"
                }
            }
        };
        return labelSets[clusterType] || {
            title: "Control",
            description: "Control this device",
            min_label: "Min",
            max_label: "Max",
            value_label: "Value",
            unit_label: "",
            tooltips: {
                min: "Minimum value",
                max: "Maximum value",
                value: "Current value"
            }
        };
    }

    formatConfigAsJSON(config) {
        return JSON.stringify(config, null, 2);
    }

    getConfigSummary(config) {
        return {
            cluster: config.cluster_info.name,
            category: config.category,
            capabilities: Object.keys(config.capabilities.attributes).length,
            commands: Object.keys(config.capabilities.commands).length,
            features: Object.keys(config.capabilities.features).length
        };
    }
}

// Export for use in other modules
window.UIConfigGenerator = UIConfigGenerator;
