import { createFileRoute } from "@tanstack/react-router";
import { Compass, Edit, Settings } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorView } from "@/features/editor/components/editor-view";
import { PlayerView } from "@/features/player/components/player-view";
import { SettingsView } from "@/features/settings/components/settings-view";
import { useAudioStore } from "@/stores/use-audio-store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const activeTab = useAudioStore((state) => state.activeTab);
	const setActiveTab = useAudioStore((state) => state.setActiveTab);

	return (
		<div className="h-dvh flex flex-col justify-between overflow-hidden bg-background relative font-sans">
			{/* Main Screen Content View */}
			<div className="flex-1 min-h-0 relative">
				<Tabs
					value={activeTab}
					onValueChange={(val) =>
						setActiveTab(val as "player" | "editor" | "settings")
					}
					className="h-full flex flex-col min-h-0"
				>
					<div className="flex-1 min-h-0 relative">
						<TabsContent
							value="player"
							className="h-full min-h-0 mt-0 data-[state=inactive]:hidden"
						>
							<PlayerView />
						</TabsContent>
						<TabsContent
							value="editor"
							className="h-full min-h-0 mt-0 data-[state=inactive]:hidden"
						>
							<EditorView />
						</TabsContent>
						<TabsContent
							value="settings"
							className="h-full min-h-0 mt-0 data-[state=inactive]:hidden"
						>
							<SettingsView />
						</TabsContent>
					</div>

					{/* Persistent Bottom Navigation Tab Bar for Smartphones */}
					<TabsList className="grid w-full grid-cols-3 h-16! bg-card border-t border-foreground/10 rounded-none p-1 shrink-0 gap-1 select-none">
						<TabsTrigger
							value="player"
							className="flex flex-col items-center justify-center gap-1 py-1.5 h-full rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground transition-all cursor-pointer"
						>
							<Compass className="size-5" />
							<span className="text-[10px] font-semibold tracking-wide uppercase">
								Player
							</span>
						</TabsTrigger>
						<TabsTrigger
							value="editor"
							className="flex flex-col items-center justify-center gap-1 py-1.5 h-full rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground transition-all cursor-pointer"
						>
							<Edit className="size-5" />
							<span className="text-[10px] font-semibold tracking-wide uppercase">
								Editor
							</span>
						</TabsTrigger>
						<TabsTrigger
							value="settings"
							className="flex flex-col items-center justify-center gap-1 py-1.5 h-full rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground transition-all cursor-pointer"
						>
							<Settings className="size-5" />
							<span className="text-[10px] font-semibold tracking-wide uppercase">
								Settings
							</span>
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{/* Global Notifications system */}
			<Toaster position="top-center" />
		</div>
	);
}
