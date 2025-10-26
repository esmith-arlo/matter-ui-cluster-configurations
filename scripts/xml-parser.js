class MatterXMLParser {
    constructor() {
        this.clusterData = new Map();
    }

    async parseClusterXML(xmlContent) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

        const cluster = xmlDoc.querySelector('cluster');
        if (!cluster) {
            throw new Error('Invalid cluster XML');
        }

        const clusterInfo = {
            id: cluster.getAttribute('id'),
            name: cluster.getAttribute('name'),
            revision: cluster.getAttribute('revision'),
            classification: this.parseClassification(cluster),
            features: this.parseFeatures(cluster),
            dataTypes: this.parseDataTypes(cluster),
            attributes: this.parseAttributes(cluster),
            commands: this.parseCommands(cluster)
        };

        this.clusterData.set(clusterInfo.id, clusterInfo);
        return clusterInfo;
    }

    parseClassification(cluster) {
        const classification = cluster.querySelector('classification');
        if (!classification) return null;

        return {
            hierarchy: classification.getAttribute('hierarchy'),
            role: classification.getAttribute('role'),
            picsCode: classification.getAttribute('picsCode'),
            scope: classification.getAttribute('scope')
        };
    }

    parseFeatures(cluster) {
        const features = [];
        const featureElements = cluster.querySelectorAll('feature');

        featureElements.forEach(feature => {
            features.push({
                bit: feature.getAttribute('bit'),
                code: feature.getAttribute('code'),
                name: feature.getAttribute('name'),
                summary: feature.getAttribute('summary')
            });
        });

        return features;
    }

    parseDataTypes(cluster) {
        const dataTypes = [];
        const dataTypeElements = cluster.querySelectorAll('dataTypes > enum, dataTypes > bitmap');

        dataTypeElements.forEach(dataType => {
            const typeInfo = {
                name: dataType.getAttribute('name'),
                type: dataType.tagName,
                items: []
            };

            const items = dataType.querySelectorAll('item, bitfield');
            items.forEach(item => {
                typeInfo.items.push({
                    value: item.getAttribute('value'),
                    name: item.getAttribute('name'),
                    summary: item.getAttribute('summary')
                });
            });

            dataTypes.push(typeInfo);
        });

        return dataTypes;
    }

    parseAttributes(cluster) {
        const attributes = [];
        const attributeElements = cluster.querySelectorAll('attribute');

        attributeElements.forEach(attr => {
            const attribute = {
                id: attr.getAttribute('id'),
                name: attr.getAttribute('name'),
                type: attr.getAttribute('type'),
                access: this.parseAccess(attr),
                quality: this.parseQuality(attr),
                constraint: this.parseConstraint(attr)
            };

            attributes.push(attribute);
        });

        return attributes;
    }

    parseCommands(cluster) {
        const commands = [];
        const commandElements = cluster.querySelectorAll('command');

        commandElements.forEach(cmd => {
            const command = {
                id: cmd.getAttribute('id'),
                name: cmd.getAttribute('name'),
                direction: cmd.getAttribute('direction'),
                response: cmd.getAttribute('response'),
                access: this.parseAccess(cmd),
                fields: this.parseFields(cmd)
            };

            commands.push(command);
        });

        return commands;
    }

    parseAccess(element) {
        const access = element.querySelector('access');
        if (!access) return null;

        return {
            read: access.getAttribute('read') === 'true',
            write: access.getAttribute('write') === 'true',
            invoke: access.getAttribute('invoke') === 'true',
            readPrivilege: access.getAttribute('readPrivilege'),
            writePrivilege: access.getAttribute('writePrivilege'),
            invokePrivilege: access.getAttribute('invokePrivilege')
        };
    }

    parseQuality(element) {
        const quality = element.querySelector('quality');
        if (!quality) return null;

        return {
            nullable: quality.getAttribute('nullable') === 'true',
            scene: quality.getAttribute('scene') === 'true',
            persistence: quality.getAttribute('persistence'),
            reportable: quality.getAttribute('reportable') === 'true',
            quieterReporting: quality.getAttribute('quieterReporting') === 'true'
        };
    }

    parseConstraint(element) {
        const constraint = element.querySelector('constraint');
        if (!constraint) return null;

        const between = constraint.querySelector('between');
        if (between) {
            return {
                type: 'between',
                from: between.querySelector('from')?.getAttribute('value') ||
                    between.querySelector('from attribute')?.getAttribute('name'),
                to: between.querySelector('to')?.getAttribute('value') ||
                    between.querySelector('to attribute')?.getAttribute('name')
            };
        }

        const min = constraint.querySelector('min');
        if (min) {
            return {
                type: 'min',
                value: min.getAttribute('value')
            };
        }

        const max = constraint.querySelector('max');
        if (max) {
            return {
                type: 'max',
                value: max.getAttribute('value')
            };
        }

        return null;
    }

    parseFields(command) {
        const fields = [];
        const fieldElements = command.querySelectorAll('field');

        fieldElements.forEach(field => {
            fields.push({
                id: field.getAttribute('id'),
                name: field.getAttribute('name'),
                type: field.getAttribute('type'),
                constraint: this.parseConstraint(field)
            });
        });

        return fields;
    }

    getClusterInfo(clusterId) {
        return this.clusterData.get(clusterId);
    }

    getAllClusters() {
        return Array.from(this.clusterData.values());
    }
}

// Export for use in other modules
window.MatterXMLParser = MatterXMLParser;
