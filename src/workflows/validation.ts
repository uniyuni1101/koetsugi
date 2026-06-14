import { WorkflowSchema } from "./schemas";
import type { Workflow } from "./types";

export interface ValidationError {
	path: string;
	message: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
	workflow?: Workflow;
}

export function validateWorkflow(data: unknown): ValidationResult {
	const parseResult = WorkflowSchema.safeParse(data);
	if (!parseResult.success) {
		const errors: ValidationError[] = parseResult.error.issues.map((err) => ({
			path: err.path.join("."),
			message: err.message,
		}));
		return { isValid: false, errors };
	}

	const workflow = parseResult.data as Workflow;
	const errors: ValidationError[] = [];

	// 1. Check if initialNodeId exists
	if (!workflow.nodes[workflow.initialNodeId]) {
		errors.push({
			path: "initialNodeId",
			message: `Initial node ID "${workflow.initialNodeId}" does not exist in nodes.`,
		});
	}

	// 2. Check each node and its transitions
	for (const [nodeId, node] of Object.entries(workflow.nodes)) {
		if (node.id !== nodeId) {
			errors.push({
				path: `nodes.${nodeId}.id`,
				message: `Node key "${nodeId}" does not match its internal id "${node.id}".`,
			});
		}

		if (node.transitions.length > 0) {
			// Check for homogeneous transition types within a single node
			const firstType = node.transitions[0].type;
			const hasMixedTypes = node.transitions.some((t) => t.type !== firstType);
			if (hasMixedTypes) {
				errors.push({
					path: `nodes.${nodeId}.transitions`,
					message: `Node "${nodeId}" has mixed transition types. All transitions in a node must have the same type.`,
				});
			}

			// If direct, there should only be one transition
			if (firstType === "direct" && node.transitions.length > 1) {
				errors.push({
					path: `nodes.${nodeId}.transitions`,
					message: `Node "${nodeId}" has type "direct" but contains multiple transitions. "direct" nodes must have exactly one transition.`,
				});
			}

			// Check transition targets
			for (let i = 0; i < node.transitions.length; i++) {
				const transition = node.transitions[i];
				if (!workflow.nodes[transition.targetId]) {
					errors.push({
						path: `nodes.${nodeId}.transitions.${i}.targetId`,
						message: `Transition target "${transition.targetId}" in node "${nodeId}" does not exist.`,
					});
				}
			}
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		workflow: errors.length === 0 ? workflow : undefined,
	};
}
