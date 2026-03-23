"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package } from "lucide-react";
import {
  INFLUENCER_CONTENT_TYPES,
  TURNAROUND_OPTIONS,
  TURNAROUND_LABELS,
} from "@/lib/constants";
import type { FormState, FormDispatch } from "./types";

interface StepPackagesProps {
  state: FormState;
  dispatch: FormDispatch;
}

export function StepPackages({ state, dispatch }: StepPackagesProps) {
  return (
    <>
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Set Your Packages
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Brands filter by content type and delivery speed. Be specific.
        </p>
      </div>

      {/* Prices */}
      <div className="grid gap-4 grid-cols-3">
        <div className="space-y-2">
          <Label className="text-xs">&#8377; / Reel</Label>
          <Input
            type="number"
            value={state.priceReel}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "priceReel",
                value: e.target.value,
              })
            }
            placeholder="5000"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">&#8377; / Post</Label>
          <Input
            type="number"
            value={state.pricePost}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "pricePost",
                value: e.target.value,
              })
            }
            placeholder="3000"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">&#8377; / Story</Label>
          <Input
            type="number"
            value={state.priceStory}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "priceStory",
                value: e.target.value,
              })
            }
            placeholder="1500"
            className="h-11"
          />
        </div>
      </div>

      {/* Content Types */}
      <div className="space-y-2">
        <Label>Content You Create</Label>
        <div className="flex flex-wrap gap-2">
          {INFLUENCER_CONTENT_TYPES.map((ct) => (
            <Button
              key={ct}
              type="button"
              variant={state.contentTypes.includes(ct) ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() =>
                dispatch({
                  type: "TOGGLE_ARRAY_ITEM",
                  field: "contentTypes",
                  value: ct,
                })
              }
            >
              {ct}
            </Button>
          ))}
        </div>
      </div>

      {/* Turnaround */}
      <div className="space-y-2">
        <Label>Typical Turnaround Time</Label>
        <Select
          value={state.turnaroundTime}
          onValueChange={(v) =>
            dispatch({
              type: "SET_FIELD",
              field: "turnaroundTime",
              value: v ?? "",
            })
          }
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="How fast do you deliver?" />
          </SelectTrigger>
          <SelectContent>
            {TURNAROUND_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {TURNAROUND_LABELS[opt] || opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
