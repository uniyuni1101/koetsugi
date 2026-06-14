import { describe, expect, it, vi } from "vitest";
import { WorkflowEngine } from "../engine";
import type { Workflow } from "../types";

const testWorkflow: Workflow = {
	workflowId: "test-wf",
	initialNodeId: "node-start",
	nodes: {
		"node-start": {
			id: "node-start",
			audioPath: "tracks/start.mp3",
			transitions: [{ type: "direct", targetId: "node-branch" }],
		},
		"node-branch": {
			id: "node-branch",
			audioPath: "tracks/branch.mp3",
			transitions: [
				{ type: "choice", targetId: "node-choice-1", buttonText: "Path 1" },
				{ type: "choice", targetId: "node-choice-2", buttonText: "Path 2" },
			],
		},
		"node-choice-1": {
			id: "node-choice-1",
			audioPath: "tracks/choice1.mp3",
			transitions: [{ type: "random", targetId: "node-end", weight: 1 }],
		},
		"node-choice-2": {
			id: "node-choice-2",
			audioPath: "tracks/choice2.mp3",
			transitions: [], // terminal
		},
		"node-end": {
			id: "node-end",
			audioPath: "tracks/end.mp3",
			transitions: [], // terminal
		},
	},
};

describe("WorkflowEngine", () => {
	it("should flow through a direct transition, choice transition, and random transition", () => {
		const engine = new WorkflowEngine(testWorkflow);

		// Initial state
		expect(engine.state.status).toBe("idle");
		expect(engine.state.currentNodeId).toBeNull();
		expect(engine.state.currentAudioPath).toBeNull();

		// Start
		engine.start();
		expect(engine.state.status).toBe("playing");
		expect(engine.state.currentNodeId).toBe("node-start");
		expect(engine.state.currentAudioPath).toBe("tracks/start.mp3");
		expect(engine.state.history).toEqual(["node-start"]);

		// Pause
		engine.pause();
		expect(engine.state.status).toBe("paused");

		// Resume play
		engine.play();
		expect(engine.state.status).toBe("playing");

		// Audio ends -> direct transition to node-branch
		engine.audioEnded();
		expect(engine.state.status).toBe("playing");
		expect(engine.state.currentNodeId).toBe("node-branch");
		expect(engine.state.currentAudioPath).toBe("tracks/branch.mp3");
		expect(engine.state.history).toEqual(["node-start", "node-branch"]);

		// Audio ends -> choice transition -> should wait for choice
		engine.audioEnded();
		expect(engine.state.status).toBe("waitingForChoice");
		expect(engine.state.choices).toHaveLength(2);
		expect(engine.state.choices[0].buttonText).toBe("Path 1");
		expect(engine.state.choices[1].buttonText).toBe("Path 2");

		// Select Path 1
		engine.selectChoice("node-choice-1");
		expect(engine.state.status).toBe("playing");
		expect(engine.state.currentNodeId).toBe("node-choice-1");
		expect(engine.state.currentAudioPath).toBe("tracks/choice1.mp3");
		expect(engine.state.history).toEqual([
			"node-start",
			"node-branch",
			"node-choice-1",
		]);

		// Audio ends -> random transition -> to node-end (since weight is 100% on node-end)
		engine.audioEnded();
		expect(engine.state.status).toBe("playing");
		expect(engine.state.currentNodeId).toBe("node-end");

		// Audio ends -> completed (no transitions)
		engine.audioEnded();
		expect(engine.state.status).toBe("completed");
	});

	it("should allow starting/resuming from a specific node ID", () => {
		const engine = new WorkflowEngine(testWorkflow);

		engine.start("node-choice-2");
		expect(engine.state.status).toBe("playing");
		expect(engine.state.currentNodeId).toBe("node-choice-2");
		expect(engine.state.currentAudioPath).toBe("tracks/choice2.mp3");
		expect(engine.state.history).toEqual(["node-choice-2"]);

		engine.audioEnded();
		expect(engine.state.status).toBe("completed");
	});

	it("should call subscribers on state changes", () => {
		const engine = new WorkflowEngine(testWorkflow);
		const listener = vi.fn();
		const { unsubscribe } = engine.subscribe(listener);

		engine.start();
		expect(listener).toHaveBeenCalled();
		const lastCallState =
			listener.mock.calls[listener.mock.calls.length - 1][0];
		expect(lastCallState.currentNodeId).toBe("node-start");

		unsubscribe();
		listener.mockClear();

		engine.pause();
		expect(listener).not.toHaveBeenCalled();
	});

	it("should throw an error on invalid choice selection", () => {
		const engine = new WorkflowEngine(testWorkflow);
		engine.start();

		// Currently playing node-start, which is direct, not choice.
		expect(() => engine.selectChoice("node-branch")).toThrow();
	});
});
