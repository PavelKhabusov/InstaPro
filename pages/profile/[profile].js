import { useRecoilState } from "recoil";
import {
  themeState,
  postView,
  likesView,
  commentsView,
  userActivity
} from "../../atoms/states";
import Login from "../../pages/login";
import Header from "../../components/Header";
import Posts from "../../components/Posts";
import ProfileSec from "../../components/ProfileSec";
import FollowList from "../../components/FollowList";
import Loading from "../../components/Loading";
import { useEffect, useState } from "react";
import { db, onUserAuthStateChanged } from "../../firebase";
import { useRouter } from "next/router";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";

const Profile = () => {
  const [currentUser, setUser] = useState(null); // State to hold the user session

  useEffect(() => {
    const unsubscribe = onUserAuthStateChanged((user) => {
      if (user) setUser(user); 
      else setUser(null); 
    });
    return () => unsubscribe();
  });


  const router = useRouter();
  const [darkMode, setDarkMode] = useRecoilState(themeState);
  // const [view, setView] = useRecoilState(postView);
  const [openLikes, setOpenLikes] = useRecoilState(likesView);
  const [openComments, setOpenComments] = useRecoilState(commentsView);
  const [totalPosts, setTotalPosts] = useState(0);
  const [bookmarksPosts, setBookmarksPosts] = useState(0);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowings, setShowFollowings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const { profile } = router?.query;

  const [load, setLoad] = useState(false);
  const [users, loading] = useCollectionData(collection(db, "profile"));

  const [followers] = useCollectionData(
    query(
      collection(db, `profile/${profile}/followers`),
      orderBy("timeStamp", "desc")
    )
  );
  const [followings] = useCollectionData(
    query(
      collection(db, `profile/${profile}/followings`),
      orderBy("timeStamp", "desc")
    )
  );

  const [bookmarks] = useCollectionData(
    query(collection(db, `profile/${profile}/bookmarks`), orderBy("timeStamp", "desc"))
  );

  useEffect(() => {
    return () => {
      setShowFollowings(false);
      setShowFollowers(false);
    };
  }, [followings]);

  // useEffect(() => {
  //   return () => {
  //     setShowBookmarks(false);
  //   };
  // }, [bookmarks]);
  

  const callback = (entries) => {
    // entries.forEach((entry) => {
    //   if (entry.isIntersecting) {
    //     entry.target.play();
    //   } else {
    //     entry.target.pause();
    //   }
    // });
  };

  useEffect(() => {
    // let observer;
    // if (currentUser) {
    //   observer = new IntersectionObserver(callback, { threshold: 0.6 });
    // }
    // if (load) {
    //   const elements = document.querySelectorAll("video");
    //   elements.forEach((element) => {
    //     observer.observe(element);
    //   });
    // }
    return () => {
      // observer?.disconnect();
      setOpenComments(false);
      setOpenLikes(false);
    };
  }, [currentUser, setOpenComments, setOpenLikes, load]);

  return (
    <>
      {currentUser || profile ? (
        <div
          className={`relative h-screen overflow-y-scroll scrollbar-hide flex justify-center relative`}
        >
          <div className="max-w-3xl min-w-[380px] text-gray-200 flex-1 overflow-y-scroll scrollbar-hide">
            {loading ? (
              <Loading page={"profile"} />
            ) : (
              <>
                <FollowList
                  setShowFollowers={setShowFollowers}
                  showFollowers={showFollowers}
                  users={users}
                  follow={true}
                  followers={followers}
                  router={router}
                  login={currentUser?.email.split("@")[0]}
                />
                <FollowList
                  setShowFollowings={setShowFollowings}
                  users={users}
                  showFollowings={showFollowings}
                  followings={followings}
                  router={router}
                  login={currentUser?.email.split("@")[0]}
                />
                <Header
                  showFollowers={showFollowers}
                  showFollowings={showFollowings}
                  darkMode={darkMode}
                  user={
                    users?.filter(
                      (user) => user.login === currentUser?.email.split("@")[0]
                    )[0]
                  }
                  setDarkMode={setDarkMode}
                />
                <ProfileSec
                  posts={totalPosts}
                  currentUser={currentUser}
                  openLikes={openLikes}
                  setOpenLikes={setOpenLikes}
                  openComments={openComments}
                  setOpenComments={setOpenComments}
                  // view={view}
                  user={
                    users.filter((ituser) => ituser.login == profile)[0]
                  }
                  visitor={
                    users.filter(
                      (ituser) => ituser.login === currentUser?.email.split("@")[0]
                    )[0]
                  }
                  setShowFollowers={setShowFollowers}
                  showFollowers={showFollowers}
                  showFollowings={showFollowings}
                  setShowFollowings={setShowFollowings}
                  followers={followers}
                  followings={followings}
                />
                {/* <button
                  hidden={
                    showFollowers || showFollowings || openLikes || openComments
                      ? true
                      : false
                  }
                  className="absolute z-50 bottom-20 text-white text-gray-300 bg-blue-400 font-semibold bg-slate-700 rounded-r-2xl py-1 px-4"
                  onClick={() => setView(!view)}
                >
                  {view ? "G-View" : "P-View"}
                </button> */}
              </>
            )}
            <div className={loading ? "hidden" : ""}>
              <Posts
                showFollowers={showFollowers}
                showFollowings={showFollowings}
                setLoad={setLoad}
                setTotalPosts={setTotalPosts}
                profile={profile}
              />
              
                <Posts setTotalPosts={setBookmarksPosts} profile={profile} setLoad={setLoad} bookmarks={bookmarks} />
            </div>
          </div>
        </div>
      ) : (
        <Login />
      )}
    </>
  );
};

export default Profile;
