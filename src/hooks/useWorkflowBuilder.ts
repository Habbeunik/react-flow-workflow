import { useContext } from 'react';
import { workFlowContext } from '../context';
import { layoutWorkflow } from '../lib/layout';

const useWorkFlowBuilder = () => {
	const { nodes, setNodes, edges, setEdges } = useContext(workFlowContext);
	const layout = layoutWorkflow({
		nodes,
		edges,
		config: {
			rankdir: 'TB',
			nodeWidth: 150,
			nodeHeight: 30,
		},
	});

	return {
		nodes: layout.nodes,
		edges: layout.edges,
	};
};

export default useWorkFlowBuilder;
