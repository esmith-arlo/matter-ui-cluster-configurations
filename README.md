# Matter Cluster UI Visualizer

A simple web application that displays UI capabilities for Matter clusters in JSON format alongside actual UI components. This tool helps visualize how Matter cluster definitions map to user interface components.

## Features

- **Interactive UI Components**: Real-time visualization of Matter cluster UI components
- **JSON Capabilities Display**: Live JSON capabilities alongside UI components
- **Cluster Information**: Detailed cluster metadata, attributes, and commands
- **Export Functionality**: Copy or download UI capabilities
- **Responsive Design**: Works on desktop and mobile devices

## Supported Clusters

- **On/Off (0x0006)**: Basic power control with toggle switch
- **Level Control (0x0008)**: Brightness/dimming control with slider
- **Color Control (0x0300)**: Color and temperature control with color picker
- **Thermostat (0x0201)**: Temperature control with dial and buttons
- **Door Lock (0x0101)**: Lock control with status display
- **Fan Control (0x0202)**: Fan speed control with mode selector
- **Switch (0x003B)**: Multi-switch control with grid layout

## Getting Started

1. **Open the Application**
   ```bash
   # Simply open index.html in a web browser
   open index.html
   ```

2. **Select a Cluster**
   - Use the dropdown to select a Matter cluster
   - The UI component will appear on the left
   - The JSON capabilities will appear on the right

3. **Interact with Components**
   - Click, drag, or interact with UI components
   - Watch the JSON capabilities update in real-time
   - View cluster information below the main panels

4. **Export Capabilities**
   - Click "Copy JSON" to copy capabilities to clipboard
   - Click "Download" to save capabilities as JSON file

## Project Structure

```
matter-ui-visualizer/
├── index.html              # Main HTML file
├── styles/
│   ├── main.css           # Main application styles
│   └── components.css     # UI component styles
├── scripts/
│   ├── main.js            # Main application logic
│   ├── xml-parser.js      # XML parsing utilities
│   ├── ui-components.js   # UI component implementations
│   └── config-generator.js # Capability generation
├── data/
│   └── clusters/          # Sample cluster XML files
└── README.md
```

## Technical Details

### XML Parser
- Parses Matter cluster XML definitions
- Extracts attributes, commands, and features
- Handles cluster classification and constraints

### UI Components
- Interactive React-like components
- Real-time state management
- Event-driven updates

### Capability Generator
- Generates comprehensive UI configurations
- Includes accessibility and theming information
- Supports multiple cluster types

## Customization

### Adding New Clusters
1. Add cluster XML file to `data/clusters/`
2. Implement UI component in `ui-components.js`
3. Add configuration template in `config-generator.js`
4. Update cluster selector in `index.html`

### Styling
- Modify `styles/main.css` for global styles
- Update `styles/components.css` for component-specific styles
- Use CSS custom properties for theming

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development

This is a client-side application with no build process required. Simply open `index.html` in a web browser to run the application.

## License

This project is for educational purposes and demonstrates Matter cluster UI visualization concepts.
