# SVG Editor (HMI)

A comprehensive SVG editor built with Angular 19, featuring D3.js integration for enhanced SVG manipulation and interactive functionality.

## Features

### ✅ Implemented Core Functionality
- **SVG Loading**: Load SVG files in canvas with template selection
- **Label Management**: Add text and image labels with right-click context menu
- **Attribute Editing**: Extract and edit all SVG element attributes with live updates
- **Color Animation**: Automatic color change animations for selected elements in preview mode
- **Zoom & Pan**: Mouse wheel zoom with D3.js integration for smooth interactions
- **Preview Mode**: Toggle between edit and preview modes with animation controls
- **Element Selection**: Click to select elements with visual selection handles
- **Drag & Drop**: Drag elements around the canvas
- **Context Menu**: Right-click context menu with label management options
- **Responsive Design**: Optimized for small laptop screens and various viewport sizes

### ✅ Implemented Advanced Features
- **D3.js Integration**: Enhanced zoom functionality and SVG manipulation
- **State Management**: Angular Signals for reactive state management
- **Modular Architecture**: Component-based architecture with shared components
- **Performance Optimized**: OnPush change detection and efficient rendering
- **Memory Management**: Proper cleanup of event listeners and animations


### Technical Implementation
- **Framework**: Angular 19 with standalone components
- **Libraries**: D3.js v7.9.0, Angular Material
- **State Management**: Angular Signals for reactive state management
- **Styling**: SCSS with responsive design
- **Architecture**: Modular component-based architecture

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd svg-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to `http://localhost:4200`

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Usage Guide

### Basic Operations

1. **Loading SVG Files**
   - Use File → Open to load SVG files
   - HPGR-V004 template is selected by default but not automatically loaded

2. **Adding Labels**
   - Right-click anywhere on the canvas
   - Select "Add Text Label" or "Add Image Label"
   - Labels can be customized through the property panel

3. **Editing Elements**
   - Click to select elements
   - Use the property panel to edit attributes
   - Double-click elements to open attribute dialog

4. **Preview Mode**
   - Toggle preview mode from View menu
   - In preview mode, editing is disabled
   - Click on elements with chart actions to view interactive charts

### Advanced Features

1. **Zoom & Pan**
   - Mouse wheel to zoom in/out
   - Pan tool for navigation
   - Zoom controls in top-right corner

2. **Animation System**
   - Select elements and configure animation properties
   - Set color, duration, and interval
   - Preview animations before applying
   - Automatic color change animations in preview mode

3. **Element Management**
   - Click to select elements
   - Drag elements around the canvas
   - Visual selection handles and resize controls
   - Multi-element selection support

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── file-panel/           # File management panel with template selection
│   │   ├── label-customization-dialog/ # Label customization dialog
│   │   ├── property-panel/       # Element property editing
│   │   ├── svg-canvas/           # Main SVG canvas component
│   │   ├── toolbar/              # Main toolbar component
│   │   └── shared/               # Shared reusable components
│   │       ├── animation-controls/    # Animation controls
│   │       ├── canvas-controls/       # Zoom/pan controls
│   │       ├── context-menu/          # Right-click context menu
│   │       ├── dialog/                # Base dialog component
│   │       ├── property-input/        # Property input components
│   │       ├── selection-handles/     # Element selection handles
│   │       └── ...                    # Other shared components
│   ├── constants/                # Application constants
│   ├── models/                   # TypeScript interfaces and enums
│   ├── services/                 # Core services
│   │   ├── svg-editor.service.ts     # Main SVG editor service
│   │   ├── preview-mode.service.ts   # Preview mode management
│   │   ├── svg-storage.service.ts    # SVG file storage
│   │   └── ...                        # Other services
│   ├── utils/                    # Utility classes
│   │   ├── animation.utils.ts        # Animation utilities
│   │   ├── canvas.utils.ts           # Canvas utilities
│   │   ├── d3.utils.ts               # D3.js utilities
│   │   ├── element.utils.ts          # Element manipulation utilities
│   │   └── ...                        # Other utilities
│   └── ...
├── public/
│   └── assets/                   # Static assets including sample SVG files
└── styles.scss                   # Global styles with responsive design
```

## Key Components

### SVG Canvas Component
- Main canvas for SVG manipulation
- D3.js zoom integration
- Right-click context menu
- Element selection and manipulation
- Drag and drop functionality

### Property Panel
- Real-time attribute editing
- Animation configuration
- Element property management
- Grouped property organization

### File Panel
- Template selection and management
- SVG file upload and storage
- Template grid with search and filtering

### Label Customization Dialog
- Text label customization
- Font family, size, color, and alignment options
- Live preview of label changes

### Shared Components
- **Dialog**: Base dialog component for modals
- **Property Input**: Various input types for property editing
- **Selection Handles**: Visual selection indicators
- **Context Menu**: Right-click menu system
- **Animation Controls**: Animation configuration interface

## Responsive Design

The application is optimized for various screen sizes:

- **Desktop (1366px+)**: Full feature set with all panels visible
- **Small Laptop (1024px-1366px)**: Compact layout with essential features
- **Tablet (768px-1024px)**: Stacked layout with collapsible panels
- **Mobile (768px-)**: Mobile-optimized interface with bottom sheet panels

### Running Tests
```bash
npm test
```
