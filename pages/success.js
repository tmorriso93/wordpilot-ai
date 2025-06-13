import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../components/AppLayout";
import { getAppProps } from "../utils/getAppProps";

export default function Success() {
    return ( 
      // This is the success page after a successful token top up
      <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank you for your purchase!</h1>
        <p className="text-gray-600 mb-6">
          Your tokens have been successfully added. You can now start generating high-quality blog posts instantly. Happy writing!
        </p>
      </div>
    </div>
    );
  }

  // display the side bar
  Success.getLayout = function getLayout(page, pageProps) {
      return<AppLayout {...pageProps}>{page}</AppLayout>;
    };
  
   export const getServerSideProps = withPageAuthRequired({
    async getServerSideProps(ctx){
      const props = await getAppProps(ctx);
      return {
        props,
      };
    },
   });

