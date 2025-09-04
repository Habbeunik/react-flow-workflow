import React, { useState } from 'react';
import ReactFlow, { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowBuilder } from './dist/index.js';

// Test component to demonstrate new features
function PerformanceTest() {
	const [nodeCount, setNodeCount] = useState(5);

	// Test with performance optimizations enabled
	const workflowOptimized = useWorkflowBuilder({
		direction: 'TB',
		spacing: { horizontal: 150, vertical: 120 },
		autoCenter: true,
		// animate: true, // Enabled by default
		animationDuration: 300, // Custom duration
		useReactFlowInstance: true,
	});

	// Test without optimizations for comparison
	const workflowBasic = useWorkflowBuilder({
		direction: 'TB',
		spacing: { horizontal: 150, vertical: 120 },
		autoCenter: false,
		animate: false, // Disable animation for comparison
		useReactFlowInstance: true,
	});

	const addNodes = (workflow, count = 5) => {
		for (let i = 0; i < count; i++) {
			workflow.createNode({
				id: `test-${Date.now()}-${i}`,
				type: 'default',
				position: { x: 0, y: 0 },
				data: { label: `Node ${i + 1}` },
			});
		}
	};

	const addNodesWithConnections = (workflow, count = 5) => {
		const nodes = [];
		for (let i = 0; i < count; i++) {
			const node = workflow.createNode({
				id: `connected-${Date.now()}-${i}`,
				type: 'default',
				position: { x: 0, y: 0 },
				data: { label: `Connected ${i + 1}` },
			});
			nodes.push(node);

			// Connect to previous node
			if (i > 0) {
				workflow.addEdge({
					id: `edge-${Date.now()}-${i}`,
					source: nodes[i - 1].id,
					target: node.id,
					type: 'default',
				});
			}
		}
	};

	return (
		<div
			style={{
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
			}}>
			<div
				style={{
					padding: '20px',
					borderBottom: '1px solid #ccc',
				}}>
				<h2>Performance Features Test</h2>

				<div style={{ marginBottom: '20px' }}>
					<h3>
						Optimized Workflow (with performance features)
					</h3>
					<button
						onClick={() =>
							addNodes(workflowOptimized, nodeCount)
						}>
						Add {nodeCount} Nodes (Optimized)
					</button>
					<button
						onClick={() =>
							addNodesWithConnections(
								workflowOptimized,
								nodeCount
							)
						}>
						Add {nodeCount} Connected Nodes
					</button>
					<button
						onClick={() => workflowOptimized.fitView()}>
						Manual Fit View
					</button>
				</div>

				<div style={{ marginBottom: '20px' }}>
					<h3>Basic Workflow (without optimizations)</h3>
					<button
						onClick={() =>
							addNodes(workflowBasic, nodeCount)
						}>
						Add {nodeCount} Nodes (Basic)
					</button>
					<button
						onClick={() =>
							addNodesWithConnections(
								workflowBasic,
								nodeCount
							)
						}>
						Add {nodeCount} Connected Nodes
					</button>
					<button onClick={() => workflowBasic.fitView()}>
						Manual Fit View
					</button>
				</div>

				<div>
					<label>
						Nodes to add:
						<input
							type="number"
							value={nodeCount}
							onChange={(e) =>
								setNodeCount(parseInt(e.target.value) || 1)
							}
							min="1"
							max="50"
							style={{ marginLeft: '10px', width: '60px' }}
						/>
					</label>
				</div>

				<div
					style={{
						marginTop: '20px',
						fontSize: '14px',
						color: '#666',
					}}>
					<p>
						<strong>Performance Features:</strong>
					</p>
					<ul>
						<li>
							✅ Layout-first architecture (no manual
							positioning)
						</li>
						<li>
							✅ Auto-center workflow on last added node
						</li>
						<li>
							✅ Smooth animations (300ms duration by
							default)
						</li>
					</ul>

					<p>
						<strong>Test Instructions:</strong>
					</p>
					<ol>
						<li>Add nodes to both workflows</li>
						<li>
							Add many nodes to see auto-center on last node
							in action
						</li>
						<li>
							Notice the smooth animations in the optimized
							version
						</li>
					</ol>
				</div>
			</div>

			<div style={{ flex: 1, display: 'flex' }}>
				<div
					style={{
						flex: 1,
						borderRight: '1px solid #ccc',
					}}>
					<h4
						style={{
							textAlign: 'center',
							margin: '10px 0',
						}}>
						Optimized Workflow
					</h4>
					<ReactFlow
						nodes={workflowOptimized.nodes}
						edges={workflowOptimized.edges}
						onNodesChange={workflowOptimized.onNodesChange}
						onEdgesChange={workflowOptimized.onEdgesChange}
						onConnect={workflowOptimized.onConnect}
						nodeTypes={workflowOptimized.nodeTypes}
						edgeTypes={workflowOptimized.edgeTypes}
						fitView
						attributionPosition="bottom-left"
					/>
				</div>

				<div style={{ flex: 1 }}>
					<h4
						style={{
							textAlign: 'center',
							margin: '10px 0',
						}}>
						Basic Workflow
					</h4>
					<ReactFlow
						nodes={workflowBasic.nodes}
						edges={workflowBasic.edges}
						onNodesChange={workflowBasic.onNodesChange}
						onEdgesChange={workflowBasic.onEdgesChange}
						onConnect={workflowBasic.onConnect}
						nodeTypes={workflowBasic.nodeTypes}
						edgeTypes={workflowBasic.edgeTypes}
						fitView
						attributionPosition="bottom-left"
					/>
				</div>
			</div>
		</div>
	);
}

export default function App() {
	return (
		<ReactFlowProvider>
			<PerformanceTest />
		</ReactFlowProvider>
	);
}
