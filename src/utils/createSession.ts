import axios from "axios";

/**
 * Creates a session with Bluesky using the identifier and password.
 * 
 * @param identifier - The Bluesky handle or email.
 * @param password - The account password.
 * @param pdsHost - The Bluesky API host (default: https://bsky.social).
 * @returns The session object containing accessJwt and refreshJwt.
 */
export async function createSession(
  identifier: string,
  password: string,
  pdsHost: string = "https://bsky.social"
): Promise<any> {
  try {
    const response = await axios.post(
      `${pdsHost}/xrpc/com.atproto.server.createSession`,
      { identifier, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error creating session:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to create session");
  }
}
