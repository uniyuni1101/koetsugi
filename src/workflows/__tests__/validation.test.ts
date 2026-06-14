import { describe, expect, it } from "vitest";
import { validateWorkflow } from "../validation";

describe("validateWorkflow", () => {
	it("should validate a correct workflow JSON", () => {
		const validJson = {
			workflowId: "test-wf-1",
			initialNodeId: "node-1",
			nodes: {
				"node-1": {
					id: "node-1",
					audioPath: "audio/track1.mp3",
					transitions: [
						{ type: "choice", targetId: "node-2", buttonText: "Yes" },
						{ type: "choice", targetId: "node-3", buttonText: "No" },
					],
				},
				"node-2": {
					id: "node-2",
					audioPath: "audio/track2.mp3",
					transitions: [{ type: "direct", targetId: "node-3" }],
				},
				"node-3": {
					id: "node-3",
					audioPath: "audio/track3.mp3",
					transitions: [],
				},
			},
		};

		const result = validateWorkflow(validJson);
		expect(result.isValid).toBe(true);
		expect(result.errors).toHaveLength(0);
		expect(result.workflow).toBeDefined();
	});

	it("should fail if schema structure is invalid", () => {
		const invalidJson = {
			workflowId: "", // invalid or empty
			initialNodeId: "node-1",
			nodes: {
				"node-1": {
					id: "node-1",
					audioPath: "", // invalid empty audioPath
					transitions: [
						{ type: "choice", targetId: "", buttonText: "Yes" }, // invalid targetId
					],
				},
			},
		};

		const result = validateWorkflow(invalidJson);
		expect(result.isValid).toBe(false);
		expect(result.errors.length).toBeGreaterThan(0);
	});

	it("should fail if initialNodeId does not exist in nodes", () => {
		const invalidJson = {
			workflowId: "test-wf-1",
			initialNodeId: "node-999",
			nodes: {
				"node-1": {
					id: "node-1",
					audioPath: "audio/track1.mp3",
					transitions: [],
				},
			},
		};

		const result = validateWorkflow(invalidJson);
		expect(result.isValid).toBe(false);
		expect(result.errors).toContainEqual(
			expect.objectContaining({
				path: "initialNodeId",
				message: expect.stringContaining("does not exist in nodes"),
			}),
		);
	});

	it("should fail if transition target does not exist", () => {
		const invalidJson = {
			workflowId: "test-wf-1",
			initialNodeId: "node-1",
			nodes: {
				"node-1": {
					id: "node-1",
					audioPath: "audio/track1.mp3",
					transitions: [{ type: "direct", targetId: "node-999" }],
				},
			},
		};

		const result = validateWorkflow(invalidJson);
		expect(result.isValid).toBe(false);
		expect(result.errors).toContainEqual(
			expect.objectContaining({
				path: "nodes.node-1.transitions.0.targetId",
				message: expect.stringContaining("does not exist"),
			}),
		);
	});

	it("should fail if mixed transition types are used in a single node", () => {
		const invalidJson = {
			workflowId: "test-wf-1",
			initialNodeId: "node-1",
			nodes: {
				"node-1": {
					id: "node-1",
					audioPath: "audio/track1.mp3",
					transitions: [
						{ type: "choice", targetId: "node-2", buttonText: "Yes" },
						{ type: "direct", targetId: "node-2" },
					],
				},
				"node-2": {
					id: "node-2",
					audioPath: "audio/track2.mp3",
					transitions: [],
				},
			},
		};

		const result = validateWorkflow(invalidJson);
		expect(result.isValid).toBe(false);
		expect(result.errors).toContainEqual(
			expect.objectContaining({
				path: "nodes.node-1.transitions",
				message: expect.stringContaining("mixed transition types"),
			}),
		);
	});

	it("should fail if direct type has multiple transitions", () => {
		const invalidJson = {
			workflowId: "test-wf-1",
			initialNodeId: "node-1",
			nodes: {
				"node-1": {
					id: "node-1",
					audioPath: "audio/track1.mp3",
					transitions: [
						{ type: "direct", targetId: "node-2" },
						{ type: "direct", targetId: "node-2" },
					],
				},
				"node-2": {
					id: "node-2",
					audioPath: "audio/track2.mp3",
					transitions: [],
				},
			},
		};

		const result = validateWorkflow(invalidJson);
		expect(result.isValid).toBe(false);
		expect(result.errors).toContainEqual(
			expect.objectContaining({
				path: "nodes.node-1.transitions",
				message: expect.stringContaining("must have exactly one transition"),
			}),
		);
	});
});
