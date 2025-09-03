/* eslint-disable import/no-extraneous-dependencies */
import Dagre from '@dagrejs/dagre';
import { LayoutConfig } from '../../types';
import type { Edge, Node } from 'reactflow';

export function layoutWorkflow({
	nodes,
	edges,
	config,
}: {
	nodes: Node[];
	edges: Edge[];
	config: LayoutConfig;
}): { nodes: Node[]; edges: Edge[] } {
	// Create a new Dagre graph
	const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(
		() => ({})
	);

	// Set graph direction and spacing - keep it simple
	g.setGraph({
		rankdir: config.rankdir ?? 'LR',
		ranksep: config.spacing?.horizontal ?? 150, // Increased horizontal spacing
		nodesep: config.spacing?.vertical ?? 120, // Increased vertical spacing
	});

	// Add nodes to the graph
	nodes.forEach((node) => {
		g.setNode(node.id, {
			width: config?.nodeWidth ?? node.width ?? 200,
			height: config?.nodeHeight ?? node.height ?? 80,
		});
	});

	// Add edges to the graph
	edges.forEach((edge) => {
		g.setEdge(edge.source, edge.target);
	});

	// Calculate the layout
	Dagre.layout(g);

	// Get base positions from Dagre
	const basePositions = new Map();
	nodes.forEach((node) => {
		const position = g.node(node.id);
		basePositions.set(node.id, {
			x: position.x,
			y: position.y,
		});
	});

	// Apply special positioning logic for nodes with specific requirements
	const finalNodes = nodes.map((node) => {
		let finalPosition = basePositions.get(node.id);

		// Handle nodes that need to be positioned after specific nodes
		if (node.data?.afterNodeId) {
			const afterNode = nodes.find(
				(n) => n.id === node.data.afterNodeId
			);
			if (afterNode) {
				const afterPosition = basePositions.get(
					afterNode.id
				);
				if (config.rankdir === 'LR') {
					// Horizontal flow: position to the right
					finalPosition = {
						x:
							afterPosition.x +
							(config.nodeWidth ?? 200) +
							(config.spacing?.horizontal ?? 150),
						y: afterPosition.y,
					};
				} else {
					// Vertical flow: position below, centered horizontally
					finalPosition = {
						x:
							afterPosition.x -
							(config.nodeWidth ?? 200) / 2, // Center horizontally
						y:
							afterPosition.y +
							(config.nodeHeight ?? 80) +
							(config.spacing?.vertical ?? 120),
					};
				}
			}
		}

		// Handle vertical handler positioning
		if (
			node.data?.handlerPosition &&
			config.rankdir === 'TB'
		) {
			const handlerPosition = node.data.handlerPosition;
			// Find the reference node (bottommost for bottom handlers, topmost for top handlers)
			let referenceNode;
			if (handlerPosition === 'top') {
				referenceNode = nodes.reduce((topmost, n) =>
					n.position.y < topmost.position.y ? n : topmost
				);
			} else {
				referenceNode = nodes.reduce((bottommost, n) =>
					n.position.y > bottommost.position.y
						? n
						: bottommost
				);
			}

			if (referenceNode && referenceNode.id !== node.id) {
				const refPosition = basePositions.get(
					referenceNode.id
				);
				if (handlerPosition === 'top') {
					// Position above the reference node
					finalPosition = {
						x:
							refPosition.x - (config.nodeWidth ?? 200) / 2, // Center horizontally
						y:
							refPosition.y -
							(config.nodeHeight ?? 80) -
							(config.spacing?.vertical ?? 120),
					};
				} else {
					// Position below the reference node
					finalPosition = {
						x:
							refPosition.x - (config.nodeWidth ?? 200) / 2, // Center horizontally
						y:
							refPosition.y +
							(config.nodeHeight ?? 80) +
							(config.spacing?.vertical ?? 120),
					};
				}
			}
		}

		return {
			...node,
			position: finalPosition,
		};
	});

	// Return nodes with final positions
	return {
		nodes: finalNodes,
		edges: edges,
	};
}
