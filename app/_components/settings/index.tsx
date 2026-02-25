"use client";

import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SettingsForm from "./settings-form";

export function Settings() {
  return (
    <Dialog>
      <div>
        <DialogTrigger asChild>
          <Button
            className="w-full cursor-pointer bg-blue-600 text-white after:flex-1 hover:bg-blue-500/90 sm:w-auto"
            aria-haspopup="dialog"
          >
            <span className="pointer-events-none flex-1">
              <Settings2 className="opacity-60" size={16} aria-hidden="true" />
            </span>
            Settings
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border" aria-hidden="true">
            <Settings2 className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">App Settings</DialogTitle>
            <DialogDescription className="sm:text-center">Change your app settings below.</DialogDescription>
          </DialogHeader>
        </div>
        <SettingsForm />
      </DialogContent>
    </Dialog>
  );
}
