import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — FAIP" }, { name: "description", content: "Application settings and backend configuration." }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Configuration</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
      </div>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Backend</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="api">FastAPI Predict Endpoint</Label>
            <Input id="api" placeholder="http://127.0.0.1:8000" defaultValue="http://127.0.0.1:8000" />
            <p className="text-[11px] text-muted-foreground">
              Override this with VITE_FAIP_API_URL when the FastAPI backend runs elsewhere.
            </p>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 p-3">
            <div>
              <div className="text-sm font-medium">Stream live telemetry</div>
              <div className="text-xs text-muted-foreground">Subscribe to SCADA risk feed.</div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 p-3">
            <div>
              <div className="text-sm font-medium">Email critical alerts</div>
              <div className="text-xs text-muted-foreground">Notify on-call engineer.</div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { SettingsPage };
