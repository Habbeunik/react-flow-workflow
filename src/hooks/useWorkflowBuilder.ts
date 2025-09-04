import {
	useCallback,
	useState,
	useMemo,
	useEffect,
} from 'react';
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
	autoCenter = false,
	animate = true,
	animationDuration = 300,
}: UseWorkflowBuilderProps<TNodeData, TEdgeData> = {}) => {
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
			// Filter out unnecessary changes that might cause issues
			const filteredChanges = changes.filter((change) => {
				if (change.type === 'position' && change.position) {
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
			// Create node with temporary position - layout engine will handle positioning
			const newNode: Node = {
				id: nodeData.id || generateNodeId(),
				position: nodeData.position || { x: 0, y: 0 }, // Temporary position
				data: nodeData.data || {
					label: `Node ${nodeIdCounter}`,
				},
				type: nodeData.type || 'default',
				...nodeData,
			};

			setNodes((nds) => [...nds, newNode]);
			return newNode;
		},
		[setNodes]
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

	const positionedNodes = layoutResult.nodes;
	const positionedEdges = layoutResult.edges;

	const createNodeWithVerticalHandlers = useCallback(
		(
			nodeData: Partial<Node>,
			handlerPosition: 'top' | 'bottom' = 'bottom'
		) => {
			return createNode({
				...nodeData,
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
			// Create node and let layout engine handle positioning
			// Pass relative positioning info in data for layout engine to use
			return createNode({
				...nodeData,
				data: {
					...(nodeData.data || {}),
					relativeTo,
					offset,
				},
			});
		},
		[createNode]
	);

	const createNodeInWorkflow = useCallback(
		(nodeData: Partial<Node>, afterNodeId?: string) => {
			return createNode({
				...nodeData,
				data: {
					...(nodeData.data || {}),
					afterNodeId,
				},
			});
		},
		[createNode]
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

	useEffect(() => {
		if (!reactFlowInstance || positionedNodes.length === 0)
			return;

		if (autoCenter) {
			const lastNode =
				positionedNodes[positionedNodes.length - 1];
			if (lastNode) {
				const centerX = lastNode.position.x;
				const centerY = lastNode.position.y;

				if (animate) {
					reactFlowInstance.setCenter(centerX, centerY, {
						duration: animationDuration,
					});
				} else {
					reactFlowInstance.setCenter(centerX, centerY);
				}
			}
		}
	}, [
		positionedNodes.length,
		reactFlowInstance,
		autoCenter,
		animate,
		animationDuration,
	]);

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
