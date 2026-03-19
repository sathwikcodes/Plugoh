import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../init";

export const campaignFileRouter = router({
  insertCampaignFile: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileSize: z.number().nullable().optional(),
        mimeType: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      const { error } = await db.from("campaign_files").insert({
        campaign_id: input.campaignId,
        uploaded_by: user.id,
        file_name: input.fileName,
        file_url: input.fileUrl,
        file_size: input.fileSize ?? null,
        mime_type: input.mimeType ?? null,
      });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return { success: true };
    }),
});
