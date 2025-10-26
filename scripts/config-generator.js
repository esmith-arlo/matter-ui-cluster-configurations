class UIConfigGenerator {
    constructor() {
        this.configTemplates = new Map();
        this.initializeTemplates();
    }

    initializeTemplates() {
        this.configTemplates.set('OnOff', {
            primary_control: 'toggle_switch',
            icon: 'fas fa-power-off',
            category: 'power',
            display_name: 'Power Control',
            controls: ['toggle'],
            states: ['on', 'off'],
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
            primary_control: 'brightness_slider',
            icon: 'fas fa-sun',
            category: 'lighting',
            display_name: 'Brightness',
            brightness_range: [1, 254],
            display_range: [1, 100],
            min_level: 1,
            max_level: 254,
            step_size: 1,
            units: '%',
            controls: ['slider', 'step_up', 'step_down'],
            states: ['level', 'min_level', 'max_level'],
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
            primary_control: 'color_picker',
            icon: 'fas fa-palette',
            category: 'lighting',
            display_name: 'Color Control',
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
            controls: ['color_wheel', 'temperature_slider', 'presets'],
            states: ['hue', 'saturation', 'brightness', 'temperature'],
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
            primary_control: 'temperature_dial',
            icon: 'fas fa-thermometer-half',
            category: 'hvac',
            display_name: 'Temperature',
            temperature_range: [16, 30],
            temperature_unit: 'celsius',
            controls: ['temperature_dial', 'up_down_buttons', 'mode_selector'],
            states: ['temperature', 'mode', 'fan_speed'],
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
            primary_control: 'lock_button',
            icon: 'fas fa-lock',
            category: 'security',
            display_name: 'Door Lock',
            controls: ['lock_button', 'unlock_button', 'status_display'],
            states: ['locked', 'unlocked', 'jammed'],
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
            primary_control: 'speed_selector',
            icon: 'fas fa-fan',
            category: 'hvac',
            display_name: 'Fan Speed',
            speed_levels: ['off', 'low', 'medium', 'high', 'auto'],
            controls: ['speed_buttons', 'auto_mode'],
            states: ['speed', 'mode'],
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
            primary_control: 'switch_grid',
            icon: 'fas fa-toggle-on',
            category: 'power',
            display_name: 'Multi-Switch',
            switch_count: 4,
            controls: ['individual_switches', 'all_on', 'all_off'],
            states: ['switch1', 'switch2', 'switch3', 'switch4'],
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
                features: this.extractFeatures(clusterInfo)
            },
            ui_metadata: {
                component_type: this.getComponentType(clusterType),
                layout: this.getLayout(clusterType),
                theme: this.getTheme(clusterType),
                animations: this.getAnimations(clusterType)
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
            'OnOff': 'toggle_switch',
            'LevelControl': 'brightness_slider',
            'ColorControl': 'color_picker',
            'Thermostat': 'temperature_dial',
            'DoorLock': 'lock_control',
            'FanControl': 'speed_selector',
            'Switch': 'switch_grid'
        };
        return componentTypes[clusterType] || 'generic_control';
    }

    getLayout(clusterType) {
        const layouts = {
            'OnOff': 'horizontal',
            'LevelControl': 'vertical',
            'ColorControl': 'grid',
            'Thermostat': 'circular',
            'DoorLock': 'vertical',
            'FanControl': 'grid',
            'Switch': 'grid'
        };
        return layouts[clusterType] || 'vertical';
    }

    getTheme(clusterType) {
        const themes = {
            'OnOff': 'power',
            'LevelControl': 'lighting',
            'ColorControl': 'colorful',
            'Thermostat': 'temperature',
            'DoorLock': 'security',
            'FanControl': 'air',
            'Switch': 'power'
        };
        return themes[clusterType] || 'default';
    }

    getAnimations(clusterType) {
        const animations = {
            'OnOff': ['fade', 'slide'],
            'LevelControl': ['smooth_transition'],
            'ColorControl': ['color_transition', 'pulse'],
            'Thermostat': ['temperature_change'],
            'DoorLock': ['lock_animation'],
            'FanControl': ['spin', 'speed_change'],
            'Switch': ['toggle']
        };
        return animations[clusterType] || [];
    }

    formatConfigAsJSON(config) {
        return JSON.stringify(config, null, 2);
    }

    getConfigSummary(config) {
        return {
            cluster: config.cluster_info.name,
            primary_control: config.primary_control,
            category: config.category,
            capabilities: Object.keys(config.capabilities.attributes).length,
            commands: Object.keys(config.capabilities.commands).length,
            features: Object.keys(config.capabilities.features).length
        };
    }
}

// Export for use in other modules
window.UIConfigGenerator = UIConfigGenerator;
