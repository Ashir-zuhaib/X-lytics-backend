import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { createSession } from "./utils/createSession";
import { BskyAgent } from "@atproto/api";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
const agent = new BskyAgent({
    service: "https://bsky.social",  // Ensure you have the right service URL
  });
  
async function setupAgent() {
    try {
      await agent.login({
        identifier: process.env.BLUESKY_HANDLE as string, // Add this to your .env file
        password: process.env.BLUESKY_PASSWORD as string, // Add this to your .env file
      });
      console.log("Bluesky Agent logged in successfully!");
    } catch (error) {
      console.error("Failed to log in to Bluesky:", error);
    }
  }
  
  // Route to fetch user profile
  app.get("/api/getprofile", async (req: any, res: any) => {
    const { actor } = req.query;  // Getting the 'actor' (DID) from query parameters
  
    if (!actor) {
      return res.status(400).json({ error: "Actor (DID) is required" });
    }
  
    try {
      const { data } = await agent.getProfile({ actor: String(actor) });
  
      // Return the profile data
      res.status(200).json({
        did: data.did,
        handle: data.handle,
        displayName: data.displayName || "", // Default empty string if displayName is missing
        avatar: data.avatar,
        followersCount: data.followersCount || 0,
        followsCount: data.followsCount || 0,
        postsCount: data.postsCount || 0,
        indexedAt: data.indexedAt || "",
        createdAt: data.createdAt || "",
        associated: {
          lists: data.associated?.lists || 0,
          feedgens: data.associated?.feedgens || 0,
          starterPacks: data.associated?.starterPacks || 0,
          labeler: data.associated?.labeler || false,
        },
        labels: data.labels || [],
        viewer: {
          muted: data.viewer?.muted || false,
          blockedBy: data.viewer?.blockedBy || false,
        },
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile", details: error.message });
    }
  });

// POST route to create a session
app.post(
  "/api/create-session",
  async (req:any, res:any, next: any) => {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ error: "Identifier and password are required" });
      }

      const session = await createSession(
        identifier,
        password,
        process.env.PDSHOST || "https://bsky.social"
      );

      res.status(200).json(session);
    } catch (error: any) {
      next(error);
    }
  }
);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  setupAgent();
});
