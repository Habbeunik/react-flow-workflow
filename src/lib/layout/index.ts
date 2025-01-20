/* eslint-disable import/no-extraneous-dependencies */
import Dagre from '@dagrejs/dagre';
import { Edge, Node } from 'reactflow';

interface LayoutConfig {
	rankdir?: 'TB' | 'LR';
	nodeWidth: number;
	nodeHeight: number;
	// nodePadding: number;
	// edgePadding: number;
}
export function layoutWorkflow({
	nodes,
	edges,
	config,
}: {
	nodes: Node[];
	edges: Edge[];
	config: LayoutConfig;
}): { nodes: Node[]; edges: Edge[] } {
	const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
	g.setGraph({ rankdir: config.rankdir ?? 'LR' });

	nodes.forEach((node) => {
		g.setNode(node.id, {
			...node,
			width: config?.nodeWidth,
			height: config?.nodeHeight,
		});
		edges.forEach((edge) => g.setEdge(edge.source, edge.target));
	});

	Dagre.layout(g);

	return {
		nodes: nodes.map((node) => {
			const position = g.node(node.id);
			// We are shifting the dagre node position (anchor=center center) to the top left
			// so it matches the React Flow node anchor point (top left).

			return {
				...node,
				position: {
					x: position.x - (config?.nodeWidth || 0) / 2,
					y: position.y,
				},
			};
		}),
		edges,
	};
}
