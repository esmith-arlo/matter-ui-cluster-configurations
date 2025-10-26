class UIConfigGenerator {
    constructor() {
        this.configTemplates = new Map();
        this.initializeTemplates();
    }

    initializeTemplates() {
        this.configTemplates.set('OnOff', {
            primary_control: 'toggle_switch',
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

        this.configTemplates.set('Identify', {
            primary_control: 'identify_panel',
            controls: ['identify_button', 'trigger_effect', 'stop_button'],
            states: ['ready', 'identifying', 'triggering'],
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
            primary_control: 'groups_panel',
            controls: ['add_to_group', 'remove_from_group', 'view_groups'],
            states: ['ungrouped', 'grouped'],
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
            primary_control: 'scenes_panel',
            controls: ['create_scene', 'activate_scene', 'deactivate_scene', 'delete_scene'],
            states: ['no_scene', 'scene_active'],
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
            primary_control: 'pump_control_panel',
            controls: ['start_stop', 'speed_control', 'pressure_control', 'mode_selector'],
            states: ['stopped', 'running', 'fault'],
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
            primary_control: 'valve_control_panel',
            controls: ['open_close', 'position_control', 'timing_control'],
            states: ['closed', 'open', 'fault'],
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
            'Switch': 'switch_grid',
            'Identify': 'identify_panel',
            'Groups': 'groups_panel',
            'ScenesManagement': 'scenes_panel',
            'PumpConfigurationAndControl': 'pump_control_panel',
            'ValveConfigurationAndControl': 'valve_control_panel'
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
            'Switch': 'grid',
            'Identify': 'vertical',
            'Groups': 'vertical',
            'ScenesManagement': 'vertical',
            'PumpConfigurationAndControl': 'vertical',
            'ValveConfigurationAndControl': 'vertical'
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
            'Switch': 'power',
            'Identify': 'utility',
            'Groups': 'organization',
            'ScenesManagement': 'automation',
            'PumpConfigurationAndControl': 'industrial',
            'ValveConfigurationAndControl': 'water'
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
            'Switch': ['toggle'],
            'Identify': ['pulse', 'blink', 'breathe'],
            'Groups': ['fade', 'slide'],
            'ScenesManagement': ['fade', 'slide'],
            'PumpConfigurationAndControl': ['pulse', 'rotation'],
            'ValveConfigurationAndControl': ['flow', 'position_change']
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
