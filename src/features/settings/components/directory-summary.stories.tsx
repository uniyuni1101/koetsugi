import type { Meta, StoryObj } from "@storybook/react";
import { DirectorySummary } from "./directory-summary";

const meta: Meta<typeof DirectorySummary> = {
	title: "Settings/DirectorySummary",
	component: DirectorySummary,
};

export default meta;
type Story = StoryObj<typeof DirectorySummary>;

export const LoadedDirectory: Story = {
	args: {
		directoryName: "my-audio-project",
		filesCount: 15,
	},
};

export const LoadedInMemory: Story = {
	args: {
		directoryName: null,
		filesCount: 8,
	},
};
