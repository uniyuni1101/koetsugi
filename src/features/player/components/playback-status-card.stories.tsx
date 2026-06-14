import type { Meta, StoryObj } from "@storybook/react";
import { PlaybackStatusCard } from "./playback-status-card";

const meta: Meta<typeof PlaybackStatusCard> = {
	title: "Player/PlaybackStatusCard",
	component: PlaybackStatusCard,
};

export default meta;
type Story = StoryObj<typeof PlaybackStatusCard>;

export const Playing: Story = {
	args: {
		status: "playing",
		currentNodeId: "node_start",
		currentAudioPath: "tracks/intro.mp3",
	},
};

export const Paused: Story = {
	args: {
		status: "paused",
		currentNodeId: "node_start",
		currentAudioPath: "tracks/intro.mp3",
	},
};

export const Completed: Story = {
	args: {
		status: "completed",
		currentNodeId: "node_end",
		currentAudioPath: "tracks/end.mp3",
	},
};
