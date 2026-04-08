import { router } from "../init";
import { campaignRouter } from "./campaign";
import { profileRouter } from "./profile";
import { campaignFileRouter } from "./campaign-file";
import { inboxRouter } from "./inbox";
import { instagramRouter } from "./instagram";

export const appRouter = router({
  campaign: campaignRouter,
  profile: profileRouter,
  campaignFile: campaignFileRouter,
  inbox: inboxRouter,
  instagram: instagramRouter,
});

export type AppRouter = typeof appRouter;
