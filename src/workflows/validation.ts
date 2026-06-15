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
			path: err.path.map(String).join("."),
			message: err.message,
		}));
		return { isValid: false, errors };
	}

	return {
		isValid: true,
		errors: [],
		workflow: parseResult.data as Workflow,
	};
}
