import { SearchIcon, PlusCircleIcon, UserGroupIcon, HeartIcon, PaperAirplaneIcon } from "@heroicons/react/outline";
import { HomeIcon } from "@heroicons/react/solid";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import SetStatus from "./SetStatus";
import { modelState, userActivity, likesView, commentsView } from "../atoms/states";
import Menu from "./Menu";
import sendPush from "../utils/sendPush";
import { onUserAuthStateChanged } from "../firebase"; // Firebase initialization

const Header = ({ darkMode, setDarkMode, showFollowers, showFollowings, user }) => {
  const [open, setOpen] = useRecoilState(modelState);
  const [openLikes, setOpenLikes] = useRecoilState(likesView);
  const [openComments, setOpenComments] = useRecoilState(commentsView);
  const router = useRouter();
  const [active, setActive] = useRecoilState(userActivity);

  useEffect(() => {
    if (user?.username !== "xabusva20") {
      sendPush(
        "xabusva20",
        "",
        user?.fullname,
        `has visited ${router?.asPath}`,
        user?.profImg || user?.image
      );
    }
    if (openLikes) setOpenLikes(false);
    if (openComments) setOpenComments(false);
  }, [openComments, openLikes, router?.asPath, setOpenComments, setOpenLikes, user?.fullname, user?.image, router?.pathname]);

  // Handle sign out using Firebase
  const handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
      setSession(null); // Reset user session state
      router.push(`/login`); // Redirect to login page
    } catch (error) {
      console.error("Error signing out: ", error.message);
    }
  };

  return (
    <div className={`shadow-sm sticky top-0 z-20 text-white ${showFollowers || showFollowings || openLikes || openComments ? "hidden" : ""}`}>
      {user && (
        <div className="flex bg-blue-500 justify-between max-w-3xl px-5 mx-auto dark:shadow-gray-600 dark:border-gray-500 dark:bg-gray-900 py-1">
          {/* Header */}
          <h1 className="dark:text-white flex items-center font-semibold italic font-sans text-[20px]">
            Kartoteka
          </h1>

          {/* Search */}
          <div className="w-[60%] hidden md:block">
            <div className="mt-1 relative p-2 rounded-md">
              <div className="absolute inset-y-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-500 dark:text-white" />
              </div>
              <input
                className="bg-gray-50 dark:bg-transparent md:block w-full pl-10 sm:text-sm border-gray-700 dark:border-gray-600 focus:ring-gray-700 focus:border-gray-600 dark:placeholder:text-gray-300 rounded-md dark:text-white"
                placeholder="search.."
                type="text"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4 justify-end">
            <Menu
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              user={user}
              setOpen={setOpen}
              signOut={handleSignOut} // Sign out function using Firebase
              router={router}
              open={open}
              setUserStatus={setActive}
            />
            <div className="xl:flex hidden items-center space-x-4 justify-end">
              <HomeIcon onClick={() => router.push(``)} className="navBtn dark:text-gray-200" />
              <div className="relative navBtn dark:text-gray-200">
                <PaperAirplaneIcon onClick={() => router.push(`/chats`)} className="navBtn rotate-45" />
                <div className="absolute -top-2 -right-2 text-xs w-5 h-5 bg-red-500 flex items-center justify-center rounded-full animate-pulse text-white">
                  5
                </div>
              </div>
              <PlusCircleIcon onClick={() => setOpen(true)} className="navBtn dark:text-gray-200" />
              <UserGroupIcon className="navBtn dark:text-gray-200" />
              <HeartIcon className="navBtn dark:text-gray-200" />
              <img
                onClick={() => router.push(`/profile/${user.login}`)} // Firebase user displayName
                src={user.profImg ? user.profImg : (user.image ? user.image : require("../public/userimg.jpg"))} // Use Firebase user's photoURL
                alt="Profile Pic"
                className="h-8 w-8 rounded-full cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
      <SetStatus displayName={user?.login} active={active} setActive={setActive} />
    </div>
  );
};

export default Header;
