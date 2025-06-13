import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { OpenAIApi, Configuration } from 'openai';
import clientPromise from '../../lib/mongodb';

export default withApiAuthRequired (async function handler(req, res) {
    const { user } = await getSession(req, res);
    // check if the user has available tokens
    const client = await clientPromise;
    const db = client.db("wordPilotAi");

    // check if the user has a profile in the database if not return an error or if available tokens are less than 1, return an error
    const userProfile = await db.collection("users").findOne({
        auth0Id: user.sub,
    })

    if(!userProfile?.availableTokens) {
        // 403 status means the user is authorised but doesnt have the required permissions to process this request(not enough tokens)
        //but if the user does have enough tokens we continue with the request
        res.status(403);
        return;
    }

    try {
        const config = new Configuration({
          apiKey: process.env.OPENAI_API_KEY,
        });
        

    const openai = new OpenAIApi(config);
// call openai api and get the response
    const { topic, keywords } = req.body;

    if(!topic || !keywords) {
        res.status(422);
        return;
    }

    if(topic.length > 80 || keywords.length > 80){
        res.status(422);
        return;
    }

    
   

    const response = await openai.createChatCompletion({
        // specify the api model you want to use
        model: "gpt-4o-mini",
        // model: "gpt-4o-mini-2024-07-18",
        // model: "gpt-3.5-turbo",
        // model: "gpt-3.5-turbo-1106",
        messages: [
            {
            // the system message is your initial instruction to the model to behave in a certain way
            // in this case we are telling the model to generate a blog post
            role: "system",
            content: 
                "You are an SEO friendly blog post generator called WordPilot Ai. You are designed to output markdown without frontmatter.",
        },
        {
            // specify the user message
            //
            role: "user",
            content: `
              Generate me a long and detailed seo friendly blog post on the following topic delimited by triple hyphens: 
              ---
              ${topic}
              ---
              Targeting the following comma separated keywords delimited by triple hyphens:
              ---
              ${keywords}
            `,
        },
    ],   
    });

    // ✅ Now that 'response' exists, we can read blogPost from it
    const blogPost = response.data.choices[0]?.message?.content;


// // ✅ Log the full blog content to your terminal


// SEO response 
const seoResponse = await openai.createChatCompletion({
    model: "gpt-4o-mini", 
    messages: [
        {
        role: "system",
        content:
        "You are an SEO friendly blog post generator called WordPilot Ai. You are designed to output JSON. Do not include HTML tags in your output. Do not include Hashtags in your output. output normal readable text so the user can copy and paste it into their blog post. without too many special characters getting in the way. add a seperating space between paragraphs. so its easier to read.",
    },
    {
        role: "user",
        content: `
        Generate an SEO friendly title and SEO meta description for the following blog post:
        ${blogPost}
        ---
        The output json should be in the following format:
        {
            "title": "Example Title",
            "metaDescription": "Example Meta Description"
        }
        `,
    },
],
     response_format: { type: "json_object" },
//   response_format: { "type": "json_schema", "json_schema": {...} },
//   response_format: { "type": "json_schema"},
});

// const {title, metaDescription} = seoResponse.data.choices[0]?.message?.content || {};

const seoContent = seoResponse.data.choices[0]?.message?.content;
let title = "";
let metaDescription = "";

try {
  const parsedSEO = JSON.parse(seoContent);
  title = parsedSEO.title;
  metaDescription = parsedSEO.metaDescription;
} catch (error) {
  console.error("Failed to parse SEO JSON:", seoContent, error);
}

await db.collection("users").updateOne(
    {
    auth0Id: user.sub
}, 
{
    $inc: {
        availableTokens: -1 // decrement the available tokens by 1
    }
})

const post = await db.collection("posts").insertOne({
    // postContent,
    blogPost,
    // postContent: blogPost,
    title,
    metaDescription,
    topic,
    keywords,
    userId: userProfile._id,
    created: new Date(),
})

console.log("POST: ", post);


// Return the generated content
res.status(200).json({ 
    postId: post.insertedId,
          });
    } catch (error) {
        console.error("OpenAI API error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate blog post" });
      }
    });
    