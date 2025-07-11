// import Cors from 'micro-cors';
// import stripeInit from 'stripe' ;
// import verifyStripe from '@webdeveducation/next-verify-stripe';
// import clientPromise from '../../../lib/mongodb';

// const cors = Cors({
//     allowMethods: ['POST', 'HEAD'],
// });

// export const config = {
//     api: {
//         bodyParser: false, // Disable the default body parser to handle raw body
//     }
// }

// const stripe = stripeInit(process.env.STRIPE_SECRET_KEY);
// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// // If verified stripe is successful, you'll get an event set to the event variable 
// // this event variable will contain all of the data was associated wwith that successful payment 
// const handler = async (req, res) => {
//     if (req.method === 'POST') {
//         let event;
//         try {
//             event = await verifyStripe({
//             req,
//             stripe,
//             endpointSecret,
//         })
//     } catch(e){
//         console.log("ERROR: ", e);
//     }

//     switch(event.type){
//         case 'payment_intent.succeeded': {
//         const client = await clientPromise;
//         const db = client.db("wordPilotAi");

//     const paymentIntent = event.data.object;
//     const auth0Id = paymentIntent.metadata.sub;

//     // ----
//     console.log("WEBHOOK: updating user tokens for auth0Id:", auth0Id);
//     console.log("WEBHOOK: paymentIntent metadata", paymentIntent.metadata);
//     console.log('AUTH 0 ID: ', paymentIntent);

//     // Check if the user already has a profile in the database
//     // If they do, increment the available tokens by 10
//     // If they don't, create a new profile with 10 tokens
//     // and set the auth0Id to the user's auth0Id    
//     const userProfile = await db.collection("users").updateOne(
//         {
//           auth0Id,
//         }, 
//         {
//           $inc: {
//             availableTokens: 10,
//           },
//           $setOnInsert: {
//             auth0Id,
//           },
//         }, {
//           upsert: true
//         }
//       );
//     }
//     default: {
//         console.log('Unhandled Event: ', event.type);
//     }
//     }
//     res.status(200).json({received: true });
//     }
//     };

//     export default cors(handler);

//  002

import Cors from 'micro-cors';
import stripeInit from 'stripe' ;
import verifyStripe from '@webdeveducation/next-verify-stripe';
import clientPromise from '../../../lib/mongodb';

const cors = Cors({
    allowMethods: ['POST', 'HEAD'],
});

export const config = {
    api: {
        bodyParser: false, // Disable the default body parser to handle raw body
    }
}

const stripe = stripeInit(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// If verified stripe is successful, you'll get an event set to the event variable 
// this event variable will contain all of the data was associated wwith that successful payment 
const handler = async (req, res) => {
    if (req.method === 'POST') {
        let event;
        try {
            event = await verifyStripe({
            req,
            stripe,
            endpointSecret,
        })
    } catch(e){
        console.log("ERROR: ", e);
    }

    switch(event.type){
        case 'payment_intent.succeeded': {
        const client = await clientPromise;
        const db = client.db("wordPilotAi");

    const paymentIntent = event.data.object;
    const auth0Id = paymentIntent.metadata.sub;

    // ----
    console.log("WEBHOOK: updating user tokens for auth0Id:", auth0Id);
    console.log("WEBHOOK: paymentIntent metadata", paymentIntent.metadata);
    console.log('AUTH 0 ID: ', paymentIntent);

    // Check if the user already has a profile in the database
    // If they do, increment the available tokens by 10
    // If they don't, create a new profile with 10 tokens
    // and set the auth0Id to the user's auth0Id    
    const userProfile = await db.collection("users").updateOne(
        { auth0Id },
        [
          {
            $set: {
              auth0Id,
              availableTokens: {
                $cond: [
                  { $eq: ["$availableTokens", undefined] }, // if no tokens yet
                  25,  // default value for new user
                  { $add: ["$availableTokens", 10] } // add 10 tokens for existing user
                ]
              }
            }
          }
        ],
        { upsert: true }
      );
      
    }
    default: {
        console.log('Unhandled Event: ', event.type);
    }
    }
    res.status(200).json({received: true });
    }
    };

    export default cors(handler);