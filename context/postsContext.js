import { useRouter } from "next/router";
import React, { useCallback, useReducer, useState } from "react";

const PostsContext = React.createContext({});

export default PostsContext;

function postsReducer(state, action) {
    switch(action.type) {
        case 'addPosts': {
            const newPosts = [...state];
            action.posts.forEach((post) => {
                const exists = newPosts.find((p) => p._id === post._id);
                if (!exists) {
                    newPosts.push(post);
                }
            });
            return newPosts;
        }
        case 'deletePost' : {
            const newPosts = [];
            state.forEach(post => {
                if(post._id !== action.postId) {
                    newPosts.push(post);
                }
            });
            return newPosts;
        }
        default:
            return state;
    }
}

// PostsProvider component to manage posts state
export const PostsProvider = ({ children }) => {

    // State to hold posts
    const [posts, dispatch] = useReducer(postsReducer, []);
    const [noMorePosts, setNoMorePosts] = useState(false);
    
    const deletePost = useCallback((postId) => {
        dispatch({
            type: 'deletePost',
            postId
        })
    }, []);
    // const router = useRouter();

    // Function to set posts from SSR
    const setPostsFromSSR = useCallback((postsFromSSR = []) => {
        dispatch({
            type: "addPosts",
            posts: postsFromSSR
        })

    }, []);



    // Return the context provider with posts and setPostsFromSSR
    const getPosts = useCallback(async ({ lastPostDate, getNewerPosts = false }) => {
        const result = await fetch(`/api/getPosts`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
                body: JSON.stringify({ lastPostDate, getNewerPosts }),
        });
        // Check if the response is ok  
        const json = await result.json();
        const postsResult = json.posts || [];
        console.log("POSTS RESULT: ", postsResult);
        if(postsResult.length < 5) {
            setNoMorePosts(true);
        }
        dispatch({
            type: "addPosts",
            posts: postsResult,
        })
    },
     []);

    // Return the context provider with posts and functions
    return (
        <PostsContext.Provider value={{ posts, setPostsFromSSR, getPosts, noMorePosts, deletePost }}>
            {children}
        </PostsContext.Provider>

    );
}