import type { Meta, StoryObj } from "@storybook/react";
import { NodeCard } from "./node-card";

const meta: Meta<typeof NodeCard> = {
	title: "Editor/NodeCard",
	component: NodeCard,
	argTypes: {
		onEdit: { action: "onEdit" },
	},
};

export default meta;
type Story = StoryObj<typeof NodeCard>;

export const DirectTransition: Story = {
	args: {
		node: {
			id: "node_start",
			audioPath: "audio/intro.mp3",
			transitions: [{ type: "direct", targetId: "node_choice" }],
		},
		isInitial: true,
	},
};

export const ChoiceTransitions: Story = {
	args: {
		node: {
			id: "node_choice",
			audioPath: "audio/branch.mp3",
			transitions: [
				{ type: "choice", targetId: "node_left", buttonText: "Turn Left" },
				{ type: "choice", targetId: "node_right", buttonText: "Turn Right" },
			],
		},
		isInitial: false,
	},
};

export const RandomTransitions: Story = {
	args: {
		node: {
			id: "node_luck",
			audioPath: "audio/gamble.mp3",
			transitions: [
				{ type: "random", targetId: "node_win", weight: 0.3 },
				{ type: "random", targetId: "node_lose", weight: 0.7 },
			],
		},
		isInitial: false,
	},
};

export const EndNode: Story = {
	args: {
		node: {
			id: "node_end",
			audioPath: "audio/credit.mp3",
			transitions: [],
		},
		isInitial: false,
	},
};
