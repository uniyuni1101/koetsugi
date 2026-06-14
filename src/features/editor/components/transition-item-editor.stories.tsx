import type { Meta, StoryObj } from "@storybook/react";
import { TransitionItemEditor } from "./transition-item-editor";

const meta: Meta<typeof TransitionItemEditor> = {
	title: "Editor/TransitionItemEditor",
	component: TransitionItemEditor,
	args: {
		allNodeIds: ["node_start", "node_choice_a", "node_choice_b", "node_end"],
		index: 0,
		onUpdate: () => {},
		onRemove: () => {},
	},
};

export default meta;
type Story = StoryObj<typeof TransitionItemEditor>;

export const DirectConnection: Story = {
	args: {
		transition: { type: "direct", targetId: "node_end" },
		transitionType: "direct",
	},
};

export const ChoiceConnection: Story = {
	args: {
		transition: {
			type: "choice",
			targetId: "node_choice_a",
			buttonText: "Go left",
		},
		transitionType: "choice",
	},
};

export const RandomConnection: Story = {
	args: {
		transition: { type: "random", targetId: "node_choice_b", weight: 3 },
		transitionType: "random",
	},
};
