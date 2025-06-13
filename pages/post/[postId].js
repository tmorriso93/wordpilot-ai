import React from "react";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import { ObjectId } from "mongodb";
import clientPromise from "../../lib/mongodb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag } from "@fortawesome/free-solid-svg-icons";
import { getAppProps } from "../../utils/getAppProps";
import { useContext, useState } from "react";
import { useRouter } from "next/router";
import PostsContext from "../../context/postsContext";


export default function Post(props) {

  console.log('PROPS: ', props);
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const {deletePost} = useContext(PostsContext);

  // Function to handle delete confirmation
  const handleDeleteConfirm = async () => {
    try{
      const response = await fetch(`/api/deletePost`, {
        method: "POST",
        headers: {
          'content-type': "application/json"
        },
        body: JSON.stringify({ postId: props.postId }),
      });
      const json = await response.json();
      if(json.success) {
        deletePost(props.id);
        router.replace(`/post/new`)
      }
    }catch(e) {
    }
  }
    return (
      <div className="overflow-auto h-full">
        <div className="max-w-screen-sm mx-auto">
        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-md">
            SEO title and meta description
          </div>
          <div className="p-4 my-2 border border-stone-200 rounded-md">
            <div className="text-blue-600 text-2xl font-bold">{props.title}</div>
            <div className="mt-2">{props.metaDescription}</div>
          </div>
            {/* keywords */}
          <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-md">
            Keywords
          </div>
          <div className="flex flex-wrap pt-2 gap-1">
            {props.keywords.split(",").map((keyword, i) => (
              <div key={i} className="p-2 rounded-full bg-slate-800 text-white ">
                 <FontAwesomeIcon icon={faHashtag}/> {keyword}
              </div>
            ))}
          </div>
          <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-md">
            Blog post
          </div>
          <div dangerouslySetInnerHTML={{ __html: props.blogPost || '' }} />
          <div className="my-4">
            {!showDeleteConfirm && (
            <button className="btn bg-red-600 hover:bg-red-700" onClick={() => setShowDeleteConfirm(true)}
              >
              Delete post
            </button>
            )}
            {!!showDeleteConfirm &&
              <div className="max-w-[90%] m-auto">
                <p className="p-2 bg-red-300 text-center">Are you sure you want to delete this post? This action is irreversible</p>
                <div className="grid grid-cols-2 -2 gap-2">
                  <button onClick={() => showDeleteConfirm(false) } className="btn bg-stone-600 hover:bg-stone-700">cancel</button>
                  <button onClick={handleDeleteConfirm} className="btn bg-red-600 hover:bg-red-700">confirm delete</button>
                </div>
              </div> }
          </div>
        </div>
      </div>
      );
  }

    // display the side bar
    Post.getLayout = function getLayout(page, pageProps) {
      return<AppLayout {...pageProps}>{page}</AppLayout>;
    };

  
   export const getServerSideProps = withPageAuthRequired({
    async getServerSideProps(ctx){
      const props = await getAppProps(ctx);
      const userSession = await getSession(ctx.req, ctx.res);
      const client = await clientPromise;
      const db = client.db("wordPilotAi");

      const user = await db.collection("users").findOne({
        auth0Id: userSession.user.sub,
      });

      //1
      const { postId } = ctx.params;

      //2
      function isValidObjectId(id) {
        return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
      }

      //3
      if (!isValidObjectId(postId)) {
        return {
          notFound: true,
        };
      }
  

    const post = await db.collection('posts').findOne({
      // _id: new ObjectId(ctx.params.postId),
      //4
      _id: new ObjectId(postId),
      userId: user._id,
    });

    // If the post does not exist, redirect to the new post page
    if(!post) {
      return {
        redirect: {
          destination: '/post/new',
          permanent: false,
        },
      };
    }

    // If the post exists, return the post data as props
    return {
      props: {
        // id: ctx.params.postId,
        //5
        id: postId,
        blogPost: post.blogPost,
        title: post.title,
        metaDescription: post.metaDescription,
        keywords: post.keywords,
        postCreated: post.created.toString(),
        ...props,
      },
    };
    },
   });


 