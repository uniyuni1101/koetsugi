import type { Meta, StoryObj } from "@storybook/react";
import { useAudioStore } from "@/stores/use-audio-store";
import { FolderLoader } from "./folder-loader";

const meta: Meta<typeof FolderLoader> = {
	title: "Settings/FolderLoader",
	component: FolderLoader,
};

export default meta;
type Story = StoryObj<typeof FolderLoader>;

export const InitialState: Story = {
	decorators: [
		(Story) => {
			useAudioStore.setState({
				directoryHandle: null,
				filesMap: {},
			});
			return <Story />;
		},
	],
};

export const FolderLoaded: Story = {
	decorators: [
		(Story) => {
			useAudioStore.setState({
				// @ts-expect-error mock folder handle
				directoryHandle: { name: "InteractiveAudioDramaBook_Vol1" },
				filesMap: {
					"workflow.json": new File([], "workflow.json"),
					"start.mp3": new File([], "start.mp3"),
					"path_a.mp3": new File([], "path_a.mp3"),
					"path_b.mp3": new File([], "path_b.mp3"),
				},
			});
			return <Story />;
		},
	],
};
