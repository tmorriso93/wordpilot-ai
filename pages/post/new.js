import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { AppLayout } from '../../components/AppLayout';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAppProps } from '../../utils/getAppProps';
import { faFeatherPointed } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// NewPost component to generate a new blog post
export default function NewPost(props) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [generating, setGenerating] = useState(false);

  // Function to handle form submission
  // It sends a POST request to the API to generate a blog post based on the topic and keywords
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {

   // Validate topic and keywords
    const response = await fetch(`/api/generatePost`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        topic,
        keywords,
      }),
    });
    const json = await response.json();
    console.log("RESULT: ", json);
    if(json?.postId) {
      // Redirect to the new post page
      router.push(`/post/${json.postId}`);
    }
  } catch(e) {
    setGenerating(false);
  }
  }
  
  // Render the form to generate a new blog post
  // It includes fields for topic and keywords, and a button to submit the form
    return (  
    <div className='h-full overflow-hidden'>
      {!!generating && (
      <div className='text-green-500 flex h-full animate-pulse w-full flex-col justify-center items-center'>
        <FontAwesomeIcon icon={faFeatherPointed}  className='text-8xl'/>
        <h6>Generating...</h6>
      </div>
      )}
      {!generating && (
      <div className='w-full h-full flex felx--col overflow-auto'>
      <form onSubmit={handleSubmit} className='m-auto w-full max-w-screen-sm bg-slate-100 p-4 rounded-md shadow-xl border border-slate-200 shadow-slate-200'>
        
        <div>
          <label>
            <strong className="text-xl font-bold text-gray-800 mb-4">
              Generate a blog post on the topic of:
            </strong>
          </label>
          <textarea 
            className='resize-none border border-slate500 w-full block my-2 px-4 py-2 rounded-sm'
            value={topic} 
            onChange={e => setTopic(e.target.value)}
            maxLength={80}
          />
        </div>
        <div>
        <label>
            <strong className="text-xl font-bold text-gray-800 mb-4">
              Targeting the following keywords:
            </strong>
          </label>
          <textarea 
            className='resize-none border border-slate500 w-full block my-2 px-4 py-2 rounded-sm'
            value={keywords} 
            onChange={(e) => setKeywords(e.target.value)}
            maxLength={80}
             placeholder="keyword1, keyword2, keyword3"
          />
          <small className='text-xs text-gray-600 mt-4 mb-4 italic'>
            Seperate keywords with a comma
          </small>
        </div>
      <button 
        type="submit" 
        className='btn' 
        disabled={!topic.trim() || !keywords.trim()}
      >
        Generate
      </button>
      </form>
      </div>
    )}
      </div>
    );
  }

  // This function sets the layout for the NewPost page
  NewPost.getLayout = function getLayout(page, pageProps) {
    return<AppLayout {...pageProps}>{page}</AppLayout>;
  };
  
  // This function fetches the initial props for the NewPost page
  export const getServerSideProps = withPageAuthRequired({
     async getServerSideProps(ctx){
       const props = await getAppProps(ctx);

       if(!props.availableTokens) {
        return {
          redirect: {
            destination: '/token-topup',
            permanent: false,
          },
        };
       }

       return {
         props,
       };
     },
    });