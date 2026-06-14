import type { Meta, StoryObj } from "@storybook/react";
import { useAudioStore } from "@/stores/use-audio-store";
import type { Workflow } from "@/workflows/types";
import { PlayerView } from "./player-view";

const mockWorkflow: Workflow = {
	workflowId: "player-stories-workflow",
	initialNodeId: "node_start",
	nodes: {
		node_start: { id: "node_start", audioPath: "intro.mp3", transitions: [] },
	},
};

const meta: Meta<typeof PlayerView> = {
	title: "Player/PlayerView",
	component: PlayerView,
};

export default meta;
type Story = StoryObj<typeof PlayerView>;

export const NoDirectory: Story = {
	decorators: [
		(Story) => {
			useAudioStore.setState({
				workflow: null,
				engineState: null,
			});
			return <Story />;
		},
	],
};

export const StartPrompt: Story = {
	decorators: [
		(Story) => {
			useAudioStore.setState({
				workflow: mockWorkflow,
				engineState: {
					status: "idle",
					currentNodeId: null,
					currentAudioPath: null,
					choices: [],
					history: [],
				},
			});
			return <Story />;
		},
	],
};

export const PlayingNarrative: Story = {
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
				filesMap: {
					"intro.mp3": new File([], "intro.mp3"),
				},
				audioCurrentTime: 8.5,
				audioDuration: 30.0,
			});
			return <Story />;
		},
	],
};

export const ChoicesOverlay: Story = {
	decorators: [
		(Story) => {
			useAudioStore.setState({
				workflow: mockWorkflow,
				engineState: {
					status: "waitingForChoice",
					currentNodeId: "node_branch",
					currentAudioPath: "branch.mp3",
					choices: [
						{
							type: "choice",
							targetId: "node_cave",
							buttonText: "Enter the Cave",
						},
						{
							type: "choice",
							targetId: "node_lake",
							buttonText: "Swim Across Lake",
						},
					],
					history: ["node_start", "node_branch"],
				},
				filesMap: {
					"intro.mp3": new File([], "intro.mp3"),
					"branch.mp3": new File([], "branch.mp3"),
				},
			});
			return <Story />;
		},
	],
};
