import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Briefcase, Clipboard, ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function JobDescriptionInput({ value, onChange }: JobDescriptionInputProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        onChange(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Pasted Successfully",
          description: "Job description has been pasted from clipboard.",
        });
      } else {
        toast({
          title: "Clipboard Empty",
          description: "No text found in clipboard.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Paste Failed",
        description: "Failed to read from clipboard. Please paste manually.",
        variant: "destructive",
      });
    }
  };

  const characterCount = value.length;
  const maxLength = 5000;
  const isNearLimit = characterCount > maxLength * 0.8;

  return (
    <Card className="h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Briefcase className="h-5 w-5 text-primary mr-2" />
          Job Description
        </h3>
        
        <div className="flex-1 flex flex-col">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste the job description here..."
            className="flex-1 min-h-[160px] resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
            maxLength={maxLength}
          />
          
          <div className="flex justify-between items-center mt-3">
            <p className={`text-xs ${isNearLimit ? 'text-warning' : 'text-gray-500'}`}>
              Character count: <span className="font-medium">{characterCount}</span>/{maxLength}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePasteFromClipboard}
              className="text-sm text-primary hover:text-blue-700 font-medium"
            >
              {copied ? (
                <>
                  <ClipboardCheck className="h-4 w-4 mr-1" />
                  Pasted!
                </>
              ) : (
                <>
                  <Clipboard className="h-4 w-4 mr-1" />
                  Paste from clipboard
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
