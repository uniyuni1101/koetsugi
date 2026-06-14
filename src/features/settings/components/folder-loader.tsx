import { AlertCircle, FolderOpen, Upload } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAudioStore } from "@/stores/use-audio-store";

export function FolderLoader() {
	const setDirectory = useAudioStore((state) => state.setDirectory);
	const loadWorkflow = useAudioStore((state) => state.loadWorkflow);
	const directoryHandle = useAudioStore((state) => state.directoryHandle);
	const filesMap = useAudioStore((state) => state.filesMap);

	const [isSupported, setIsSupported] = React.useState(true);
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		// Detect showDirectoryPicker support
		if (typeof window === "undefined" || !("showDirectoryPicker" in window)) {
			setIsSupported(false);
		}
	}, []);

	// Handles Web File System Access API
	const handleSelectDirectory = async () => {
		try {
			const handle = await window.showDirectoryPicker();
			const files: Record<string, File> = {};

			// Recursive helper to traverse directories
			const traverse = async (
				dirHandle: FileSystemDirectoryHandle,
				path = "",
			) => {
				for await (const entry of dirHandle.values()) {
					const relativePath = path ? `${path}/${entry.name}` : entry.name;
					if (entry.kind === "file") {
						const file = await entry.getFile();
						files[relativePath] = file;
					} else if (entry.kind === "directory") {
						await traverse(entry, relativePath);
					}
				}
			};

			await traverse(handle);

			// Load files map
			setDirectory(handle, files);
			toast.success("Successfully selected local directory!");

			// Parse workflow.json automatically
			await parseWorkflowFile(files);
		} catch (err: unknown) {
			const error = err as Error;
			if (error.name !== "AbortError") {
				console.error(error);
				toast.error(`Error opening directory: ${error.message}`);
			}
		}
	};

	// Fallback handle for Safari/mobile webkitdirectory
	const handleFallbackUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const fileList = e.target.files;
		if (!fileList || fileList.length === 0) return;

		const files: Record<string, File> = {};
		for (let i = 0; i < fileList.length; i++) {
			const file = fileList[i];
			// Use relative path if available, or just the file name
			const relativePath = file.webkitRelativePath || file.name;

			// If webkitRelativePath starts with the directory name, strip the top-level directory name
			// to match relative paths inside the workflow JSON.
			const parts = relativePath.split("/");
			if (parts.length > 1) {
				parts.shift(); // Remove the top-level folder name
				files[parts.join("/")] = file;
			} else {
				files[relativePath] = file;
			}
		}

		setDirectory(null, files);
		toast.success("Uploaded files in memory!");

		await parseWorkflowFile(files);
	};

	const parseWorkflowFile = async (files: Record<string, File>) => {
		const workflowFile = files["workflow.json"];
		if (!workflowFile) {
			toast.error("workflow.json not found in the selected folder!");
			return;
		}

		try {
			const text = await workflowFile.text();
			const json = JSON.parse(text);
			const result = loadWorkflow(json);
			if (result.success) {
				toast.success("Workflow schema validated and loaded successfully!");
			} else {
				toast.error(`Workflow validation failed: ${result.errors?.join(", ")}`);
			}
		} catch (err: unknown) {
			const error = err as Error;
			toast.error(`Failed to parse workflow.json: ${error.message}`);
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Select Audio Directory</CardTitle>
				<CardDescription>
					Select the directory containing your <code>workflow.json</code> and
					audio files to begin playback.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{isSupported ? (
					<Button
						onClick={handleSelectDirectory}
						className="w-full py-6 text-base flex gap-2"
					>
						<FolderOpen className="size-5" />
						Open Folder
					</Button>
				) : (
					<div className="flex flex-col gap-2">
						<input
							type="file"
							ref={fileInputRef}
							className="hidden"
							multiple
							// @ts-expect-error
							webkitdirectory=""
							onChange={handleFallbackUpload}
						/>
						<Button
							onClick={() => fileInputRef.current?.click()}
							className="w-full py-6 text-base flex gap-2"
						>
							<Upload className="size-5" />
							Upload Folder Files
						</Button>
						<span className="text-xs text-muted-foreground flex gap-1 items-center justify-center mt-1">
							<AlertCircle className="size-3 text-amber-500" />
							Directory API not supported. Using fallback upload.
						</span>
					</div>
				)}

				{Object.keys(filesMap).length > 0 && (
					<div className="mt-2 p-3 bg-muted rounded-lg border text-sm text-muted-foreground">
						<p className="font-semibold text-foreground">
							{directoryHandle
								? `Directory: ${directoryHandle.name}`
								: "Loaded files in memory"}
						</p>
						<p className="text-xs mt-1">
							Found {Object.keys(filesMap).length} file(s)
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
