"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Check, X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { FormState, FormDispatch, InstagramMedia } from "./types";

interface StepPortfolioProps {
  state: FormState;
  dispatch: FormDispatch;
  media: InstagramMedia[];
}

export function StepPortfolio({ state, dispatch, media }: StepPortfolioProps) {
  const { toast } = useToast();

  const handleTogglePortfolioItem = (mediaId: string) => {
    const isSelected = state.portfolioIds.includes(mediaId);
    if (!isSelected && state.portfolioIds.length >= 6) {
      toast({
        title: "Max 6 items",
        description: "Remove one to add another.",
      });
      return;
    }
    dispatch({
      type: "TOGGLE_ARRAY_ITEM",
      field: "portfolioIds",
      value: mediaId,
    });
  };

  const handleAddBrand = () => {
    const name = state.brandInput.trim();
    if (!name) return;
    dispatch({ type: "ADD_BRAND", name });
  };

  return (
    <>
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Curate Your Portfolio
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pick your best work (3-6 posts). Brands see these first.
        </p>
      </div>

      {/* Media Grid */}
      {media.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {media.map((item) => {
            const isSelected = state.portfolioIds.includes(item.ig_media_id);
            const imgSrc = item.thumbnail_url || item.media_url;
            return (
              <button
                key={item.ig_media_id}
                onClick={() => handleTogglePortfolioItem(item.ig_media_id)}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  isSelected
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-muted-foreground/30",
                )}
              >
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={item.caption?.slice(0, 50) || "Post"}
                    fill
                    sizes="(max-width: 768px) 33vw, 150px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary rounded-full p-1">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-white">
                    <span className="flex items-center gap-0.5">
                      <Heart className="h-2.5 w-2.5" />
                      {item.like_count ?? 0}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No Instagram media synced yet. Connect your Instagram first.
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {state.portfolioIds.length}/6 selected
      </p>

      {/* Previous Brands */}
      <div className="space-y-2">
        <Label>Previous Brand Collaborations</Label>
        <div className="flex gap-2">
          <Input
            value={state.brandInput}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "brandInput",
                value: e.target.value,
              })
            }
            placeholder="e.g. Nike, Zomato..."
            className="h-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddBrand();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 px-4"
            onClick={handleAddBrand}
          >
            Add
          </Button>
        </div>
        {state.previousBrands.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {state.previousBrands.map((brand) => (
              <Badge key={brand} variant="secondary" className="gap-1 pr-1">
                {brand}
                <button
                  onClick={() =>
                    dispatch({ type: "REMOVE_BRAND", name: brand })
                  }
                  className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
