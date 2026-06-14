import type { Meta, StoryObj } from "@storybook/react";
import { useAudioStore } from "@/stores/use-audio-store";
import type { Workflow } from "@/workflows/types";
import { SettingsView } from "./settings-view";

const mockWorkflow: Workflow = {
	workflowId: "settings-flow-narrative",
	initialNodeId: "node_start",
	nodes: {
		node_start: { id: "node_start", audioPath: "start.mp3", transitions: [] },
	},
};

const meta: Meta<typeof SettingsView> = {
	title: "Settings/SettingsView",
	component: SettingsView,
};

export default meta;
type Story = StoryObj<typeof SettingsView>;

export const InitialSettingsState: Story = {
	decorators: [
		(Story) => {
			useAudioStore.setState({
				directoryHandle: null,
				filesMap: {},
				workflow: null,
			});
			return <Story />;
		},
	],
};

export const ActiveWorkflowSettings: Story = {
	decorators: [
		(Story) => {
			useAudioStore.setState({
				// @ts-expect-error mock directory handle
				directoryHandle: { name: "Mystery_In_The_Woods_Audio_Drama" },
				filesMap: {
					"workflow.json": new File([], "workflow.json"),
					"start.mp3": new File([], "start.mp3"),
					"path_a.mp3": new File([], "path_a.mp3"),
					"path_b.mp3": new File([], "path_b.mp3"),
				},
				workflow: mockWorkflow,
			});
			return <Story />;
		},
	],
};
