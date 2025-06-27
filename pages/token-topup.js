import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../components/AppLayout";
import { getAppProps } from "../utils/getAppProps";

export default function TokenTopup() {

  // This function handles the click event for the "Add Tokens" button
  const handleClick = async () => {
    const result =  await fetch(`/api/addTokens`, {
      method: 'POST',
    });

    const json = await result.json();
    console.log('RESULT: ', json);
    window.location.href = json.session.url; // redirect the user to the stripe checkout session url
  }

    return ( 
      // This is the token top up page
      // This is the content of the token top up page
      <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Top Up Your Tokens</h1>
        <p className="text-gray-600 mb-6">
          Need more tokens to keep creating? Click the button below to purchase additional tokens.
        </p>
        <p className="text-xs text-gray-500 mt-4 italic">
          Disclaimer: For testing purposes, please enter <span className="font-mono font-semibold">&quot;4242 4242 4242 4242&quot;</span>
          where it requires a credit card number.
        </p>
        {/* Button to add tokens */}
        <button 
          className="btn hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          onClick={handleClick}
        >
          Add Tokens
        </button>
      </div>
    </div>
    );
  }

  // display the side bar
  TokenTopup.getLayout = function getLayout(page, pageProps) {
      return <AppLayout {...pageProps}>{page}</AppLayout>;
    };
  
   export const getServerSideProps = withPageAuthRequired({
    async getServerSideProps(ctx){
      const props = await getAppProps(ctx);
      return {
        props,
      };
    },
   });