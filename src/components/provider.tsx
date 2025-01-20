import React, { useState } from 'react';
import { Edge, Node } from 'reactflow';
import { workFlowContext } from '../context';

interface WorkflowProviderProps {
	children: React.ReactNode;
	initialNodes?: Node[];
	initialEdges?: Edge[];
}
const WorkfFlowProvider: React.FC<WorkflowProviderProps> = ({
	children,
	initialEdges = [],
	initialNodes = [],
}) => {
	const [nodes, setNodes] = useState<Node[]>(initialNodes);
	const [edges, setEdges] = useState<Edge[]>(initialEdges);

	return (
		<workFlowContext.Provider value={{ nodes, setNodes, edges, setEdges }}>
			{children}
		</workFlowContext.Provider>
	);
};

export default WorkfFlowProvider;
