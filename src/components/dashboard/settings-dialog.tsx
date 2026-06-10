"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Loader2 } from "lucide-react";
import { updateCycleStartDate } from "@/actions/user.actions";

interface SettingsDialogProps {
  currentCycleStart: number;
}

export function SettingsDialog({ currentCycleStart }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [cycleStart, setCycleStart] = useState(currentCycleStart.toString());
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const num = parseInt(cycleStart);
    if (isNaN(num) || num < 1 || num > 28) return;

    setLoading(true);
    const result = await updateCycleStartDate(num);
    setLoading(false);

    if (result.success) {
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        Settings
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dashboard Settings</DialogTitle>
            <DialogDescription>
              Customize how your financial data is calculated and displayed.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cycleStart">Billing Cycle Start Date</Label>
              <Input
                id="cycleStart"
                type="number"
                min="1"
                max="28"
                value={cycleStart}
                onChange={(e) => setCycleStart(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Enter the day of the month (1-28) when you receive your salary. Your monthly dashboard limits and trends will start calculating from this date.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || !cycleStart}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
