import type { Meta, StoryObj } from "@storybook/react";
import { useAudioStore } from "@/stores/use-audio-store";
import type { Workflow } from "@/workflows/types";
import { EditorView } from "./editor-view";

const mockWorkflow: Workflow = {
	workflowId: "editor-stories-narrative",
	initialNodeId: "node_intro",
	nodes: {
		node_intro: {
			id: "node_intro",
			audioPath: "audio/intro.mp3",
			transitions: [
				{ type: "choice", targetId: "node_forest", buttonText: "Enter Forest" },
				{ type: "choice", targetId: "node_cave", buttonText: "Enter Cave" },
			],
		},
		node_forest: {
			id: "node_forest",
			audioPath: "audio/forest.mp3",
			transitions: [{ type: "direct", targetId: "node_end" }],
		},
		node_cave: {
			id: "node_cave",
			audioPath: "audio/cave.mp3",
			transitions: [{ type: "direct", targetId: "node_end" }],
		},
		node_end: {
			id: "node_end",
			audioPath: "audio/credits.mp3",
			transitions: [],
		},
	},
};

const meta: Meta<typeof EditorView> = {
	title: "Editor/EditorView",
	component: EditorView,
};

export default meta;
type Story = StoryObj<typeof EditorView>;

export const NoWorkspaceLoaded: Story = {
	decorators: [
		(Story) => {
			useAudioStore.setState({
				workflow: null,
				filesMap: {},
			});
			return <Story />;
		},
	],
};

export const ActiveWorkspace: Story = {
	decorators: [
		(Story) => {
			useAudioStore.setState({
				workflow: mockWorkflow,
				filesMap: {
					"audio/intro.mp3": new File([], "intro.mp3"),
					"audio/forest.mp3": new File([], "forest.mp3"),
					"audio/cave.mp3": new File([], "cave.mp3"),
					"audio/credits.mp3": new File([], "credits.mp3"),
				},
			});
			return <Story />;
		},
	],
};
