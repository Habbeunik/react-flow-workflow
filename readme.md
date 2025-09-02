# useWorkflowBuilder

A powerful React hook for building interactive workflow diagrams with React Flow. The `useWorkflowBuilder` hook simplifies the creation and management of node-based workflows with automatic layout capabilities.

[![npm version](https://badge.fury.io/js/react-flow-workflow.svg)](https://badge.fury.io/js/react-flow-workflow)
[![npm downloads](https://img.shields.io/npm/dm/react-flow-workflow.svg)](https://www.npmjs.com/package/react-flow-workflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [When to Use](#when-to-use)
- [Basic Usage](#basic-usage)
- [Working with Edges](#working-with-edges)
  - [Creating Edges](#creating-edges)
  - [Custom Edge Styles](#custom-edge-styles)
  - [Edge Analysis](#edge-analysis)
- [Advanced Usage](#advanced-usage)
  - [Multiple Components](#multiple-components)
  - [Custom Node Types](#custom-node-types)
  - [With ReactFlowProvider](#with-reactflowprovider)
- [API Reference](#api-reference)
- [License](#license)

## Installation

### Prerequisites

This package requires React 18+ and React Flow 11+ as peer dependencies.

### Install the package

```bash
# Using npm
npm install react-flow-workflow reactflow

# Using yarn
yarn add react-flow-workflow reactflow

# Using pnpm
pnpm add react-flow-workflow reactflow
```

### Install React Flow styles

```bash
# Import the CSS in your main component or entry file
import 'reactflow/dist/style.css';
```

## Quick Start

Here's a minimal example to get you started:

```jsx
import React from 'react';
import ReactFlow from 'reactflow';
import { useWorkflowBuilder } from 'react-flow-workflow';
import 'reactflow/dist/style.css';

function SimpleWorkflow() {
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		createNode,
	} = useWorkflowBuilder();

	const addNode = () => {
		createNode({
			data: { label: 'New Node' },
		});
	};

	return (
		<div style={{ height: '400px' }}>
			<button onClick={addNode}>Add Node</button>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView
			/>
		</div>
	);
}

export default SimpleWorkflow;
```

## Features

`useWorkflowBuilder` provides several advantages over using React Flow's standard functions:

- **🔄 Automatic Layout** - Built-in layout engine that organizes nodes without manual positioning
- **🧰 Simplified API** - Combines multiple React Flow hooks into a single cohesive interface
- **🔍 Graph Analysis** - Utilities for analyzing workflow structure (root nodes, leaf nodes, connections)
- **⚡ Enhanced Node & Edge Creation** - Auto-generated IDs, consistent styling, and validation
- **🌐 Cross-Component State** - Share workflow state across different components
- **🎯 Selection Management** - Track selected nodes across your application
- **📋 Workflow-Specific Utilities** - Methods designed specifically for workflow patterns

## When to Use

### ✅ Perfect For

- Building node-based editors and workflow builders
- Applications where node layout needs to be automatically determined
- Projects requiring workflow analysis (finding start/end nodes, connections)
- UIs with multiple components that need to interact with the same workflow
- Applications where you want to reduce the boilerplate of working with React Flow

### ❌ Consider Alternatives When

- You need maximum control over every aspect of the implementation
- You have very specific or unusual layout requirements
- You're building a lightweight component with minimal workflow needs
- You're deeply familiar with React Flow and prefer working directly with its API

## Basic Usage

```jsx
import React from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import { useWorkflowBuilder } from 'react-flow-workflow';
import 'reactflow/dist/style.css';

const initialNodes = [
	{
		id: 'node-1',
		position: { x: 0, y: 0 },
		data: { label: 'Start' },
	},
];

const WorkflowEditor = () => {
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		createNode,
		applyLayout,
	} = useWorkflowBuilder({
		initialNodes,
		nodeWidth: 180,
		nodeHeight: 60,
		autoLayout: true,
	});

	const handleAddNode = () => {
		createNode({
			data: { label: 'New Node' },
		});
		// Auto-layout will be applied automatically
	};

	return (
		<div style={{ width: '100%', height: '800px' }}>
			<button onClick={handleAddNode}>Add Node</button>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView>
				<Background />
				<Controls />
			</ReactFlow>
		</div>
	);
};

export default WorkflowEditor;
```

## Working with Edges

### Creating Edges

Creating edges programmatically between nodes:

```jsx
import React from 'react';
import ReactFlow from 'reactflow';
import { useWorkflowBuilder } from 'react-flow-workflow';

export default function EdgeExample() {
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		createNode,
		createEdge,
	} = useWorkflowBuilder();

	const addNodesWithConnection = () => {
		// Create two nodes
		const sourceNode = createNode({
			data: { label: 'Source' },
		});
		const targetNode = createNode({
			data: { label: 'Target' },
		});

		// Connect them with an edge
		createEdge({
			source: sourceNode.id,
			target: targetNode.id,
			// Optional label
			label: 'connects to',
		});
	};

	return (
		<div style={{ height: '500px' }}>
			<button onClick={addNodesWithConnection}>
				Add Connected Nodes
			</button>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView
			/>
		</div>
	);
}
```

### Custom Edge Styles

Customizing edge appearance:

```jsx
import React from 'react';
import ReactFlow, { EdgeTypes } from 'reactflow';
import { useWorkflowBuilder } from 'react-flow-workflow';
import CustomEdge from './CustomEdge';

export default function StyledEdgesExample() {
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		createNode,
		createEdge,
		getDefaultEdgeOptions,
	} = useWorkflowBuilder();

	// Define custom edge types
	const edgeTypes: EdgeTypes = {
		custom: CustomEdge,
	};

	const addCustomEdge = () => {
		// Create two nodes
		const sourceNode = createNode({
			data: { label: 'Source' },
		});
		const targetNode = createNode({
			data: { label: 'Target' },
		});

		// Create a styled edge
		createEdge({
			source: sourceNode.id,
			target: targetNode.id,
			type: 'custom', // Use the custom edge type
			style: {
				stroke: '#ff0072',
				strokeWidth: 2,
			},
			animated: true,
			label: 'Custom Edge',
		});
	};

	const addDashedEdge = () => {
		const sourceNode = createNode({
			data: { label: 'Node A' },
		});
		const targetNode = createNode({
			data: { label: 'Node B' },
		});

		// Create a dashed edge
		createEdge({
			source: sourceNode.id,
			target: targetNode.id,
			style: {
				strokeDasharray: '5,5',
				stroke: '#0041d0',
			},
		});
	};

	return (
		<div style={{ height: '500px' }}>
			<button onClick={addCustomEdge}>
				Add Custom Edge
			</button>
			<button onClick={addDashedEdge}>
				Add Dashed Edge
			</button>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				edgeTypes={edgeTypes}
				defaultEdgeOptions={getDefaultEdgeOptions()}
				fitView
			/>
		</div>
	);
}
```

### Edge Analysis

Analyzing connections and workflow paths:

```jsx
import React, { useState } from 'react';
import ReactFlow from 'reactflow';
import { useWorkflowBuilder } from 'react-flow-workflow';

export default function EdgeAnalysisExample() {
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		getNodeById,
		getIncomingNodes,
		getOutgoingNodes,
		getRootNodes,
		getLeafNodes,
	} = useWorkflowBuilder({
		initialNodes: [
			{
				id: 'a',
				data: { label: 'Start' },
				position: { x: 0, y: 0 },
			},
			{
				id: 'b',
				data: { label: 'Process' },
				position: { x: 100, y: 100 },
			},
			{
				id: 'c',
				data: { label: 'End' },
				position: { x: 200, y: 200 },
			},
		],
		initialEdges: [
			{ id: 'e1', source: 'a', target: 'b' },
			{ id: 'e2', source: 'b', target: 'c' },
		],
	});

	const [analysisResult, setAnalysisResult] = useState('');

	const analyzeWorkflow = () => {
		const rootNodes = getRootNodes();
		const leafNodes = getLeafNodes();
		const middleNodeId = 'b';
		const incoming = getIncomingNodes(middleNodeId);
		const outgoing = getOutgoingNodes(middleNodeId);

		setAnalysisResult(`
      Workflow Analysis:
      - Root nodes: ${rootNodes.map((n) => n.id).join(', ')}
      - Leaf nodes: ${leafNodes.map((n) => n.id).join(', ')}
      - Node '${middleNodeId}' receives from: ${incoming
			.map((n) => n.id)
			.join(', ')}
      - Node '${middleNodeId}' sends to: ${outgoing
			.map((n) => n.id)
			.join(', ')}
    `);
	};

	return (
		<div style={{ height: '500px' }}>
			<button onClick={analyzeWorkflow}>
				Analyze Workflow
			</button>
			<pre>{analysisResult}</pre>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView
			/>
		</div>
	);
}
```

## Advanced Usage

### Multiple Components

Using `useWorkflowBuilder` across multiple components with ReactFlowProvider:

```jsx
// App.tsx
import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useWorkflowBuilder } from 'react-flow-workflow';
import 'reactflow/dist/style.css';
import WorkflowEditor from './WorkflowEditor';
import Toolbar from './Toolbar';
import NodeInspector from './NodeInspector';

export default function App() {
	return (
		<ReactFlowProvider>
			<div className="app-container">
				<Toolbar />
				<div className="editor-container">
					<WorkflowEditor />
					<NodeInspector />
				</div>
			</div>
		</ReactFlowProvider>
	);
}

// Toolbar.tsx with edge creation
import React from 'react';
import { useWorkflowBuilder } from 'react-flow-workflow';

export default function Toolbar() {
	// Access the shared workflow state via ReactFlowProvider
	const {
		createNode,
		createEdge,
		getRootNodes,
		getLeafNodes,
		applyLayout
	} = useWorkflowBuilder({
		useReactFlowInstance: true
	});

	const addNode = () => {
		createNode({
			data: { label: 'New Node' }
		});
	};

	const connectLastNodes = () => {
		// Get the most recent leaf nodes
		const sourceNodes = getRootNodes();
		const targetNodes = getLeafNodes();

		if (sourceNodes.length > 0 && targetNodes.length > 0) {
			// Connect the last root to the first leaf that isn't the same node
			const source = sourceNodes[sourceNodes.length - 1];
			const target = targetNodes.find(node => node.id !== source.id);

			if (target) {
				createEdge({
					source: source.id,
					target: target.id,
					label: 'Auto-connected'
				});
			}
		}
	};

	return (
		<div className="toolbar">
			<button onClick={addNode}>Add Node</button>
			<button onClick={connectLastNodes}>Connect Nodes</button>
			<button onClick={applyLayout}>Re-layout</button>
		</div>
	);
}
```

### Custom Node Types

```jsx
// CustomNode.tsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useWorkflowBuilder } from 'react-flow-workflow';

const CustomNode = ({ id, data }) => {
	const { selectedNodeId } = useWorkflowBuilder({
		useReactFlowInstance: true,
	});

	const isSelected = id === selectedNodeId;

	return (
		<div
			style={{
				padding: '10px',
				borderRadius: '5px',
				border: isSelected
					? '2px solid #1a192b'
					: '1px solid #ddd',
				background: data.color || '#ffffff',
			}}>
			<Handle type="target" position={Position.Top} />
			<div>{data.label}</div>
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
};

export default memo(CustomNode);

// Usage in main component
const nodeTypes = { custom: CustomNode };

// In your flow component:
<ReactFlow
	nodes={nodes}
	edges={edges}
	nodeTypes={nodeTypes}
	// ... other props
/>;
```

### With ReactFlowProvider

```jsx
// WorkflowApp.tsx
import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useWorkflowBuilder } from 'react-flow-workflow';
import WorkflowEditor from './WorkflowEditor';
import EdgeControls from './EdgeControls';

export default function WorkflowApp() {
	return (
		<ReactFlowProvider>
			<div className="workflow-container">
				<WorkflowEditor />
				<EdgeControls />
			</div>
		</ReactFlowProvider>
	);
}

// EdgeControls.tsx - A component for edge operations
import React, { useState } from 'react';
import { useWorkflowBuilder } from 'react-flow-workflow';

export default function EdgeControls() {
	const {
		nodes,
		edges,
		createEdge,
		fitView
	} = useWorkflowBuilder({
		useReactFlowInstance: true
	});

	const [source, setSource] = useState('');
	const [target, setTarget] = useState('');

	const handleCreateEdge = () => {
		if (source && target) {
			createEdge({
				source,
				target,
				label: `${source} → ${target}`,
				animated: true
			});
			fitView();
		}
	};

	return (
		<div className="edge-controls">
			<h3>Connect Nodes</h3>
			<div>
				<select
					value={source}
					onChange={(e) => setSource(e.target.value)}
				>
					<option value="">Select source node</option>
					{nodes.map(node => (
						<option key={node.id} value={node.id}>
							{node.data.label || node.id}
						</option>
					))}
				</select>

				<select
					value={target}
					onChange={(e) => setTarget(e.target.value)}
				>
					<option value="">Select target node</option>
					{nodes.map(node => (
						<option key={node.id} value={node.id}>
							{node.data.label || node.id}
						</option>
					))}
				</select>

				<button
					onClick={handleCreateEdge}
					disabled={!source || !target}
				>
					Connect Nodes
				</button>
			</div>

			<div className="edge-count">
				Total edges: {edges.length}
			</div>
		</div>
	);
}
```

## API Reference

### Hook Options

```typescript
interface UseWorkFlowBuilderProps {
	nodeWidth?: number; // Default: 150
	nodeHeight?: number; // Default: 40
	direction?: 'TB' | 'LR'; // Default: 'TB' (top to bottom)
	initialNodes?: Node[]; // Default: []
	initialEdges?: Edge[]; // Default: []
	autoLayout?: boolean; // Default: true
	useReactFlowInstance?: boolean; // Default: false
}
```

### Return Values

```typescript
// Core React Flow properties
nodes: Node[];
edges: Edge[];
onNodesChange: OnNodesChange;
onEdgesChange: OnEdgesChange;
onConnect: OnConnect;

// Layout functionality
applyLayout: () => { nodes: Node[], edges: Edge[] };
autoLayout: boolean;

// Node operations
createNode: (nodeData: Partial<Node>) => Node;
updateNodeById: (nodeId: string, updates: Partial<Node>) => void;
deleteNode: (nodeId: string) => void;
getNodeById: (nodeId: string) => Node | undefined;

// Edge operations
createEdge: (edgeData: Partial<Edge>) => Edge | null;
getDefaultEdgeOptions: () => object;

// Selection operations
selectedNodeId: string | null;
setSelectedNodeId: (id: string | null) => void;

// Graph analysis
getOutgoingNodes: (nodeId: string) => Node[];
getIncomingNodes: (nodeId: string) => Node[];
getRootNodes: () => Node[];
getLeafNodes: () => Node[];

// React Flow instance (only available if useReactFlowInstance is true)
reactFlowInstance: ReactFlowInstance | null;
fitView: () => boolean;

// Utility
resetCounters: () => void;
```

## Package Information

- **Package Name**: `react-flow-workflow`
- **Version**: 0.1.2
- **License**: MIT
- **Repository**: [GitHub](https://github.com/habbeunik/react-flow-workflow)
- **Issues**: [GitHub Issues](https://github.com/habbeunik/react-flow-workflow/issues)

### Peer Dependencies

- `react`: ^18.0.0
- `react-dom`: ^18.0.0
- `reactflow`: ^11.0.0

## License

MIT
