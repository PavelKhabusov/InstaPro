import {
  BookmarkIcon,
  ChatAlt2Icon,
  EmojiHappyIcon,
  DotsHorizontalIcon,
  HeartIcon,
  PaperAirplaneIcon,
  VideoCameraIcon,
  EyeIcon,
  TrashIcon,
  CubeTransparentIcon
} from "@heroicons/react/outline";
// import { XCircleIcon } from "@heroicons/react/solid";
import Image from "next/image";
import { HeartIcon as HeartIconFilled, BookmarkIcon as BookmarkIconFilled} from "@heroicons/react/solid";
import {
  addDoc,
  doc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { db } from "../firebase";
import Moment from "react-moment";
// import { postView } from "../atoms/states";
import { useRecoilState } from "recoil";
import { useCollectionData } from "react-firebase-hooks/firestore";
import sendPush from "../utils/sendPush";
import EmojiPicker from 'emoji-picker-react';
import { getAdminLogins } from "../utils/utilityFunctions";

const Post = ({
  post,
  router,
  deletePost,
  user,
  visitor,
  openComments,
  setOpenLikes,
  setPostLikes,
  setOpenComments,
  setPostComments,
  setCurPost,
}) => {
  const imgLoader = ({ src }) => { return `${src}`; };
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [hasLike, setHasLike] = useState(false);
  // const [view, setView] = useRecoilState(postView);

  let unsubscribe = null;
  const [likes] = useCollectionData(
    query(
      collection(db, `posts/${post.id}/likes`),
      orderBy("timeStamp", "desc")
    )
  );

  const [isSaved, setIsSaved] = useState(false);

  const savePost = async () => {
    setIsSaved(!isSaved);
    if (isSaved) {
      await updateDoc(doc(db, "profile", visitor?.login), {
        saved: arrayRemove(post.id),
      });  
    } else {
      await updateDoc(doc(db, "profile", visitor?.login), {
        saved: arrayUnion(post.id),
      });
    }
  };
  useEffect(() => {
    const checkSaved = async () => {
      console.log(visitor);
      if(!visitor?.login) return
      const docRef = doc(db, "profile", visitor?.login);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        if (docSnap.data().saved?.includes(post.id)) {
          setIsSaved(true);
        }
      }
    };
    checkSaved();
  }, [post.id, visitor?.login]);

  // useEffect(() => {
  //   setView(false);
  // }, [setView, router]);

  useEffect(() => {
    unsubscribe = onSnapshot(
      query(
        collection(db, "posts", post.id, "comments"),
        orderBy("timeStamp", "desc")
      ),
      (snapshot) => setComments(snapshot.docs)
    );
    return () => unsub();
  });

  useEffect(() => {
    if (likes) {
      setHasLike(
        likes.findIndex((like) => like.login == visitor?.login) !== -1
      );
    }
  });

  const likePost = async () => {
    if (hasLike) {
      await deleteDoc(doc(db, "posts", post.id, "likes", visitor?.uid));
    } else {
      await setDoc(doc(db, "posts", post.id, "likes", visitor?.uid), {
        username: visitor?.username,
        login: visitor?.login,
        timeStamp: serverTimestamp(),
      }).then(() => {
        sendNotification("has liked your post");
      });
    }
  };

  const handleOpenProject = () => {
    // open blank page in new tab
    window.open("https://kartoteka.digital/design/?url=" + post.id, "_blank");
  };

  const postComment = async (e) => {
    e.preventDefault();
    const commentToSend = comment;
    setComment("");

    await addDoc(collection(db, "posts", post.id, "comments"), {
      comment: commentToSend,
      username: visitor?.username,
      userImg: visitor?.image,
      timeStamp: serverTimestamp(),
      subcomments: [],
    }).then(() => {
      sendNotification("has commented to your post");
    });
  };

  const sendNotification = (message) => {
    if (user.login !== visitor?.login) {
      sendPush(
        user.uid,
        "",
        visitor?.fullname ? visitor?.fullname : visitor?.username,
        message,
        ""
      );
    }
  };

  useEffect(() => {
    if (openComments) {
      setPostComments(comments);
    }
  });

  const getLength = (comments) => {
    let len = comments?.length;
    comments?.forEach((comment) => {
      len += comment.data().subcomments?.length;
    });
    return len;
  };

  const handleOpenLikes = () => {
    setPostLikes(likes);
    setOpenLikes(true);
  };
  const handleOpenComments = () => {
    setPostComments(comments);
    setCurPost(post);
    setOpenComments(true);
  };
  const unsub = () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };

  const handlePlay = async () => {
    let videoViews = post.data().views;
    await updateDoc(doc(db, "posts", post.id), {
      views: videoViews ? videoViews + 1 : 1,
    });
  };

  const [openEmoji, setEmoji] = useState(false);
  const handleOpenEmoji = () => {
    setEmoji(!openEmoji)
  }
  const addEmoji = (emoji) => {
    setComment(comment + emoji.emoji)
  }

  return (
    <div>
      {router.asPath === "/"  || 1 ? (
        <div className="bg-[#3e3e3e40] backdrop-blur-sm rounded-2xl shadow-lg shadow-[#ffffff10] overflow-hidden mb-2 mt-1">
          <div className="postImg" >
            {post.data().image && (
              <Image
                unoptimized
                loader={imgLoader}
                loading="eager"
                layout="fill"
                objectFit="contain"
                src={post.data().image}
                alt="cover"
              />
            )}
            {post.data().video && (
              <video
                onClick={handlePlay}
                autoPlay={false}
                playsInline
                controls
                width="100%"
                preload="none"
                // className="w-full h-auto max-h-[500px] overflow-hidden"
              >
                <source src={post.data().video} />
              </video>
            )}
          </div>

          <div className="flex justify-between px-3 py-2 text-white items-center">
            <div className="flex space-x-1 items-center">
              {likes?.length > 0 && likes.length ? (
                <button onClick={handleOpenLikes} className="mb-1 flex">
                  {likes.length}
                </button>
              ) : ""}
              {hasLike ? (
                <HeartIconFilled
                  onClick={likePost}
                  className="btn text-red-500"
                />
              ) : (
                <HeartIcon onClick={likePost} className="btn" />
              )}
              
              {comments?.length > 0 && comments.length && (
                <span>{comments.length}</span>
              )}
              <ChatAlt2Icon className="btn" onClick={handleOpenComments} />
              {/* <EyeIcon className="btn" />
              {post.data().views && post.data().views > 0 && (
                <span>{post.data().views}</span>
              )} */}
            </div>
            <div className="flex">
              <PaperAirplaneIcon className="btn pt-1 rotate-90" />
              <CubeTransparentIcon onClick={handleOpenProject} className="btn" />
              {isSaved ? (
                <BookmarkIconFilled
                  onClick={savePost}
                  className="btn text-yellow-500"
                />
              ) : (
                <BookmarkIcon onClick={savePost} className="btn" />
              )}
            </div>
          </div>
          {/* <div className="px-4 text-gray-200 mb-2">
            {/* <p className="flex space-x-2 font-semibold">
              {likes?.length > 0 && (
                <button onClick={handleOpenLikes} className="mb-1 flex">
                  {likes.length} {likes.length === 1 ? "like" : "likes"}
                </button>
              )}
              {post.data().views && (
                <span>
                  {post.data().views > 1
                    ? `${post.data().views} views`
                    : "1 view"}
                </span>
              )}
            </p> *
            <span className="text-sm">{post.data().caption}</span>
          </div> */}

          {/* {comments.length > 0 && (
            <button
              onClick={handleOpenComments}
              className="px-4 text-sm text-gray-400"
            >
              view {getLength(comments)}
              {comments.length === 1 ? " comment" : " comments"}
            </button>
          )} */}

          <div className="flex items-center py-2 px-[5px] text-white">
            <div className="flex flex-1 items-center">
              <div className="relative rounded-full h-9 w-9 mx-2">
                <Image
                  unoptimized
                  loader={imgLoader}
                  loading="eager"
                  layout="fill"
                  className="rounded-quad"
                  src={
                    user
                      ? user.profImg
                        ? user.profImg
                        : user.image
                      : require("../public/checker.png")
                  }
                  alt="img"
                />
                <span
                  className={`-top-1 right-0 absolute  w-3.5 h-3.5 ${
                    user && user?.active ? "bg-green-400" : "bg-slate-400"
                  } border-[3px] border-gray-900 rounded-full`}
                ></span>
              </div>
              <button
                onClick={() => router.push(`/profile/${user ? user.login : post.data().login}`)}
                className="font-bold text-gray-200 cursor-pointer w-auto"
              >
                {user
                  ? user.fullname
                    ? user.fullname
                    : user.username
                  : post.data().username}
              </button>
              {getAdminLogins().includes(user?.login) && (
                <div className="relative h-4 w-4 mx-2">
                  <Image
                    unoptimized
                    loader={imgLoader}
                    src={require("../public/emoji.gif")}
                    layout="fill"
                    loading="eager"
                    alt="profile"
                    className="verified"
                  />
                </div>
              )}
            </div>
            <Moment fromNow className="mr-2 text-[10px]">
              {post.data().timeStamp?.toDate()}
            </Moment>
            {visitor?.login === post.data().login ? (
              <TrashIcon
                  className="w-6 h-6 mr-2 opacity-80 cursor-pointer"
                  onClick={() => deletePost(post.id)}
                />
            ) : (
              <DotsHorizontalIcon className="btn pr-3 text-gray-200" />
            )}
          </div>

          {/* <form className="flex items-center py-1 px-4 relative">
            <EmojiHappyIcon onClick={handleOpenEmoji} className="h-7 text-gray-200" />
            {openEmoji && (
              <div className="absolute" style={{top: "calc(100% - 5px)", left: "50%", transform: "translateX(-50%)"}}>
                <EmojiPicker 
                  width="100%"
                  reactionsDefaultOpen={true} 
                  skinTonesDisabled={true}
                  theme="dark"
                  onReactionClick={addEmoji}
                />
              </div>
            )}
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="border-none flex-1 outline-none focus:ring-0 bg-transparent placeholder:text-gray-400 text-white"
              placeholder="add a comment..."
              type="text"
            />
            <button
              type="submit"
              disabled={!comment.trim()}
              onClick={postComment}
              className="font-semibold text-blue-500 disabled:text-gray-400"
            >
              Post
            </button>
          </form> */}
        </div>
      ) : (
        <div className="bg-blue-200 bg-black rounded-md m-[1.5px]">
          <button
            onClick={() => setView(true)}
            className="relative h-[120px] w-[120px] sm:w-36 sm:h-36 rounded-md"
          >
            {post.data().image && (
              <Image
                unoptimized
                loader={imgLoader}
                src={post.data().image}
                layout="fill"
                objectFit="cover"
                loading="eager"
                alt="image"
                className="rounded-md"
              />
            )}
            {post.data().video && (
              <>
                <VideoCameraIcon className="h-5 w-5 absolute text-slate-200 m-1" />
                <video
                  onClick={handlePlay}
                  autoPlay={false}
                  preload="none"
                  src={post.data().video}
                  className="h-full w-full overflow-hidden"
                ></video>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Post;
