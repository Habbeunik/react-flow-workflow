// Test file to demonstrate the new vertical handler functionality and improved spacing
import React from 'react';
import ReactFlow from 'reactflow';
import { useWorkflowBuilder } from './dist/index.js';
import 'reactflow/dist/style.css';

function TestVerticalHandlers() {
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		createNode,
		createNodeWithVerticalHandlers,
		createNodeInWorkflow,
	} = useWorkflowBuilder({
		direction: 'TB', // Top to bottom flow
		spacing: {
			horizontal: 150, // Increased horizontal spacing
			vertical: 120, // Increased vertical spacing
		},
		autoLayout: false,
	});

	const addTopHandler = () => {
		createNodeWithVerticalHandlers(
			{ data: { label: 'Top Handler' } },
			'top'
		);
	};

	const addBottomHandler = () => {
		createNodeWithVerticalHandlers(
			{ data: { label: 'Bottom Handler' } },
			'bottom'
		);
	};

	const addStandardNode = () => {
		createNode({
			data: { label: 'Standard Node' },
		});
	};

	const addNodeAfter = () => {
		if (nodes.length > 0) {
			const lastNode = nodes[nodes.length - 1];
			createNodeInWorkflow(
				{ data: { label: 'After Node' } },
				lastNode.id
			);
		}
	};

	return (
		<div style={{ width: '100%', height: '800px' }}>
			<div
				style={{
					padding: '10px',
					borderBottom: '1px solid #ccc',
				}}>
				<button
					onClick={addTopHandler}
					style={{ margin: '5px' }}>
					Add Top Handler
				</button>
				<button
					onClick={addBottomHandler}
					style={{ margin: '5px' }}>
					Add Bottom Handler
				</button>
				<button
					onClick={addStandardNode}
					style={{ margin: '5px' }}>
					Add Standard Node
				</button>
				<button
					onClick={addNodeAfter}
					style={{ margin: '5px' }}>
					Add Node After
				</button>
			</div>

			<div
				style={{
					fontSize: '12px',
					padding: '10px',
					backgroundColor: '#f5f5f5',
				}}>
				<strong>New Features:</strong>
				<br />
				• Vertical handlers positioned at top/bottom for TB
				direction
				<br />
				• Increased spacing: horizontal 150px, vertical
				120px
				<br />• Better node positioning for workflow clarity
			</div>

			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView
				style={{ backgroundColor: '#fafafa' }}
			/>
		</div>
	);
}

export default TestVerticalHandlers;
