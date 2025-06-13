import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default withApiAuthRequired(async function handler(req, res){
    try {
        // grab currently logged in users auth0Id and grab that users profile from our mongo db data base
        // then delete that post when the user Id is equal to the user profile Id
        const { user: { sub } } = await getSession(req, res);
        const client = await clientPromise;
        const db = client.db("wordPilotAi");
        const userProfile = await db.collection("users").findOne({
            auth0Id: sub
        });

        const { postId } = req.body;

        // This makes sure we only delete this postId if the currently logged in user owns this post
        await db.collection("posts").deleteOne({
            userId: userProfile._id,
            _id: new ObjectId(postId)
        });

        res.status(200).json({ success: true })
    } catch(e) {
        console.log("ERROR TRYING TO DELETE A POST: ", e);
    }
    return;
});