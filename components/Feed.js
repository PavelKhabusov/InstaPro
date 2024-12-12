import { useState, useEffect } from "react";
import Posts from "./Posts";
import InstaStories from "./InstaStories";
import Login from "../pages/login";
import { useRecoilState } from "recoil";
import { commentsView, likesView } from "../atoms/states";
import { useAuthSession } from "../firebase";

const Feed = ({ setLoad, user }) => {
  const userSession = useAuthSession();
  const [openLikes] = useRecoilState(likesView);
  const [openComments] = useRecoilState(commentsView);

  return (
    <main className="max-w-3xl mx-auto dark:bg-black scroll-smooth relative">
      {userSession ? (
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
