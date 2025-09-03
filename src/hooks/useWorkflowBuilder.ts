import { useCallback, useState, useMemo } from 'react';
import {
	useNodesState,
	useEdgesState,
	addEdge,
	Connection,
	MarkerType,
	NodeChange,
	EdgeChange,
	useReactFlow,
	ReactFlowInstance,
} from 'reactflow';
import { layoutWorkflow } from '../lib/layout';
import {
	UseWorkflowBuilderProps,
	WorkflowBuilderReturn,
} from '../types';
import type { Node, Edge } from 'reactflow';

let nodeIdCounter = 0;
let edgeIdCounter = 0;

const generateNodeId = (prefix = 'node') =>
	`${prefix}_${++nodeIdCounter}`;
const generateEdgeId = (prefix = 'edge') =>
	`${prefix}_${++edgeIdCounter}`;

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
const useWorkflowBuilder = <
	TNodeData = any,
	TEdgeData = any
>({
	nodeWidth = 200,
	nodeHeight = 80,
	direction = 'LR',
	initialNodes = [],
	initialEdges = [],

	useReactFlowInstance = false,
	spacing = { horizontal: 150, vertical: 120 },
}: UseWorkflowBuilderProps<TNodeData, TEdgeData> = {}) => {
	// State management for nodes and edges
	const [nodes, setNodes, onNodesChange] =
		useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] =
		useEdgesState(initialEdges);
	const [selectedNodeId, setSelectedNodeId] = useState<
		string | null
	>(null);

	let reactFlowInstance: ReactFlowInstance | null = null;
	try {
		if (useReactFlowInstance) {
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

	const handleNodesChange = useCallback(
		(changes: NodeChange[]) => {
			// Filter out unnecessary changes that might cause drag issues
			const filteredChanges = changes.filter((change) => {
				// Allow all changes except potentially problematic ones
				if (change.type === 'position' && change.position) {
					// Ensure position changes are valid
					return (
						change.position.x !== undefined &&
						change.position.y !== undefined
					);
				}
				return true;
			});

			onNodesChange(filteredChanges);
		},
		[onNodesChange]
	);

	const handleEdgesChange = useCallback(
		(changes: EdgeChange[]) => {
			onEdgesChange(changes);
		},
		[onEdgesChange]
	);

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

	const createNode = useCallback(
		(nodeData: Partial<Node>) => {
			// Pre-calculate position to prevent flicker
			let calculatedPosition = nodeData.position;

			if (!calculatedPosition) {
				if (nodes.length > 0) {
					// Find the rightmost/bottommost node for proper workflow positioning
					let referenceNode = nodes[0];

					if (direction === 'LR') {
						// For horizontal flow, find the rightmost node
						referenceNode = nodes.reduce(
							(rightmost, node) =>
								node.position.x > rightmost.position.x
									? node
									: rightmost
						);
					} else {
						// For vertical flow, find the bottommost node
						referenceNode = nodes.reduce(
							(bottommost, node) =>
								node.position.y > bottommost.position.y
									? node
									: bottommost
						);
					}

					// Calculate position based on workflow direction
					if (direction === 'LR') {
						// Horizontal flow: place to the right, aligned with workflow level
						calculatedPosition = {
							x:
								referenceNode.position.x +
								(nodeWidth + (spacing?.horizontal ?? 150)),
							y: referenceNode.position.y, // Align with workflow level
						};
					} else {
						// Vertical flow: place below, aligned with workflow level
						calculatedPosition = {
							x: referenceNode.position.x, // Align with workflow level
							y:
								referenceNode.position.y +
								(nodeHeight + (spacing?.vertical ?? 120)),
						};
					}
				} else if (reactFlowInstance) {
					// Center the first node in the viewport
					calculatedPosition = reactFlowInstance.project({
						x: window.innerWidth / 2,
						y: window.innerHeight / 2,
					});
				} else {
					// Fallback position
					calculatedPosition = { x: 100, y: 100 };
				}
			}

			const newNode: Node = {
				id: nodeData.id || generateNodeId(),
				position: calculatedPosition,
				data: nodeData.data || {
					label: `Node ${nodeIdCounter}`,
				},
				type: nodeData.type || 'default',
				...nodeData,
			};

			setNodes((nds) => [...nds, newNode]);
			return newNode;
		},
		[
			setNodes,
			reactFlowInstance,
			nodes,
			direction,
			nodeWidth,
			nodeHeight,
			spacing,
		]
	);

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

	// Calculate layout using useMemo - automatically recalculates when nodes or edges change
	const layoutResult = useMemo(() => {
		if (nodes.length === 0) {
			return { nodes: [], edges: [] };
		}

		return layoutWorkflow({
			nodes,
			edges,
			config: {
				rankdir: direction,
				nodeWidth,
				nodeHeight,
				spacing,
			},
		});
	}, [
		nodes,
		edges,
		direction,
		nodeWidth,
		nodeHeight,
		spacing,
	]);

	// Use the calculated layout for rendering
	const positionedNodes = layoutResult.nodes;
	const positionedEdges = layoutResult.edges;

	// Utility function to create a node with handlers positioned for vertical movement
	const createNodeWithVerticalHandlers = useCallback(
		(
			nodeData: Partial<Node>,
			handlerPosition: 'top' | 'bottom' = 'bottom'
		) => {
			// Create node and let layout engine handle positioning
			return createNode({
				...nodeData,
				// Store the handler position in data for layout engine to use
				data: {
					...(nodeData.data || {}),
					handlerPosition,
				},
			});
		},
		[createNode]
	);

	// Utility function to create a node at a specific position relative to another node
	const createNodeAtPosition = useCallback(
		(
			nodeData: Partial<Node>,
			relativeTo?: string,
			offset?: { x: number; y: number }
		) => {
			let calculatedPosition = nodeData.position;

			if (!calculatedPosition && relativeTo) {
				const referenceNode = nodes.find(
					(n) => n.id === relativeTo
				);
				if (referenceNode) {
					const defaultOffset = offset || { x: 0, y: 0 };
					calculatedPosition = {
						x: referenceNode.position.x + defaultOffset.x,
						y: referenceNode.position.y + defaultOffset.y,
					};
				}
			}

			return createNode({
				...nodeData,
				position: calculatedPosition,
			});
		},
		[createNode, nodes]
	);

	// Utility function to create a node that follows the workflow direction
	const createNodeInWorkflow = useCallback(
		(nodeData: Partial<Node>, afterNodeId?: string) => {
			let calculatedPosition = nodeData.position;

			if (!calculatedPosition) {
				if (afterNodeId) {
					// Position after a specific node
					const afterNode = nodes.find(
						(n) => n.id === afterNodeId
					);
					if (afterNode) {
						if (direction === 'LR') {
							calculatedPosition = {
								x:
									afterNode.position.x +
									(nodeWidth + (spacing?.horizontal ?? 80)),
								y: afterNode.position.y,
							};
						} else {
							calculatedPosition = {
								x: afterNode.position.x,
								y:
									afterNode.position.y +
									(nodeHeight + (spacing?.vertical ?? 50)),
							};
						}
					}
				} else {
					// Position at the end of the workflow
					if (nodes.length > 0) {
						if (direction === 'LR') {
							const rightmostNode = nodes.reduce(
								(rightmost, node) =>
									node.position.x > rightmost.position.x
										? node
										: rightmost
							);
							calculatedPosition = {
								x:
									rightmostNode.position.x +
									(nodeWidth + (spacing?.horizontal ?? 80)),
								y: rightmostNode.position.y,
							};
						} else {
							const bottommostNode = nodes.reduce(
								(bottommost, node) =>
									node.position.y > bottommost.position.y
										? node
										: bottommost
							);
							calculatedPosition = {
								x: bottommostNode.position.x,
								y:
									bottommostNode.position.y +
									(nodeHeight + (spacing?.vertical ?? 50)),
							};
						}
					}
				}
			}

			return createNode({
				...nodeData,
				position: calculatedPosition,
			});
		},
		[
			createNode,
			nodes,
			direction,
			nodeWidth,
			nodeHeight,
			spacing,
		]
	);

	const updateNodeById = useCallback(
		(nodeId: string, updates: Partial<Node>) => {
			setNodes((nds) =>
				nds.map((node) =>
					node.id === nodeId
						? { ...node, ...updates }
						: node
				)
			);
		},
		[setNodes]
	);

	const deleteNode = useCallback(
		(nodeId: string) => {
			setNodes((nds) =>
				nds.filter((node) => node.id !== nodeId)
			);

			setEdges((eds) =>
				eds.filter(
					(edge) =>
						edge.source !== nodeId && edge.target !== nodeId
				)
			);
		},
		[setNodes, setEdges]
	);

	const getNodeById = useCallback(
		(nodeId: string) => {
			return nodes.find((node) => node.id === nodeId);
		},
		[nodes]
	);

	const getOutgoingNodes = useCallback(
		(nodeId: string) => {
			const connectedEdges = edges.filter(
				(edge) => edge.source === nodeId
			);
			return nodes.filter((node) =>
				connectedEdges.some(
					(edge) => edge.target === node.id
				)
			);
		},
		[nodes, edges]
	);

	const getIncomingNodes = useCallback(
		(nodeId: string) => {
			const connectedEdges = edges.filter(
				(edge) => edge.target === nodeId
			);
			return nodes.filter((node) =>
				connectedEdges.some(
					(edge) => edge.source === node.id
				)
			);
		},
		[nodes, edges]
	);

	const getRootNodes = useCallback(() => {
		return nodes.filter(
			(node) =>
				!edges.some((edge) => edge.target === node.id)
		);
	}, [nodes, edges]);

	const getLeafNodes = useCallback(() => {
		return nodes.filter(
			(node) =>
				!edges.some((edge) => edge.source === node.id)
		);
	}, [nodes, edges]);

	const fitView = useCallback(() => {
		if (reactFlowInstance) {
			reactFlowInstance.fitView({ padding: 0.2 });
			return true;
		}
		return false;
	}, [reactFlowInstance]);

	const result: WorkflowBuilderReturn<
		TNodeData,
		TEdgeData
	> = {
		nodes: positionedNodes,
		edges: positionedEdges,
		onNodesChange: handleNodesChange,
		onEdgesChange: handleEdgesChange,
		onConnect,

		createNode,
		createNodeAtPosition,
		createNodeInWorkflow,
		createNodeWithVerticalHandlers,
		updateNodeById,
		deleteNode,
		getNodeById,

		createEdge,
		getDefaultEdgeOptions,

		selectedNodeId,
		setSelectedNodeId,

		getOutgoingNodes,
		getIncomingNodes,
		getRootNodes,
		getLeafNodes,

		reactFlowInstance,
		fitView,

		resetCounters: () => {
			nodeIdCounter = 0;
			edgeIdCounter = 0;
		},
	};

	return result;
};

export default useWorkflowBuilder;
