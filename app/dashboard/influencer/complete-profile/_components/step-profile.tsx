"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { CATEGORIES, LANGUAGES } from "@/lib/constants";
import type { FormState, FormDispatch } from "./types";

interface StepProfileProps {
  state: FormState;
  dispatch: FormDispatch;
}

export function StepProfile({ state, dispatch }: StepProfileProps) {
  return (
    <>
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Review Your Profile
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          AI filled these from your Instagram. Adjust anything that doesn&apos;t
          look right.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Display Name</Label>
          <Input
            value={state.displayName}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "displayName",
                value: e.target.value,
              })
            }
            placeholder="Your influencer name"
            className="h-11"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={state.category}
              onValueChange={(v) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "category",
                  value: v ?? "",
                })
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={state.city}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "city",
                  value: e.target.value,
                })
              }
              placeholder="e.g. Mumbai"
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Languages</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang}
                type="button"
                variant={state.languages.includes(lang) ? "default" : "outline"}
                size="sm"
                className="h-8"
                onClick={() =>
                  dispatch({
                    type: "TOGGLE_ARRAY_ITEM",
                    field: "languages",
                    value: lang,
                  })
                }
              >
                {lang}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea
            value={state.bio}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "bio",
                value: e.target.value,
              })
            }
            placeholder="Tell brands about yourself..."
            rows={3}
          />
        </div>
      </div>
    </>
  );
}
