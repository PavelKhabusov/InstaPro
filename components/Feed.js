import { useState, useEffect } from "react";
import Posts from "./Posts";
// import InstaStories from "./InstaStories";
import { useRecoilState } from "recoil";
import { commentsView, likesView } from "../atoms/states";

const Feed = ({ setLoad }) => {
  const [openLikes] = useRecoilState(likesView);
  const [openComments] = useRecoilState(commentsView);

  return (
    <>
      <div className="container mt-4">
        <h2 className="lang" key="menuTitle">Каталог проектов</h2>
        <main className="privacy feed scroll-smooth relative">
          <div className="radial"></div>
          <section>
            {/* <InstaStories
              user={user}
              openLikes={openLikes}
              openComments={openComments}
            /> */}
            <Posts setLoad={setLoad} />
          </section>
        </main>
      </div>
    </>
  );
};

export default Feed;
