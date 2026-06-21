import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const f = createUploadthing();

export const ourFileRouter = {
  projectAsset: f({
    image: { maxFileSize: "4MB" },
    pdf: { maxFileSize: "8MB" },
    video: { maxFileSize: "32MB" },
    blob: { maxFileSize: "16MB" }
  })
    .input(z.object({ slug: z.string() }))
    .middleware(async ({ input }) => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");

      const project = await prisma.project.findFirst({
        where: { slug: input.slug, members: { some: { id: userId } } },
        select: { id: true },
      });
      if (!project) throw new Error("Project not found");

      return { userId, projectId: project.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("=== 📦 UPLOADTHING FILE RECEIVED ===", file);
      
      try {
        await prisma.asset.create({
          data: {
            url: file.url || (file as any).ufsUrl || "",
            name: file.name || "Untitled File",
            projectId: metadata.projectId,
            fileType: file.type || "unknown", 
            fileSize: file.size || 0,
            publicId: file.key || "unknown_key",
            secureUrl: file.url || (file as any).ufsUrl || "",
            userId: metadata.userId
          },
        });
        console.log("=== ✅ SAVED TO PRISMA SUCCESSFULLY ===");
        
      } catch (error) {
        console.error("=== ❌ PRISMA CRASHED ===", error);
      }

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;