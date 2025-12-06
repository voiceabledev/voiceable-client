import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 py-3">
      <span className="text-xs md:text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 md:gap-3 bg-secondary/50 rounded-lg px-2 md:px-3 py-2 w-full sm:w-64">
        <div
          className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border border-border flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent border-0 p-0 h-auto text-xs md:text-sm focus-visible:ring-0 flex-1"
        />
      </div>
    </div>
  );
}

interface WidgetConfig {
  variant: "tiny" | "compact" | "full";
  placement: string;
  avatarType: "orb" | "link" | "image";
  orbFirstColor: string;
  orbSecondColor: string;
  termsEnabled: boolean;
  termsContent: string;
  colors: {
    base: string;
    baseHover: string;
    baseActive: string;
    baseBorder: string;
    baseSubtle: string;
    basePrimary: string;
    baseError: string;
    accent: string;
    accentHover: string;
    accentActive: string;
    accentBorder: string;
    accentSubtle: string;
    accentPrimary: string;
  };
  overlayPadding: string;
  buttonRadius: string;
}

export default function WidgetTab() {
  const [config, setConfig] = useState<WidgetConfig>({
    variant: "full",
    placement: "bottom-right",
    avatarType: "orb",
    orbFirstColor: "#2792dc",
    orbSecondColor: "#9ce6e6",
    termsEnabled: true,
    termsContent: `#### Terms and conditions

By clicking "Agree," and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as described in the Privacy Policy.
If you do not wish to have your conversations recorded, please refrain from using this service.`,
    colors: {
      base: "#ffffff",
      baseHover: "#f9fafb",
      baseActive: "#f3f4f6",
      baseBorder: "#e5e7eb",
      baseSubtle: "#6b7280",
      basePrimary: "#000000",
      baseError: "#ef4444",
      accent: "#000000",
      accentHover: "#1f2937",
      accentActive: "#374151",
      accentBorder: "#4b5563",
      accentSubtle: "#6b7280",
      accentPrimary: "#ffffff",
    },
    overlayPadding: "32px",
    buttonRadius: "18px",
  });

  const updateColor = (key: keyof WidgetConfig["colors"], value: string) => {
    setConfig((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Avatar Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16">
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-1">Avatar</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Configure the voice orb or provide your own avatar.
            </p>
          </div>
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="text-xs md:text-sm text-muted-foreground mb-2 block">Type</label>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(["orb", "link", "image"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setConfig((prev) => ({ ...prev, avatarType: type }))}
                    className={cn(
                      "flex-1 py-2 text-xs md:text-sm font-medium transition-colors capitalize",
                      config.avatarType === type
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50"
                    )}
                  >
                    {type === "orb" ? "Orb" : type === "link" ? "Link" : "Image"}
                  </button>
                ))}
              </div>
            </div>

            {config.avatarType === "orb" && (
              <div className="bg-card border border-border rounded-lg p-3 md:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                  {/* Orb Preview */}
                  <div
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full flex-shrink-0"
                    style={{
                      background: `conic-gradient(from 180deg, ${config.orbFirstColor}, ${config.orbSecondColor}, ${config.orbFirstColor})`,
                    }}
                  />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">First color</label>
                      <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-2 md:px-3 py-2">
                        <div
                          className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border border-border flex-shrink-0"
                          style={{ backgroundColor: config.orbFirstColor }}
                        />
                        <Input
                          value={config.orbFirstColor}
                          onChange={(e) =>
                            setConfig((prev) => ({ ...prev, orbFirstColor: e.target.value }))
                          }
                          className="bg-transparent border-0 p-0 h-auto text-xs md:text-sm focus-visible:ring-0 flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Second color</label>
                      <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-2 md:px-3 py-2">
                        <div
                          className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border border-border flex-shrink-0"
                          style={{ backgroundColor: config.orbSecondColor }}
                        />
                        <Input
                          value={config.orbSecondColor}
                          onChange={(e) =>
                            setConfig((prev) => ({ ...prev, orbSecondColor: e.target.value }))
                          }
                          className="bg-transparent border-0 p-0 h-auto text-xs md:text-sm focus-visible:ring-0 flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Terms & Conditions Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16">
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-1">Terms & Conditions</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Require the caller to accept your terms and conditions before initiating a call.
            </p>
          </div>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={config.termsEnabled}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, termsEnabled: checked }))
                }
              />
              <span className="text-sm">Enable terms & conditions</span>
            </div>

            {config.termsEnabled && (
              <div>
                <label className="text-xs md:text-sm text-muted-foreground mb-2 block">
                  Terms content
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  You can use <span className="text-primary underline cursor-pointer">Markdown</span> to format the text.
                </p>
                <Textarea
                  value={config.termsContent}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, termsContent: e.target.value }))
                  }
                  className="min-h-[120px] md:min-h-[150px] bg-secondary/50 border-border font-mono text-xs md:text-sm"
                />
              </div>
            )}
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Styling Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16">
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-1">Styling</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Customize the colors and shape of the widget to best fit your website.
            </p>
          </div>
          <div className="space-y-3 md:space-y-4">
            {/* Variant */}
            <div>
              <label className="text-xs md:text-sm text-muted-foreground mb-2 block">Variant</label>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(["tiny", "compact", "full"] as const).map((variant) => (
                  <button
                    key={variant}
                    onClick={() => setConfig((prev) => ({ ...prev, variant }))}
                    className={cn(
                      "flex-1 py-2 text-xs md:text-sm font-medium transition-colors capitalize",
                      config.variant === variant
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50"
                    )}
                  >
                    {variant === "tiny" ? "Tiny" : variant === "compact" ? "Compact" : "Full"}
                  </button>
                ))}
              </div>
            </div>

            {/* Placement */}
            <div>
              <label className="text-xs md:text-sm text-muted-foreground mb-2 block">Placement</label>
              <p className="text-xs text-muted-foreground mb-2">
                The preview widget on this page is always placed in the bottom right corner of the
                screen. The placement you select here will only be used when the widget is embedded
                on your website.
              </p>
              <Select
                value={config.placement}
                onValueChange={(value) => setConfig((prev) => ({ ...prev, placement: value }))}
              >
                <SelectTrigger className="bg-secondary/50 border-border h-9 md:h-10 text-xs md:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom-right</SelectItem>
                  <SelectItem value="bottom-left">Bottom-left</SelectItem>
                  <SelectItem value="top-right">Top-right</SelectItem>
                  <SelectItem value="top-left">Top-left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Base Colors */}
            <div className="pt-4 space-y-0 divide-y divide-border/50">
              <ColorInput
                label="Base"
                value={config.colors.base}
                onChange={(v) => updateColor("base", v)}
              />
              <ColorInput
                label="Base Hover"
                value={config.colors.baseHover}
                onChange={(v) => updateColor("baseHover", v)}
              />
              <ColorInput
                label="Base Active"
                value={config.colors.baseActive}
                onChange={(v) => updateColor("baseActive", v)}
              />
              <ColorInput
                label="Base Border"
                value={config.colors.baseBorder}
                onChange={(v) => updateColor("baseBorder", v)}
              />
              <ColorInput
                label="Base Subtle"
                value={config.colors.baseSubtle}
                onChange={(v) => updateColor("baseSubtle", v)}
              />
              <ColorInput
                label="Base Primary"
                value={config.colors.basePrimary}
                onChange={(v) => updateColor("basePrimary", v)}
              />
              <ColorInput
                label="Base Error"
                value={config.colors.baseError}
                onChange={(v) => updateColor("baseError", v)}
              />
            </div>

            {/* Accent Colors */}
            <div className="pt-4 space-y-0 divide-y divide-border/50">
              <ColorInput
                label="Accent"
                value={config.colors.accent}
                onChange={(v) => updateColor("accent", v)}
              />
              <ColorInput
                label="Accent Hover"
                value={config.colors.accentHover}
                onChange={(v) => updateColor("accentHover", v)}
              />
              <ColorInput
                label="Accent Active"
                value={config.colors.accentActive}
                onChange={(v) => updateColor("accentActive", v)}
              />
              <ColorInput
                label="Accent Border"
                value={config.colors.accentBorder}
                onChange={(v) => updateColor("accentBorder", v)}
              />
              <ColorInput
                label="Accent Subtle"
                value={config.colors.accentSubtle}
                onChange={(v) => updateColor("accentSubtle", v)}
              />
              <ColorInput
                label="Accent Primary"
                value={config.colors.accentPrimary}
                onChange={(v) => updateColor("accentPrimary", v)}
              />
            </div>

            {/* Other Settings */}
            <div className="pt-4 space-y-0 divide-y divide-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 py-3">
                <span className="text-xs md:text-sm text-muted-foreground">Overlay Padding</span>
                <Input
                  value={config.overlayPadding}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, overlayPadding: e.target.value }))
                  }
                  className="bg-secondary/50 border-border w-full sm:w-64 text-xs md:text-sm h-9 md:h-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 py-3">
                <span className="text-xs md:text-sm text-muted-foreground">Button Radius</span>
                <Input
                  value={config.buttonRadius}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, buttonRadius: e.target.value }))
                  }
                  className="bg-secondary/50 border-border w-full sm:w-64 text-xs md:text-sm h-9 md:h-10"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Widget Preview */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
        <div
          className="rounded-xl md:rounded-2xl shadow-xl overflow-hidden"
          style={{
            backgroundColor: config.colors.base,
            borderColor: config.colors.baseBorder,
            borderWidth: 1,
          }}
        >
          <div className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <div
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0"
              style={{
                background:
                  config.avatarType === "orb"
                    ? `conic-gradient(from 180deg, ${config.orbFirstColor}, ${config.orbSecondColor}, ${config.orbFirstColor})`
                    : config.colors.accent,
              }}
            />
            <span
              className="text-xs md:text-sm font-medium"
              style={{ color: config.colors.basePrimary }}
            >
              Need help?
            </span>
          </div>
          <div className="px-3 md:px-4 pb-3 md:pb-4">
            <button
              className="w-full flex items-center justify-center gap-2 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-colors"
              style={{
                backgroundColor: config.colors.accent,
                color: config.colors.accentPrimary,
                borderRadius: config.buttonRadius,
              }}
            >
              <Phone className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Start a call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
