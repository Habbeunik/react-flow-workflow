import {
	Node,
	Edge,
	NodeTypes,
	EdgeTypes,
	NodeChange,
	EdgeChange,
	Connection,
	ReactFlowInstance,
} from 'reactflow';

export interface LayoutConfig {
	rankdir?: 'TB' | 'LR';
	nodeWidth?: number;
	nodeHeight?: number;
	spacing?: {
		horizontal?: number; // Default: 150 (increased from 80)
		vertical?: number; // Default: 120 (increased from 50)
	};
}

// Re-export React Flow's native types for compatibility
export type {
	Node,
	Edge,
	NodeTypes,
	EdgeTypes,
} from 'reactflow';

// Type aliases for workflow-specific usage - these are exactly the same as ReactFlow types
export type WorkflowNode<TData = any> = Node<TData> & {
	// Explicitly ensure required properties are present
	id: string;
	position: { x: number; y: number };
	data?: TData;
};

// Ensure FlowEdge properly extends ReactFlow's Edge with all required properties
export type WorkflowEdge<TData = any> = Edge<TData> & {
	// Explicitly ensure required properties are present
	id: string;
	source: string;
	target: string;
	data?: TData;
};

export interface UseWorkflowBuilderProps<
	TNodeData = any,
	TEdgeData = any
> {
	nodeWidth?: number;
	nodeHeight?: number;
	direction?: 'TB' | 'LR';
	initialNodes?: WorkflowNode<TNodeData>[];
	initialEdges?: WorkflowEdge<TEdgeData>[];
	useReactFlowInstance?: boolean;
	spacing?: {
		horizontal?: number; // Default: 150
		vertical?: number; // Default: 120
	};
	// Optional custom node and edge types
	nodeTypes?: NodeTypes;
	edgeTypes?: EdgeTypes;
	// Auto-view configuration
	autoCenter?: boolean; // Default: false
	animate?: boolean; // Default: false
	animationDuration?: number; // Default: 300ms
	// Performance options
	enableDragOptimization?: boolean; // Default: true
	layoutDebounceMs?: number; // Default: 100
}

// Generic return type for the workflow builder
export interface WorkflowBuilderReturn<
	TNodeData = any,
	TEdgeData = any
> {
	// Core React Flow properties
	nodes: WorkflowNode<TNodeData>[];
	edges: WorkflowEdge<TEdgeData>[];
	onNodesChange: (changes: NodeChange[]) => void;
	onEdgesChange: (changes: EdgeChange[]) => void;
	onConnect: (connection: Connection) => void;

	// Node operations
	createNode: (
		nodeData: Partial<WorkflowNode<TNodeData>>
	) => WorkflowNode<TNodeData>;
	createNodeAtPosition: (
		nodeData: Partial<WorkflowNode<TNodeData>>,
		relativeTo?: string,
		offset?: { x: number; y: number }
	) => WorkflowNode<TNodeData>;
	createNodeInWorkflow: (
		nodeData: Partial<WorkflowNode<TNodeData>>,
		afterNodeId?: string
	) => WorkflowNode<TNodeData>;
	createNodeWithVerticalHandlers: (
		nodeData: Partial<WorkflowNode<TNodeData>>,
		handlerPosition?: 'top' | 'bottom'
	) => WorkflowNode<TNodeData>;
	updateNodeById: (
		nodeId: string,
		updates: Partial<WorkflowNode<TNodeData>>
	) => void;
	deleteNode: (nodeId: string) => void;
	getNodeById: (
		nodeId: string
	) => WorkflowNode<TNodeData> | undefined;

	// Edge operations
	createEdge: (
		edgeData: Partial<WorkflowEdge<TEdgeData>>
	) => WorkflowEdge<TEdgeData> | null;
	getDefaultEdgeOptions: () => Record<string, any>;

	// Selection operations
	selectedNodeId: string | null;
	setSelectedNodeId: (id: string | null) => void;

	// Graph analysis
	getOutgoingNodes: (
		nodeId: string
	) => WorkflowNode<TNodeData>[];
	getIncomingNodes: (
		nodeId: string
	) => WorkflowNode<TNodeData>[];
	getRootNodes: () => WorkflowNode<TNodeData>[];
	getLeafNodes: () => WorkflowNode<TNodeData>[];

	// React Flow instance
	reactFlowInstance: ReactFlowInstance | null;
	fitView: () => boolean;

	// Utility
	resetCounters: () => void;
}

// Common data interfaces for typical workflow use cases
export interface BasicNodeData {
	label: string;
	description?: string;
	status?: 'pending' | 'running' | 'completed' | 'error';
	metadata?: Record<string, any>;
}

export interface BasicEdgeData {
	label?: string;
	condition?: string;
	weight?: number;
	metadata?: Record<string, any>;
}

// Predefined workflow types for common scenarios
export type BasicWorkflowNode = WorkflowNode<BasicNodeData>;
export type BasicWorkflowEdge = WorkflowEdge<BasicEdgeData>;

// Type for the main hook function
export type UseWorkflowBuilder = <
	TNodeData = any,
	TEdgeData = any
>(
	props?: UseWorkflowBuilderProps<TNodeData, TEdgeData>
) => WorkflowBuilderReturn<TNodeData, TEdgeData>;
