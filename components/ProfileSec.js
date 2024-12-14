import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db, storage, signOutUser } from "../firebase";
import {
  doc,
  updateDoc,
  serverTimestamp,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { CameraIcon, LogoutIcon, MoonIcon, PencilAltIcon, SunIcon } from "@heroicons/react/outline";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { uuidv4 } from "@firebase/util";
import sendPush from "../utils/sendPush";
import { useRecoilState } from "recoil";
import { themeState, userActivity } from "../atoms/states";
import { getAdminLogins } from "../utils/utilityFunctions";

const ProfileSec = ({
  posts,
  showFollowers,
  showFollowings,
  currentUser,
  user,
  visitor,
  // view,
  setShowFollowers,
  setShowFollowings,
  openLikes,
  openComments,
  followers,
  followings,
}) => {
  const imgLoader = ({ src }) => { return `${src}`; };
  const [textBio, setTextBio] = useState("");
  const [textName, setTextName] = useState("");
  const [hasFollowed, setHasFollowed] = useState(false);
  const [followYou, setFollowYou] = useState(false);
  const [editProf, setEditProf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const toastId = useRef(null);
  const profileImageRef = useRef(null);

  useEffect(() => {
    if (editProf) {
      toastId.current = toast.warn("Note: use square image for profile");
    }
  }, [editProf]);

  useEffect(() => {
    if (user) {
      setTextBio(user.bio ? user.bio : "");
      setTextName(user.fullname ? user.fullname : "");
    }
  }, [user]);

  const followUser = async () => {
    if (toast.isActive(toastId.current)) {
      toast.dismiss(toastId.current);
    }
    toastId.current = toast.loading("Following...");
    await setDoc(
      doc(db, `profile/${user?.login}/followers/${visitor?.login}`),
      {
        username: visitor?.username,
        login: visitor?.login,
        timeStamp: serverTimestamp(),
      }
    );
    await setDoc(
      doc(db, `profile/${visitor?.login}/followings/${user.login}`),
      {
        username: user.displayName,
        login: user.login,
        timeStamp: serverTimestamp(),
      }
    ).then(() => {
      sendNotificationToUser("has followed you");
      toast.dismiss(toastId.current);
      toastId.current = null;
      toast.success("Followed Successfully 😇");
    });
  };

  const unFollowUser = async () => {
    if (confirm(`Do you really want to unfollow: ${user.displayName}`)) {
      if (toast.isActive(toastId.current)) {
        toast.dismiss(toastId.current);
      }
      toastId.current = toast.loading("unfollowing...");
      await deleteDoc(
        doc(db, `profile/${user.login}/followers/${visitor?.login}`)
      )
        .then(async () => {
          await deleteDoc(
            doc(
              db,
              `profile/${visitor?.login}/followings/${user.login}`
            )
          ).then(() => {
            sendNotificationToUser("has unfollowed you");
            toast.dismiss(toastId.current);
            toastId.current = null;
            toast.info("UnFollowed Successfully 😶");
          });
        })
        .catch((error) => {
          toast.dismiss(toastId.current);
          toastId.current = null;
          toast.error("Error: " + error);
        });
    }
  };

  const addMedia = async (file) => {
    if (file && file?.type?.includes("image")) {
      if (file.size / (1024 * 1024) > 5) {
        toast.error("Image size is larger than 3mb");
      } else {
        setProfilePic(file);
      }
    }
  };

  const sendNotificationToUser = (message) => {
    sendPush(
      user.uid,
      "",
      visitor?.fullname ? visitor?.fullname : visitor?.username,
      message,
      visitor?.profImg ? visitor?.profImg : visitor?.image,
      "https://insta-pro.vercel.app/profile/" + visitor?.login
    );
  };

  const saveEditing = async () => {
    if (toast.isActive(toastId.current)) {
      toast.dismiss(toastId.current);
      toastId.current = null;
    }
    if (profilePic) {
      toastId.current = toast.loading("Saving...");
      setLoading(true);
      const storageRef = ref(
        storage,
        `posts/image/${user.login}_${uuidv4()}`
      );
      const uploadTask = uploadBytesResumable(storageRef, profilePic);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          console.log(percent);
        },
        () => {
          updateProfile(false);
        },
        () => {
          // download url
          getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
            await updateDoc(doc(db, "profile", user.login), {
              bio: textBio,
              fullname: textName,
              profImg: url,
            }).then(() => {
              updateProfile(true);
            });
          });
        }
      );
    } else {
      toastId.current = toast.loading("Saving...");
      setLoading(true);
      await updateDoc(doc(db, "profile", user.login), {
        bio: textBio,
        fullname: textName,
      }).then(() => {
        updateProfile(true);
      });
    }
  };

  const updateProfile = (success) => {
    toast.dismiss(toastId.current);
    if (success)
      toast.success("Profile updated Successfully 😀", { toastId: "success" });
    else toast.error("Profile update failed", { toastId: "error" });
    setEditProf(false);
    setLoading(false);
    setProfilePic("");
    toastId.current = null;
  };

  useEffect(() => {
    setHasFollowed(
      followers?.findIndex(
        (usern) => usern.login === user?.login
      ) !== -1
    );
    setFollowYou(
      followings?.findIndex(
        (usern) => usern.login === user?.login
      ) !== -1
    );
  }, [user?.login, followings, followers]);

  const cancelEditing = () => {
    setTextBio(user.bio);
    setTextName(user.fullname);
    setProfilePic("");
    setEditProf(false);
  };

  const [darkMode, setDarkMode] = useRecoilState(themeState);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(darkMode));
  }, [darkMode]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutUser(); // Sign-out the user
    } catch (error) {
      console.error("Error during sign-out:", error);
      setLoading(false);
    }
  };
  return (
    <div
      className={`relative w-full my-4 p-1 px-3 text-black text-white ${
        showFollowers || showFollowings || openLikes || openComments
          ? "hidden"
          : "flex"
      } flex-col`}
    >
      <div className="flex px-2 relative">
        <div className="relative h-20 w-20 md:h-24 md:w-24 mr-5">
          {editProf && (
            <div
              className={`w-full h-full absolute rounded-full truncate ${
                profilePic ? "bg-blue-700" : "bg-slate-700"
              } z-10`}
            >
              {!profilePic ? (
                <CameraIcon
                  onClick={() => profileImageRef.current.click()}
                  className="h-10 w-10 md:h-14 md:w-14 btn absolute z-20 left-[24%] top-[24%] md:left-[20%] md:top-[20%]"
                />
              ) : (
                <button
                  disabled={loading}
                  onClick={() => setProfilePic("")}
                  className="absolute top-[40%] left-[12%] text-xs md:text-sm"
                >
                  {profilePic.name}
                </button>
              )}
            </div>
          )}
          <Image
            loader={imgLoader}
            src={user?.profImg ? user.profImg : user?.image ? user.image : require("../public/checker.png")}
            layout="fill"
            loading="eager"
            alt="profile"
            className="rounded-quad"
          />
        </div>
        {!editProf && (
        <div className="mt-2 flex flex-col">
          <div className="flex items-center">
            <h1 className="font-semibold text-sm">
              {user?.login}
            </h1>
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
          <h1 className="font-semibold text-lg">
            <span className="text-gray-400">~</span> {user?.fullname}
          </h1>
          <p className="text-sm text-gray-200">{user?.bio}</p>
        </div>
      )}

      {user?.login === visitor?.login && (
        <PencilAltIcon hidden={editProf} onClick={() => setEditProf(true)} className="btn"/>
      )}

        {editProf && (
          <div className="mt-5 w-full md:max-w-6xl relative">
            <input
              hidden
              type="file"
              typeof="image"
              alt="profile"
              ref={profileImageRef}
              onChange={(e) => addMedia(e.target.files[0])}
              required
            />
            <p className="text-xs ml-3">Name</p>
            <input
              className="bg-transparent border-none focus:ring-0 w-full"
              type="text"
              placeholder="Enter name"
              value={textName}
              onChange={(e) => setTextName(e.target.value)}
            />
            <div className="border-b-2 ml-3 mr-3"></div>
            <p className="mt-5 text-xs ml-3">Bio</p>
            <input
              className="bg-transparent border-none focus:ring-0 w-full"
              type="text"
              placeholder="Enter bio"
              value={textBio}
              onChange={(e) => setTextBio(e.target.value)}
            />
            <div className="border-b-2 ml-3 mr-3"></div>
            <div className="relative h-10">
              <div className="flex space-x-4 absolute bottom-1 right-3 text-white text-sm font-semibold">
                <button
                  disabled={loading}
                  onClick={saveEditing}
                  className="bg-blue-500 w-20 h-7 rounded-lg"
                >
                  Save
                </button>
                <button
                  disabled={loading}
                  onClick={cancelEditing}
                  className="bg-gray-500 w-20 h-7 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="absolute flex flex-col justify-center items-end gap-3 -top-5 right-0 flex w-64 xl:w-80 ml-10 justify-between md:max-w-2xl mt-10 px-4 text-lg">
          <div className="flex gap-5">
            <button className="flex flex-col items-center">
              <p className="font-bold">{posts}</p>
              <p className="text-sm mt-1 text-gray-200">Posts</p>
            </button>
            <button
              onClick={() => setShowFollowers(true)}
              className="flex flex-col items-center"
            >
              <p className="font-bold">{followers ? followers.length : 0}</p>
              <p className="text-sm mt-1 text-gray-200">Followers</p>
            </button>
            <button
              onClick={() => setShowFollowings(true)}
              className="flex flex-col items-center"
            >
              <p className="font-bold">{followings ? followings.length : 0}</p>
              <p className="text-sm mt-1 text-gray-200">Followings</p>
            </button>
          
            {/* <div onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? (
                <MoonIcon className="h-8 w-8 my-2 btn" />
              ) : (
                <SunIcon className="h-8 w-8 my-2 btn" />
              )}
            </div> */}
            {visitor?.login === user?.login && (
              <LogoutIcon onClick={handleSignOut} className="h-8 w-8 my-2 btn" />
            )}
          </div>
          <div className="flex gap-2">
            <div
              className={`bg-[#3e3e3e] px-3 text-sm text-center py-1 rounded-md font-semibold transition-opacity duration-300 ${
                user?.login &&
                visitor?.login !== user?.login &&
                followings
                  ? "opacity-100"
                  : "opacity-0"
              }`}
            >
              <span className={followYou ? "text-green-500" : "text-red-500"}>
                {followYou ? "Follows You" : "Not Follows You"}
              </span>
            </div>
            {user?.login !== visitor?.login && (
              <button
                onClick={!hasFollowed ? followUser : unFollowUser}
                className="px-3 py-1 bg-[#171717] rounded-md hover:bg-[#3e3e3e] text-sm text-white font-semibold shadow-sm"
              >
                {hasFollowed ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>
      </div>
  );
};

export default ProfileSec;
