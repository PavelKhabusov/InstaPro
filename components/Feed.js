import { useState, useEffect } from "react";
import Posts from "./Posts";
import InstaStories from "./InstaStories";
import Login from "../pages/login";
import { useRecoilState } from "recoil";
import { commentsView, likesView } from "../atoms/states";
import { onUserAuthStateChanged } from "../firebase";

const Feed = ({ setLoad, user }) => {
  const [currentUser, setUser] = useState(null); // State to hold the user session

  useEffect(() => {
    const unsubscribe = onUserAuthStateChanged((user) => {
      if (user) setUser(user); 
      else setUser(null); 
    });
    return () => unsubscribe();
  });


  const [openLikes] = useRecoilState(likesView);
  const [openComments] = useRecoilState(commentsView);

  return (
    <main className="max-w-3xl mx-auto dark:bg-black scroll-smooth relative">
      {currentUser ? (
        <>
          <section>
            <InstaStories
              user={user}
              openLikes={openLikes}
              openComments={openComments}
            />
            <Posts setLoad={setLoad} />
          </section>
        </>
      ) : (
        <Login />
      )}
    </main>
  );
};

export default Feed;
