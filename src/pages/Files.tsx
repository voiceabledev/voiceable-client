import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  FolderOpen, 
  Plus,
  Upload,
} from "lucide-react";

export default function Files() {
  const [files, setFiles] = useState<File[]>([]);
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
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Files</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="accent" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 md:p-6">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileSelect}
            multiple
          />

          <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {/* Drag and Drop Area */}
          <div 
            className={`w-full max-w-md border-2 border-dashed rounded-lg p-8 mb-6 transition-colors cursor-pointer ${
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
              <div className="w-12 h-12 rounded-lg border-2 border-muted flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Drag and drop a file here or click to select file locally.
              </p>
            </div>
          </div>

          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold mb-2">Files</h2>
            <p className="text-muted-foreground mb-2">No files uploaded yet</p>
            <p className="text-muted-foreground text-sm mb-6">
              Files allow assistants to search information in your documents.
            </p>
            
            <div className="flex items-center justify-center gap-3">
              <Button variant="accent" onClick={() => fileInputRef.current?.click()}>
                <Plus className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
