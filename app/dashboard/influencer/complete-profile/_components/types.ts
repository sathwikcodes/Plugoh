import type { Dispatch } from "react";
import type { Database } from "@/lib/supabase/types";

export type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

export type InstagramMedia =
  Database["public"]["Tables"]["instagram_media"]["Row"];

export type FormState = {
  displayName: string;
  bio: string;
  category: string;
  city: string;
  languages: string[];
  priceReel: string;
  pricePost: string;
  priceStory: string;
  contentTypes: string[];
  turnaroundTime: string;
  portfolioIds: string[];
  previousBrands: string[];
  brandInput: string;
};

export type FormAction =
  | {
      type: "SET_FIELD";
      field: keyof FormState;
      value: FormState[keyof FormState];
    }
  | { type: "POPULATE"; data: Partial<FormState> }
  | {
      type: "TOGGLE_ARRAY_ITEM";
      field: "contentTypes" | "languages" | "portfolioIds";
      value: string;
    }
  | { type: "ADD_BRAND"; name: string }
  | { type: "REMOVE_BRAND"; name: string };

export type FormDispatch = Dispatch<FormAction>;

export const initialFormState: FormState = {
  displayName: "",
  bio: "",
  category: "",
  city: "",
  languages: [],
  priceReel: "",
  pricePost: "",
  priceStory: "",
  contentTypes: [],
  turnaroundTime: "",
  portfolioIds: [],
  previousBrands: [],
  brandInput: "",
};

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "POPULATE":
      return { ...state, ...action.data };

    case "TOGGLE_ARRAY_ITEM": {
      const arr = state[action.field] as string[];
      const exists = arr.includes(action.value);
      if (action.field === "portfolioIds" && !exists && arr.length >= 6) {
        // Max 6 portfolio items — caller should show a toast
        return state;
      }
      return {
        ...state,
        [action.field]: exists
          ? arr.filter((item) => item !== action.value)
          : [...arr, action.value],
      };
    }

    case "ADD_BRAND": {
      const name = action.name.trim();
      if (!name || state.previousBrands.includes(name)) return state;
      return {
        ...state,
        previousBrands: [...state.previousBrands, name],
        brandInput: "",
      };
    }

    case "REMOVE_BRAND":
      return {
        ...state,
        previousBrands: state.previousBrands.filter((b) => b !== action.name),
      };

    default:
      return state;
  }
}
