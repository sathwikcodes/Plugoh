import { router } from "../init";
import { campaignRouter } from "./campaign";
import { profileRouter } from "./profile";
import { campaignFileRouter } from "./campaign-file";

export const appRouter = router({
  campaign: campaignRouter,
  profile: profileRouter,
  campaignFile: campaignFileRouter,
});

export type AppRouter = typeof appRouter;
