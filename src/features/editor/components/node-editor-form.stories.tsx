import type { Meta, StoryObj } from "@storybook/react";
import { useAudioStore } from "@/stores/use-audio-store";
import type { Workflow } from "@/workflows/types";
import { NodeEditorForm } from "./node-editor-form";

const mockWorkflow: Workflow = {
	workflowId: "narrative-test-id",
	initialNodeId: "node_start",
	nodes: {
		node_start: { id: "node_start", audioPath: "start.mp3", transitions: [] },
		node_left: { id: "node_left", audioPath: "left.mp3", transitions: [] },
		node_right: { id: "node_right", audioPath: "right.mp3", transitions: [] },
		node_end: { id: "node_end", audioPath: "end.mp3", transitions: [] },
	},
};

const meta: Meta<typeof NodeEditorForm> = {
	title: "Editor/NodeEditorForm",
	component: NodeEditorForm,
	argTypes: {
		onSave: { action: "onSave" },
		onCancel: { action: "onCancel" },
	},
	decorators: [
		(Story) => {
			useAudioStore.setState({
				workflow: mockWorkflow,
				filesMap: {
					"start.mp3": new File([], "start.mp3"),
					"left.mp3": new File([], "left.mp3"),
					"right.mp3": new File([], "right.mp3"),
					"end.mp3": new File([], "end.mp3"),
				},
			});
			return <Story />;
		},
	],
};

export default meta;
type Story = StoryObj<typeof NodeEditorForm>;

export const CreateNewNode: Story = {
	args: {
		node: null,
	},
};

export const EditExistingNode: Story = {
	args: {
		node: {
			id: "node_start",
			audioPath: "start.mp3",
			transitions: [
				{
					type: "choice",
					targetId: "node_left",
					buttonText: "Investigate Whispers",
				},
				{
					type: "choice",
					targetId: "node_right",
					buttonText: "Flee from Shadow",
				},
			],
		},
	},
};
