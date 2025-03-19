import { useCallback, useContext, useState, useEffect, useRef } from 'react';
import {
	Node,
	Edge,
	useNodesState,
	useEdgesState,
	addEdge,
	Connection,
	MarkerType,
	NodeChange,
	EdgeChange,
	applyNodeChanges,
	applyEdgeChanges,
	useReactFlow,
	ReactFlowInstance,
} from 'reactflow';
import { layoutWorkflow } from '../lib/layout';

interface UseWorkFlowBuilderProps {
	nodeWidth?: number;
	nodeHeight?: number;
	direction?: 'TB' | 'LR';
	initialNodes?: Node[];
	initialEdges?: Edge[];
	autoLayout?: boolean;
	useReactFlowInstance?: boolean;
}

let nodeIdCounter = 0;
let edgeIdCounter = 0;

const generateNodeId = (prefix = 'node') => `${prefix}_${++nodeIdCounter}`;
const generateEdgeId = (prefix = 'edge') => `${prefix}_${++edgeIdCounter}`;

/**
 * A hook for building workflow diagrams with React Flow.
 * Provides an easy-to-use API for creating, updating, and managing workflow nodes and edges.
 *
 * This hook can be used in two ways:
 * 1. Standalone - manages its own state for nodes and edges
 * 2. With ReactFlowProvider - can access the React Flow instance for additional functionality
 *
 * To use with ReactFlowProvider, wrap your component with ReactFlowProvider and set useReactFlowInstance to true:
 *
 * ```tsx
 * import { ReactFlowProvider } from 'reactflow';
 *
 * function MyWorkflow() {
 *   const workflow = useWorkflowBuilder({ useReactFlowInstance: true });
 *   // Now workflow.reactFlowInstance is available
 *   return <div>...</div>;
 * }
 *
 * export default function App() {
 *   return (
 *     <ReactFlowProvider>
 *       <MyWorkflow />
 *     </ReactFlowProvider>
 *   );
 * }
 * ```
 */
const useWorkFlowBuilder = ({
	nodeWidth = 150,
	nodeHeight = 40,
	direction = 'TB',
	initialNodes = [],
	initialEdges = [],
	autoLayout = true,
	useReactFlowInstance = false,
}: UseWorkFlowBuilderProps = {}) => {
	// State management for nodes and edges
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

	// Flag to prevent layout loops
	const isLayouting = useRef(false);

	// Try to get React Flow instance if useReactFlowInstance is true
	let reactFlowInstance: ReactFlowInstance | null = null;
	try {
		if (useReactFlowInstance) {
			// This will throw an error if not used within a ReactFlowProvider
			reactFlowInstance = useReactFlow();
		}
	} catch (error) {
		if (useReactFlowInstance) {
			console.warn(
				'useWorkflowBuilder: useReactFlowInstance is true but ReactFlowProvider is not available. ' +
					'Make sure to wrap your component with ReactFlowProvider.'
			);
		}
	}

	// Custom nodes change handler to apply layout after changes
	const handleNodesChange = useCallback(
		(changes: NodeChange[]) => {
			onNodesChange(changes);
		},
		[onNodesChange]
	);

	// Custom edges change handler to apply layout after changes
	const handleEdgesChange = useCallback(
		(changes: EdgeChange[]) => {
			onEdgesChange(changes);
		},
		[onEdgesChange]
	);

	// Apply automatic layout
	const applyLayout = useCallback(() => {
		if (isLayouting.current) return { nodes, edges };

		isLayouting.current = true;
		const layout = layoutWorkflow({
			nodes,
			edges,
			config: {
				rankdir: direction,
				nodeWidth,
				nodeHeight,
			},
		});

		setNodes(layout.nodes);
		setEdges(layout.edges);

		// If we have a React Flow instance, fit view after layout
		if (reactFlowInstance) {
			// Wait for the DOM to update
			setTimeout(() => {
				reactFlowInstance?.fitView({ padding: 0.2 });
			}, 50);
		}

		// Reset the layouting flag after a short delay to ensure all DOM updates have processed
		setTimeout(() => {
			isLayouting.current = false;
		}, 50);

		return { nodes: layout.nodes, edges: layout.edges };
	}, [
		nodes,
		edges,
		direction,
		nodeWidth,
		nodeHeight,
		setNodes,
		setEdges,
		reactFlowInstance,
	]);

	// Auto-layout effect - runs whenever nodes or edges change
	useEffect(() => {
		if (!autoLayout || nodes.length === 0 || isLayouting.current) return;

		// Use requestAnimationFrame to ensure we're not blocking the main thread
		// and to batch multiple changes together
		const timeoutId = setTimeout(() => {
			applyLayout();
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [nodes, edges, autoLayout, applyLayout]);

	// Default edge options
	const getDefaultEdgeOptions = useCallback(
		() => ({
			type: 'default',
			animated: false,
			markerEnd: {
				type: MarkerType.Arrow,
			},
			style: {
				strokeWidth: 1.5,
			},
		}),
		[]
	);

	// Handle connection between nodes
	const onConnect = useCallback(
		(connection: Connection) => {
			setEdges((eds) =>
				addEdge(
					{
						...connection,
						id: generateEdgeId(),
						...getDefaultEdgeOptions(),
					},
					eds
				)
			);
		},
		[getDefaultEdgeOptions, setEdges]
	);

	// Create a new node
	const createNode = useCallback(
		(nodeData: Partial<Node>) => {
			const newNode: Node = {
				id: nodeData.id || generateNodeId(),
				position: nodeData.position || { x: 0, y: 0 },
				data: nodeData.data || { label: `Node ${nodeIdCounter}` },
				type: nodeData.type || 'default',
				...nodeData,
			};

			// If we have a React Flow instance, we can calculate better initial position
			if (reactFlowInstance && !nodeData.position) {
				// Center the new node in the viewport
				const { x, y } = reactFlowInstance.project({
					x: window.innerWidth / 2,
					y: window.innerHeight / 2,
				});
				newNode.position = { x, y };
			}

			setNodes((nds) => [...nds, newNode]);
			return newNode;
		},
		[setNodes, reactFlowInstance]
	);

	// Create a new edge
	const createEdge = useCallback(
		(edgeData: Partial<Edge>) => {
			const newEdge: Edge = {
				id: edgeData.id || generateEdgeId(),
				source: edgeData.source || '',
				target: edgeData.target || '',
				...getDefaultEdgeOptions(),
				...edgeData,
			};

			if (!newEdge.source || !newEdge.target) {
				console.error('Edge must have source and target');
				return null;
			}

			setEdges((eds) => [...eds, newEdge]);
			return newEdge;
		},
		[getDefaultEdgeOptions, setEdges]
	);

	// Update node by ID
	const updateNodeById = useCallback(
		(nodeId: string, updates: Partial<Node>) => {
			setNodes((nds) =>
				nds.map((node) => (node.id === nodeId ? { ...node, ...updates } : node))
			);
		},
		[setNodes]
	);

	// Delete a node and its connected edges
	const deleteNode = useCallback(
		(nodeId: string) => {
			// Remove the node
			setNodes((nds) => nds.filter((node) => node.id !== nodeId));

			// Remove connected edges
			setEdges((eds) =>
				eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
			);
		},
		[setNodes, setEdges]
	);

	// Find node by ID
	const getNodeById = useCallback(
		(nodeId: string) => {
			return nodes.find((node) => node.id === nodeId);
		},
		[nodes]
	);

	// Get connected nodes (outgoing)
	const getOutgoingNodes = useCallback(
		(nodeId: string) => {
			const connectedEdges = edges.filter((edge) => edge.source === nodeId);
			return nodes.filter((node) =>
				connectedEdges.some((edge) => edge.target === node.id)
			);
		},
		[nodes, edges]
	);

	// Get connected nodes (incoming)
	const getIncomingNodes = useCallback(
		(nodeId: string) => {
			const connectedEdges = edges.filter((edge) => edge.target === nodeId);
			return nodes.filter((node) =>
				connectedEdges.some((edge) => edge.source === node.id)
			);
		},
		[nodes, edges]
	);

	// Get root nodes (nodes with no incoming edges)
	const getRootNodes = useCallback(() => {
		return nodes.filter(
			(node) => !edges.some((edge) => edge.target === node.id)
		);
	}, [nodes, edges]);

	// Get leaf nodes (nodes with no outgoing edges)
	const getLeafNodes = useCallback(() => {
		return nodes.filter(
			(node) => !edges.some((edge) => edge.source === node.id)
		);
	}, [nodes, edges]);

	// Fit view - only available if useReactFlowInstance is true
	const fitView = useCallback(() => {
		if (reactFlowInstance) {
			reactFlowInstance.fitView({ padding: 0.2 });
			return true;
		}
		return false;
	}, [reactFlowInstance]);

	return {
		// Core React Flow properties
		nodes,
		edges,
		onNodesChange: handleNodesChange,
		onEdgesChange: handleEdgesChange,
		onConnect,

		// Layout functionality
		applyLayout,

		// Layout configuration
		autoLayout,

		// Node operations
		createNode,
		updateNodeById,
		deleteNode,
		getNodeById,

		// Edge operations
		createEdge,
		getDefaultEdgeOptions,

		// Selection operations
		selectedNodeId,
		setSelectedNodeId,

		// Graph analysis
		getOutgoingNodes,
		getIncomingNodes,
		getRootNodes,
		getLeafNodes,

		// React Flow instance (only available if useReactFlowInstance is true)
		reactFlowInstance,
		fitView,

		// Utility for resetting counters (useful for testing)
		resetCounters: () => {
			nodeIdCounter = 0;
			edgeIdCounter = 0;
		},
	};
};

export default useWorkFlowBuilder;
