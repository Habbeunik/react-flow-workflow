import { createContext } from 'react';
import { Edge, Node } from 'reactflow';

interface WorkFlowContext {
	nodes: Node[];
	edges: Edge[];
	setNodes: (nodes: Node[]) => void;
	setEdges: (edges: Edge[]) => void;
}
export const workFlowContext = createContext<WorkFlowContext>({
	nodes: [],
	edges: [],
	setNodes: () => {},
	setEdges: () => {},
});
