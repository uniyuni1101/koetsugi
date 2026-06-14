import type { Meta, StoryObj } from "@storybook/react";
import { useAudioStore } from "@/stores/use-audio-store";
import { ChoiceButtons } from "./choice-buttons";

const meta: Meta<typeof ChoiceButtons> = {
	title: "Player/ChoiceButtons",
	component: ChoiceButtons,
};

export default meta;
type Story = StoryObj<typeof ChoiceButtons>;

export const TwoChoices: Story = {
	decorators: [
		(Story) => {
			useAudioStore.setState({
				engineState: {
					status: "waitingForChoice",
					currentNodeId: "branch_node",
					currentAudioPath: "branch.mp3",
					choices: [
						{
							type: "choice",
							targetId: "node_left",
							buttonText: "Investigate Forest Path",
						},
						{
							type: "choice",
							targetId: "node_right",
							buttonText: "Stay Near the Camp",
						},
					],
					history: ["start"],
				},
			});
			return <Story />;
		},
	],
};

export const MultipleChoices: Story = {
	decorators: [
		(Story) => {
			useAudioStore.setState({
				engineState: {
					status: "waitingForChoice",
					currentNodeId: "branch_node",
					currentAudioPath: "branch.mp3",
					choices: [
						{
							type: "choice",
							targetId: "node_left",
							buttonText: "Attack Golem",
						},
						{
							type: "choice",
							targetId: "node_right",
							buttonText: "Sneak Around",
						},
						{
							type: "choice",
							targetId: "node_talk",
							buttonText: "Initiate Conversation",
						},
						{
							type: "choice",
							targetId: "node_run",
							buttonText: "Flee to Safety",
						},
					],
					history: ["start"],
				},
			});
			return <Story />;
		},
	],
};
