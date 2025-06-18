//new file


// pages/api/getTokens.js
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";

export default withApiAuthRequired(async function handler(req, res) {
  const { user } = await getSession(req, res);
  const client = await clientPromise;
  const db = client.db("wordPilotAi");

  const userProfile = await db.collection("users").findOne({
    auth0Id: user.sub,
  });

  res.status(200).json({
    availableTokens: userProfile?.availableTokens || 0,
  });
});
