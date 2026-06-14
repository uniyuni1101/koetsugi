import type { Meta, StoryObj } from "@storybook/react";
import { useAudioStore } from "@/stores/use-audio-store";
import type { Workflow } from "@/workflows/types";
import { JumpNodeDrawer } from "./jump-node-drawer";

const mockWorkflow: Workflow = {
	workflowId: "test-workflow",
	initialNodeId: "node_start",
	nodes: {
		node_start: { id: "node_start", audioPath: "intro.mp3", transitions: [] },
		node_branch: {
			id: "node_branch",
			audioPath: "branch.mp3",
			transitions: [],
		},
		node_cave: { id: "node_cave", audioPath: "cave.mp3", transitions: [] },
		node_lake: { id: "node_lake", audioPath: "lake.mp3", transitions: [] },
	},
};

const meta: Meta<typeof JumpNodeDrawer> = {
	title: "Player/JumpNodeDrawer",
	component: JumpNodeDrawer,
};

export default meta;
type Story = StoryObj<typeof JumpNodeDrawer>;

export const Default: Story = {
	decorators: [
		(Story) => {
			useAudioStore.setState({
				workflow: mockWorkflow,
				engineState: {
					status: "playing",
					currentNodeId: "node_start",
					currentAudioPath: "intro.mp3",
					choices: [],
					history: ["node_start"],
				},
			});
			return <Story />;
		},
	],
};
