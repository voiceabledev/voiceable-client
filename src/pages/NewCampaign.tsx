import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft,
  Info,
  Download,
  Plus,
  Clock
} from "lucide-react";

export default function NewCampaign() {
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [assistant, setAssistant] = useState("");
  const [sendOption, setSendOption] = useState<"now" | "later">("later");
  const [date, setDate] = useState("Today");
  const [time, setTime] = useState("07:35 PM");
  const [timezone, setTimezone] = useState("America/Vancouver (PST)");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle CSV file
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-border">
        <div className="flex items-center justify-between p-3 md:p-4 gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/outbound")} className="flex-shrink-0">
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <h1 className="text-lg md:text-xl font-semibold truncate">New campaign</h1>
          </div>
          <Button variant="accent" size="sm" className="text-xs md:text-sm md:px-4 md:py-2">
            <span className="hidden sm:inline">Launch campaign</span>
            <span className="sm:hidden">Launch</span>
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Campaign Name */}
        <div className="space-y-2">
          <Label>Campaign Name</Label>
          <Input 
            placeholder="Campaign Name"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="bg-secondary/50"
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Phone Number</Label>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <Select value={phoneNumber} onValueChange={setPhoneNumber}>
            <SelectTrigger className="bg-secondary/50">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number1">+1 (415) 555-0123</SelectItem>
              <SelectItem value="number2">+1 (415) 555-0124</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Best Practices Alert */}
        <div className="flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-lg bg-secondary/50 border border-border">
          <Info className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs md:text-sm font-medium mb-1">Best Practices</p>
            <p className="text-xs md:text-sm text-muted-foreground">
              Learn how to avoid spam flagging and optimize your calling strategy for better success rates.{" "}
              <a href="#" className="text-accent hover:underline">
                Spam flagging best practices
              </a>
            </p>
          </div>
        </div>

        {/* Upload CSV */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label>Upload CSV</Label>
            <Button variant="ghost" size="sm" className="text-muted-foreground text-xs md:text-sm w-full sm:w-auto">
              <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
              Download template
            </Button>
          </div>
          <div 
            className={`border-2 border-dashed rounded-lg p-4 md:p-8 transition-colors cursor-pointer ${
              isDragging 
                ? "border-accent bg-accent/5" 
                : "border-border hover:border-muted-foreground"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 border-muted flex items-center justify-center mb-3 md:mb-4">
                <Plus className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Drag and drop a CSV file here or click to select file locally
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Maximum file size: 5MB
              </p>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".csv"
          />
        </div>

        {/* Assistant */}
        <div className="space-y-2">
          <Label>Assistant</Label>
          <Select value={assistant} onValueChange={setAssistant}>
            <SelectTrigger className="bg-secondary/50">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assistant1">Support Assistant</SelectItem>
              <SelectItem value="assistant2">Sales Assistant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Schedule Options */}
        <div className="space-y-4">
          <Label>Choose when to send</Label>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <button
              className={`p-3 md:p-4 rounded-lg border text-center transition-colors text-sm md:text-base ${
                sendOption === "now" 
                  ? "border-accent bg-accent/10 text-foreground" 
                  : "border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground"
              }`}
              onClick={() => setSendOption("now")}
            >
              Send Now
            </button>
            <button
              className={`p-3 md:p-4 rounded-lg border text-center transition-colors text-sm md:text-base ${
                sendOption === "later" 
                  ? "border-accent bg-accent/10 text-foreground" 
                  : "border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground"
              }`}
              onClick={() => setSendOption("later")}
            >
              Schedule for later
            </button>
          </div>
        </div>

        {/* Schedule Details */}
        {sendOption === "later" && (
          <div className="space-y-4">
            <Label>Start at:</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Date</Label>
                <Select value={date} onValueChange={setDate}>
                  <SelectTrigger className="bg-secondary/50 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Today">Today</SelectItem>
                    <SelectItem value="Tomorrow">Tomorrow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Time</Label>
                <div className="relative">
                  <Input 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-secondary/50 pr-10 text-sm"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="bg-secondary/50 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Vancouver (PST)">America/Vancouver (PST)</SelectItem>
                    <SelectItem value="America/New_York (EST)">America/New_York (EST)</SelectItem>
                    <SelectItem value="Europe/London (GMT)">Europe/London (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Launch Button */}
        <Button variant="accent" className="w-full" size="lg">
          Launch campaign
        </Button>
      </div>
    </div>
  );
}
