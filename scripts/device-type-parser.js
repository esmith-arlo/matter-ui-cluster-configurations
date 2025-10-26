class DeviceTypeParser {
    constructor() {
        this.deviceTypes = new Map();
        this.clusterData = new Map();
        this.initializeDeviceTypes();
    }

    initializeDeviceTypes() {
        // Define device types and their associated clusters
        this.deviceTypes.set('lights', {
            name: 'Light',
            icon: 'fas fa-lightbulb',
            category: true,
            deviceTypes: [
                { 
                    key: 'onoff-light', 
                    id: '0x0100', 
                    name: 'On/Off Light', 
                    clusters: ['Identify', 'Groups', 'OnOff'] 
                },
                { 
                    key: 'dimmable-light', 
                    id: '0x0101', 
                    name: 'Dimmable Light', 
                    clusters: ['Identify', 'Groups', 'OnOff', 'LevelControl'] 
                },
                { 
                    key: 'color-temp-light', 
                    id: '0x010C', 
                    name: 'Color Temperature Light', 
                    clusters: ['Identify', 'Groups', 'OnOff', 'LevelControl', 'ColorControl'] 
                },
                { 
                    key: 'extended-color-light', 
                    id: '0x010D', 
                    name: 'Extended Color Light', 
                    clusters: ['Identify', 'Groups', 'OnOff', 'LevelControl', 'ColorControl', 'ScenesManagement'] 
                }
            ],
            clusters: [
                { id: '0x0003', name: 'Identify', type: 'Identify' },
                { id: '0x0004', name: 'Groups', type: 'Groups' },
                { id: '0x0006', name: 'On/Off', type: 'OnOff' },
                { id: '0x0008', name: 'Level Control', type: 'LevelControl' },
                { id: '0x0300', name: 'Color Control', type: 'ColorControl' },
                { id: '0x0062', name: 'Scenes Management', type: 'ScenesManagement' }
            ]
        });

        this.deviceTypes.set('entry-control', {
            name: 'Entry Control',
            icon: 'fas fa-lock',
            category: true,
            deviceTypes: [
                { 
                    key: 'door-lock', 
                    id: '0x000A', 
                    name: 'Door Lock', 
                    clusters: ['Identify', 'Groups', 'OnOff', 'DoorLock', 'ScenesManagement'] 
                }
            ],
            clusters: [
                { id: '0x0003', name: 'Identify', type: 'Identify' },
                { id: '0x0004', name: 'Groups', type: 'Groups' },
                { id: '0x0006', name: 'On/Off', type: 'OnOff' },
                { id: '0x0101', name: 'Door Lock', type: 'DoorLock' },
                { id: '0x0062', name: 'Scenes Management', type: 'ScenesManagement' }
            ]
        });

        this.deviceTypes.set('hvac', {
            name: 'HVAC',
            icon: 'fas fa-thermometer-half',
            category: true,
            deviceTypes: [
                { 
                    key: 'thermostat', 
                    id: '0x0301', 
                    name: 'Thermostat', 
                    clusters: ['Identify', 'Groups', 'Thermostat', 'FanControl', 'TemperatureMeasurement', 'RelativeHumidityMeasurement', 'OccupancySensing'] 
                }
            ],
            clusters: [
                { id: '0x0003', name: 'Identify', type: 'Identify' },
                { id: '0x0004', name: 'Groups', type: 'Groups' },
                { id: '0x0201', name: 'Thermostat', type: 'Thermostat' },
                { id: '0x0202', name: 'Fan Control', type: 'FanControl' },
                { id: '0x0402', name: 'Temperature Measurement', type: 'TemperatureMeasurement' },
                { id: '0x0405', name: 'Relative Humidity Measurement', type: 'RelativeHumidityMeasurement' },
                { id: '0x0406', name: 'Occupancy Sensing', type: 'OccupancySensing' }
            ]
        });

        this.deviceTypes.set('plugs', {
            name: 'Plugs',
            icon: 'fas fa-plug',
            category: true,
            deviceTypes: [
                { 
                    key: 'onoff-plug', 
                    id: '0x010A', 
                    name: 'On/Off Plug-in Unit', 
                    clusters: ['Identify', 'Groups', 'OnOff'] 
                },
                { 
                    key: 'dimmable-plug', 
                    id: '0x010B', 
                    name: 'Dimmable Plug-In Unit', 
                    clusters: ['Identify', 'Groups', 'OnOff', 'LevelControl'] 
                },
                { 
                    key: 'mounted-onoff-control', 
                    id: '0x010C', 
                    name: 'Mounted On/Off Control', 
                    clusters: ['Identify', 'Groups', 'OnOff', 'ScenesManagement'] 
                },
                { 
                    key: 'mounted-dimmable-control', 
                    id: '0x010D', 
                    name: 'Mounted Dimmable Load Control', 
                    clusters: ['Identify', 'Groups', 'OnOff', 'LevelControl', 'ScenesManagement'] 
                },
                { 
                    key: 'pump', 
                    id: '0x0303', 
                    name: 'Pump', 
                    clusters: ['Identify', 'Groups', 'OnOff', 'LevelControl', 'PumpConfigurationAndControl'] 
                },
                { 
                    key: 'water-valve', 
                    id: '0x0304', 
                    name: 'Water Valve', 
                    clusters: ['Identify', 'Groups', 'OnOff', 'LevelControl', 'ValveConfigurationAndControl'] 
                }
            ],
            clusters: [
                { id: '0x0003', name: 'Identify', type: 'Identify' },
                { id: '0x0004', name: 'Groups', type: 'Groups' },
                { id: '0x0006', name: 'On/Off', type: 'OnOff' },
                { id: '0x0008', name: 'Level Control', type: 'LevelControl' },
                { id: '0x0062', name: 'Scenes Management', type: 'ScenesManagement' },
                { id: '0x0200', name: 'Pump Configuration and Control', type: 'PumpConfigurationAndControl' },
                { id: '0x0201', name: 'Valve Configuration and Control', type: 'ValveConfigurationAndControl' }
            ]
        });
    }

    getDeviceTypeCategories() {
        return Array.from(this.deviceTypes.keys()).map(key => ({
            key,
            name: this.deviceTypes.get(key).name,
            icon: this.deviceTypes.get(key).icon
        }));
    }

    getClustersForDeviceType(deviceTypeKey) {
        const deviceType = this.deviceTypes.get(deviceTypeKey);
        return deviceType ? deviceType.clusters : [];
    }

    getDeviceTypesForCategory(deviceTypeKey) {
        const deviceType = this.deviceTypes.get(deviceTypeKey);
        return deviceType ? deviceType.deviceTypes : [];
    }

    getClusterInfo(clusterId) {
        // This would normally parse the XML files, but for now return mock data
        const clusterInfos = {
            '0x0003': {
                id: '0x0003',
                name: 'Identify',
                revision: '4',
                classification: {
                    hierarchy: 'base',
                    role: 'utility',
                    picsCode: 'ID',
                    scope: 'Endpoint'
                },
                features: [],
                attributes: [
                    { id: '0x0000', name: 'IdentifyTime', type: 'uint16' }
                ],
                commands: [
                    { id: '0x00', name: 'Identify', direction: 'commandToServer' },
                    { id: '0x01', name: 'IdentifyQuery', direction: 'commandToClient' },
                    { id: '0x40', name: 'TriggerEffect', direction: 'commandToServer' }
                ]
            },
            '0x0004': {
                id: '0x0004',
                name: 'Groups',
                revision: '4',
                classification: {
                    hierarchy: 'base',
                    role: 'application',
                    picsCode: 'G',
                    scope: 'Endpoint'
                },
                features: [],
                attributes: [
                    { id: '0x0000', name: 'NameSupport', type: 'bitmap8' }
                ],
                commands: [
                    { id: '0x00', name: 'AddGroup', direction: 'commandToServer' },
                    { id: '0x01', name: 'ViewGroup', direction: 'commandToServer' },
                    { id: '0x02', name: 'GetGroupMembership', direction: 'commandToServer' },
                    { id: '0x03', name: 'RemoveGroup', direction: 'commandToServer' }
                ]
            },
            '0x0006': {
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
            '0x0008': {
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
                    { id: '0x0001', name: 'RemainingTime', type: 'uint16' },
                    { id: '0x0002', name: 'MinLevel', type: 'uint8' },
                    { id: '0x0003', name: 'MaxLevel', type: 'uint8' }
                ],
                commands: [
                    { id: '0x00', name: 'MoveToLevel', direction: 'commandToServer' },
                    { id: '0x01', name: 'Move', direction: 'commandToServer' },
                    { id: '0x02', name: 'Step', direction: 'commandToServer' },
                    { id: '0x03', name: 'Stop', direction: 'commandToServer' }
                ]
            },
            '0x0300': {
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
                    { bit: '2', code: 'CL', name: 'ColorLoop', summary: 'Color loop support' },
                    { bit: '3', code: 'XY', name: 'XY', summary: 'XY color support' },
                    { bit: '4', code: 'CT', name: 'ColorTemperature', summary: 'Color temperature support' }
                ],
                attributes: [
                    { id: '0x0000', name: 'CurrentHue', type: 'uint8' },
                    { id: '0x0001', name: 'CurrentSaturation', type: 'uint8' },
                    { id: '0x0002', name: 'RemainingTime', type: 'uint16' },
                    { id: '0x0007', name: 'ColorTemperatureMireds', type: 'uint16' },
                    { id: '0x0008', name: 'ColorMode', type: 'enum8' }
                ],
                commands: [
                    { id: '0x00', name: 'MoveToHue', direction: 'commandToServer' },
                    { id: '0x01', name: 'MoveHue', direction: 'commandToServer' },
                    { id: '0x02', name: 'StepHue', direction: 'commandToServer' },
                    { id: '0x03', name: 'MoveToSaturation', direction: 'commandToServer' },
                    { id: '0x04', name: 'MoveSaturation', direction: 'commandToServer' },
                    { id: '0x05', name: 'StepSaturation', direction: 'commandToServer' }
                ]
            },
            '0x0101': {
                id: '0x0101',
                name: 'Door Lock',
                revision: '4',
                classification: {
                    hierarchy: 'base',
                    role: 'application',
                    picsCode: 'DL',
                    scope: 'Endpoint'
                },
                features: [
                    { bit: '0', code: 'PIN', name: 'PIN', summary: 'PIN credential support' },
                    { bit: '1', code: 'RID', name: 'RID', summary: 'RFID credential support' },
                    { bit: '2', code: 'FGP', name: 'FGP', summary: 'Fingerprint credential support' },
                    { bit: '3', code: 'FACE', name: 'FACE', summary: 'Face credential support' },
                    { bit: '4', code: 'ALIRO', name: 'ALIRO', summary: 'Aliro credential support' }
                ],
                attributes: [
                    { id: '0x0000', name: 'LockState', type: 'enum8' },
                    { id: '0x0001', name: 'LockType', type: 'enum8' },
                    { id: '0x0002', name: 'ActuatorEnabled', type: 'boolean' },
                    { id: '0x0003', name: 'DoorState', type: 'enum8' }
                ],
                commands: [
                    { id: '0x00', name: 'LockDoor', direction: 'commandToServer' },
                    { id: '0x01', name: 'UnlockDoor', direction: 'commandToServer' },
                    { id: '0x02', name: 'UnlockWithTimeout', direction: 'commandToServer' },
                    { id: '0x03', name: 'SetUser', direction: 'commandToServer' },
                    { id: '0x04', name: 'GetUser', direction: 'commandToServer' },
                    { id: '0x05', name: 'ClearUser', direction: 'commandToServer' }
                ]
            },
            '0x0201': {
                id: '0x0201',
                name: 'Thermostat',
                revision: '6',
                classification: {
                    hierarchy: 'base',
                    role: 'application',
                    picsCode: 'TSTAT',
                    scope: 'Endpoint'
                },
                features: [
                    { bit: '0', code: 'HEAT', name: 'Heating', summary: 'Heating support' },
                    { bit: '1', code: 'COOL', name: 'Cooling', summary: 'Cooling support' },
                    { bit: '2', code: 'OCC', name: 'Occupancy', summary: 'Occupancy sensing' },
                    { bit: '3', code: 'SCH', name: 'Schedule', summary: 'Schedule support' }
                ],
                attributes: [
                    { id: '0x0000', name: 'LocalTemperature', type: 'int16s' },
                    { id: '0x0001', name: 'OutdoorTemperature', type: 'int16s' },
                    { id: '0x0002', name: 'Occupancy', type: 'bitmap8' },
                    { id: '0x0003', name: 'AbsMinHeatSetpointLimit', type: 'int16s' },
                    { id: '0x0004', name: 'AbsMaxHeatSetpointLimit', type: 'int16s' },
                    { id: '0x0005', name: 'AbsMinCoolSetpointLimit', type: 'int16s' },
                    { id: '0x0006', name: 'AbsMaxCoolSetpointLimit', type: 'int16s' }
                ],
                commands: [
                    { id: '0x00', name: 'SetpointRaiseLower', direction: 'commandToServer' },
                    { id: '0x01', name: 'SetWeeklySchedule', direction: 'commandToServer' },
                    { id: '0x02', name: 'GetWeeklySchedule', direction: 'commandToServer' },
                    { id: '0x03', name: 'ClearWeeklySchedule', direction: 'commandToServer' }
                ]
            },
            '0x0202': {
                id: '0x0202',
                name: 'Fan Control',
                revision: '3',
                classification: {
                    hierarchy: 'base',
                    role: 'application',
                    picsCode: 'FC',
                    scope: 'Endpoint'
                },
                features: [
                    { bit: '0', code: 'MULTI', name: 'MultiSpeed', summary: 'Multi-speed support' },
                    { bit: '1', code: 'AUTO', name: 'Auto', summary: 'Auto mode support' },
                    { bit: '2', code: 'ROCKING', name: 'Rocking', summary: 'Rocking support' },
                    { bit: '3', code: 'WIND', name: 'Wind', summary: 'Wind mode support' }
                ],
                attributes: [
                    { id: '0x0000', name: 'FanMode', type: 'enum8' },
                    { id: '0x0001', name: 'FanModeSequence', type: 'enum8' },
                    { id: '0x0002', name: 'PercentSetting', type: 'uint8' },
                    { id: '0x0003', name: 'PercentCurrent', type: 'uint8' }
                ],
                commands: [
                    { id: '0x00', name: 'Step', direction: 'commandToServer' },
                    { id: '0x01', name: 'StepHue', direction: 'commandToServer' }
                ]
            },
            '0x0062': {
                id: '0x0062',
                name: 'Scenes Management',
                revision: '1',
                classification: {
                    hierarchy: 'base',
                    role: 'application',
                    picsCode: 'SC',
                    scope: 'Endpoint'
                },
                features: [],
                attributes: [
                    { id: '0x0000', name: 'SceneCount', type: 'uint8' },
                    { id: '0x0001', name: 'CurrentScene', type: 'uint8' },
                    { id: '0x0002', name: 'CurrentGroup', type: 'uint16' },
                    { id: '0x0003', name: 'SceneValid', type: 'boolean' }
                ],
                commands: [
                    { id: '0x00', name: 'AddScene', direction: 'commandToServer' },
                    { id: '0x01', name: 'ViewScene', direction: 'commandToServer' },
                    { id: '0x02', name: 'RemoveScene', direction: 'commandToServer' },
                    { id: '0x03', name: 'RemoveAllScenes', direction: 'commandToServer' },
                    { id: '0x04', name: 'StoreScene', direction: 'commandToServer' },
                    { id: '0x05', name: 'RecallScene', direction: 'commandToServer' },
                    { id: '0x06', name: 'GetSceneMembership', direction: 'commandToServer' }
                ]
            },
            '0x0200': {
                id: '0x0200',
                name: 'PumpConfigurationAndControl',
                revision: '1',
                classification: {
                    hierarchy: 'application',
                    role: 'utility',
                    picsCode: 'PC',
                    scope: 'Endpoint'
                },
                features: [],
                attributes: [
                    { id: '0x0000', name: 'MaxPressure', type: 'int16s' },
                    { id: '0x0001', name: 'MaxSpeed', type: 'uint16' },
                    { id: '0x0002', name: 'MaxFlow', type: 'uint16' },
                    { id: '0x0003', name: 'MinConstPressure', type: 'int16s' },
                    { id: '0x0004', name: 'MaxConstPressure', type: 'int16s' },
                    { id: '0x0005', name: 'MinCompPressure', type: 'int16s' },
                    { id: '0x0006', name: 'MaxCompPressure', type: 'int16s' },
                    { id: '0x0007', name: 'MinConstSpeed', type: 'uint16' },
                    { id: '0x0008', name: 'MaxConstSpeed', type: 'uint16' },
                    { id: '0x0009', name: 'PumpStatus', type: 'enum8' },
                    { id: '0x000A', name: 'EffectiveOperationMode', type: 'enum8' },
                    { id: '0x000B', name: 'EffectiveControlMode', type: 'enum8' },
                    { id: '0x000C', name: 'Capacity', type: 'int16s' },
                    { id: '0x000D', name: 'Speed', type: 'uint16' },
                    { id: '0x000E', name: 'LifetimeRunningHours', type: 'uint24' },
                    { id: '0x000F', name: 'Power', type: 'uint24' },
                    { id: '0x0010', name: 'LifetimeEnergyConsumed', type: 'uint32' },
                    { id: '0x0011', name: 'OperationMode', type: 'enum8' },
                    { id: '0x0012', name: 'ControlMode', type: 'enum8' }
                ],
                commands: [
                    { id: '0x00', name: 'SetOperationMode', direction: 'commandToServer' },
                    { id: '0x01', name: 'SetControlMode', direction: 'commandToServer' },
                    { id: '0x02', name: 'SetCapacity', direction: 'commandToServer' },
                    { id: '0x03', name: 'SetSpeed', direction: 'commandToServer' }
                ]
            },
            '0x0201': {
                id: '0x0201',
                name: 'ValveConfigurationAndControl',
                revision: '1',
                classification: {
                    hierarchy: 'application',
                    role: 'utility',
                    picsCode: 'VC',
                    scope: 'Endpoint'
                },
                features: [],
                attributes: [
                    { id: '0x0000', name: 'OpenDuration', type: 'uint16' },
                    { id: '0x0001', name: 'ClosedDuration', type: 'uint16' },
                    { id: '0x0002', name: 'Position', type: 'uint8' },
                    { id: '0x0003', name: 'ValveStatus', type: 'enum8' },
                    { id: '0x0004', name: 'ValveFault', type: 'map8' },
                    { id: '0x0005', name: 'ValveFaultCode', type: 'uint8' },
                    { id: '0x0006', name: 'ValveFaultCodeDescription', type: 'string' },
                    { id: '0x0007', name: 'ValveFaultCodeDescriptionUrl', type: 'string' }
                ],
                commands: [
                    { id: '0x00', name: 'Open', direction: 'commandToServer' },
                    { id: '0x01', name: 'Close', direction: 'commandToServer' },
                    { id: '0x02', name: 'SetPosition', direction: 'commandToServer' },
                    { id: '0x03', name: 'SetOpenDuration', direction: 'commandToServer' },
                    { id: '0x04', name: 'SetClosedDuration', direction: 'commandToServer' }
                ]
            }
        };

        return clusterInfos[clusterId] || null;
    }

    async loadDeviceTypeData() {
        // In a real implementation, this would load and parse the XML files
        console.log('Device type data loaded');
    }
}

// Export for use in other modules
window.DeviceTypeParser = DeviceTypeParser;
