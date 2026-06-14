import type { Meta, StoryObj } from "@storybook/react";
import { useAudioStore } from "@/stores/use-audio-store";
import { PlayerControls } from "./player-controls";

const meta: Meta<typeof PlayerControls> = {
	title: "Player/PlayerControls",
	component: PlayerControls,
};

export default meta;
type Story = StoryObj<typeof PlayerControls>;

export const PlayingState: Story = {
	decorators: [
		(Story) => {
			useAudioStore.setState({
				engineState: {
					status: "playing",
					currentNodeId: "node_narrator",
					currentAudioPath: "narrator.mp3",
					choices: [],
					history: ["start"],
				},
				audioCurrentTime: 12.5,
				audioDuration: 30.0,
			});
			return <Story />;
		},
	],
};

export const PausedState: Story = {
	decorators: [
		(Story) => {
			useAudioStore.setState({
				engineState: {
					status: "paused",
					currentNodeId: "node_narrator",
					currentAudioPath: "narrator.mp3",
					choices: [],
					history: ["start"],
				},
				audioCurrentTime: 5.2,
				audioDuration: 30.0,
			});
			return <Story />;
		},
	],
};
