import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";
import stripeInit from "stripe";

const stripe = stripeInit(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    // inisde this handler we'll connect to MongoDB
    // Check to see if user has a profile in our db, if not then create a profile for the user
    // and add tokens to their profile. if thet do have a profile, then add tokens to their profile.
    
    const { user } = await getSession(req, res);

    // hit stripe api to create a checkout session that show form that user can use to pay for tokens
    //we have 1 item because we only have one item in our products collection which is tokens
    const lineItems = [{
        
        // price: process.env.STRIPE_PRICE_ID, // this is the price id of the product we created in stripe dashboard
        price: process.env.STRIPE_PRODUCT_PRICE_ID, // this is the price id of the product we created in stripe dashboard
        quantity: 1, // we only have one item in our products collection which is tokens
    }];

    const protocol = process.env.NODE_ENV === 'development' ? 'http://' : 'https://'; // this is to determine if we are in development or production environment 
    const host = req.headers.host; // this is the host of the request, it will be used to redirect the user to the success or cancel url after payment


    const checkoutSession = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment', // we are in payment mode because we are charging the user for tokens
        success_url: `${protocol}${host}/success`, // this is the url that the user will be redirected to after a successful payment
        payment_intent_data: {
            metadata: {
                sub: user.sub, 
            }
        },
        metadata: {
            sub: user.sub, 
        }
    });

    console.log('user: ', user);
    

    
    res.status(200).json({ session: checkoutSession })
  }
  