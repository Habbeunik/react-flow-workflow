/* eslint-disable no-param-reassign */

import { Edge, Node } from 'reactflow';

interface NodeInfo {
	node: Node;
	visited: boolean;
}

function orderNodesAndEdgesByDescendantProximity(
	nodes: Node[],
	edges: Edge[]
): {
	orderedNodes: Node[];
	orderedEdges: Edge[];
} {
	// Create a map of node information
	const nodeMap = new Map<string, NodeInfo>();

	// Initialize node map
	nodes.forEach((node) => {
		nodeMap.set(node.id, {
			node,
			visited: false,
		});
	});

	// Find trigger nodes (nodes with no incoming edges)
	const triggerNodes = nodes.filter(
		(node) => !edges.some((edge) => edge.target === node.id)
	);

	// Process a node and its outgoing edges
	function processNode(
		nodeId: string,
		orderedNodes: Node[]
	): void {
		const nodeInfo = nodeMap.get(nodeId);
		if (!nodeInfo || nodeInfo.visited) return;

		nodeInfo.visited = true;
		orderedNodes.push(nodeInfo.node);

		// Get all outgoing edges from this node
		const outgoingEdges = edges.filter(
			(edge) => edge.source === nodeId
		);

		// Process each target node
		outgoingEdges.forEach((edge) => {
			const targetNode = nodeMap.get(edge.target);
			if (!targetNode) return;
			processNode(edge.target, orderedNodes);
		});
	}

	// Build ordered nodes starting from trigger nodes
	const orderedNodes: Node[] = [];
	triggerNodes.forEach((triggerNode) => {
		processNode(triggerNode.id, orderedNodes);
	});

	// Add any remaining unvisited nodes (isolated nodes)
	nodes.forEach((node) => {
		const nodeInfo = nodeMap.get(node.id);
		if (nodeInfo && !nodeInfo.visited) {
			processNode(node.id, orderedNodes);
		}
	});

	// Order edges based on node order
	const nodeIndexMap = new Map(
		orderedNodes.map((node, index) => [node.id, index])
	);

	const orderedEdges = edges.slice().sort((a, b) => {
		const aTargetIndex = nodeIndexMap.get(a.target) ?? -1;
		const bTargetIndex = nodeIndexMap.get(b.target) ?? -1;

		// First, compare by target node order
		if (aTargetIndex !== bTargetIndex) {
			return aTargetIndex - bTargetIndex;
		}

		// Fallback to source node order
		const aSourceIndex = nodeIndexMap.get(a.source) ?? -1;
		const bSourceIndex = nodeIndexMap.get(b.source) ?? -1;
		if (aSourceIndex !== bSourceIndex) {
			return aSourceIndex - bSourceIndex;
		}

		// For edges with same source and target, maintain stable ordering by ID
		return a.id.localeCompare(b.id);
	});

	return { orderedNodes, orderedEdges };
}

export { orderNodesAndEdgesByDescendantProximity };
