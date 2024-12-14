import { SearchIcon, PlusCircleIcon, BookmarkIcon, HeartIcon, PaperAirplaneIcon } from "@heroicons/react/outline";
import { HomeIcon } from "@heroicons/react/solid";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import SetStatus from "./SetStatus";
import { modelState, userActivity, likesView, commentsView } from "../atoms/states";
import Menu from "./Menu";
import sendPush from "../utils/sendPush";
import Login from "../pages/login";
import { getAdminLogins } from "../utils/utilityFunctions";

const Header = ({ darkMode, setDarkMode, showFollowers, showFollowings, user }) => {
  const [open, setOpen] = useRecoilState(modelState);
  const [openLikes, setOpenLikes] = useRecoilState(likesView);
  const [openComments, setOpenComments] = useRecoilState(commentsView);
  const router = useRouter();
  const [active, setActive] = useRecoilState(userActivity);

  useEffect(() => {
    if (!getAdminLogins().includes(user?.login)) {
      sendPush(
        user?.login,
        "",
        user?.fullname,
        `has visited ${router?.asPath}`,
        user?.profImg || user?.image
      );
    }
    if (openLikes) setOpenLikes(false);
    if (openComments) setOpenComments(false);
  });

  const [showLogin, setShowLogin] = useState(false);

  const toggleLogin = () => {
    setShowLogin(!showLogin);
  };

  // close login on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLogin && !event.target.closest(".login") && !event.target.closest(".loginbtn")) {
        setShowLogin(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showLogin]);

  // Handle sign out using Firebase
  const handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
      // setSession(null); // Reset user session state
      router.push(`/`); // Redirect to login page
    } catch (error) {
      console.error("Error signing out: ", error.message);
    }
  };

  return (
    <div className={`shadow-sm sticky top-0 z-20 text-white ${showFollowers || showFollowings || openLikes || openComments ? "hidden" : ""}`}>
      <div className="flex justify-between max-w-3xl px-5 mx-auto head py-1">
        {/* Header */}
        <h1 onClick={() => router.push(`/`)} className="text-white cursor-pointer flex items-center font-semibold italic font-sans text-[20px]">
          Kartoteka
        </h1>

        {/* Search */}
        {/* <div className="w-[60%] hidden md:block">
          <div className="mt-1 relative p-2 rounded-md">
            <div className="absolute inset-y-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-500 text-white" />
            </div>
            <input
              className="bg-gray-50 bg-transparent md:block w-full pl-10 sm:text-sm border-gray-700 border-gray-600 focus:ring-gray-700 focus:border-gray-600 placeholder:text-gray-300 rounded-md text-white"
              placeholder="search.."
              type="text"
            />
          </div>
        </div> */}

        {/* Right Section */}
        <div className="flex items-center space-x-4 justify-end">
          {/* <Menu
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            user={user}
            setOpen={setOpen}
            signOut={handleSignOut} // Sign out function using Firebase
            router={router}
            open={open}
            setUserStatus={setActive}
          /> */}
          <div className="h-12 flex items-center space-x-4 justify-end">
            {/* <HomeIcon onClick={() => router.push(`/`)} className="navBtn text-gray-200" /> */}
            {user && (
              <>
                <div className="relative navBtn text-gray-200">
                  <PaperAirplaneIcon onClick={() => router.push(`/chats`)} className="navBtn rotate-45" />
                  {/* <div className="absolute -top-2 -right-2 text-xs w-5 h-5 bg-red-500 flex items-center justify-center rounded-full animate-pulse text-white">
                    5
                  </div> */}
                </div>
                {getAdminLogins().includes(user?.login) && <PlusCircleIcon onClick={() => setOpen(true)} className="navBtn text-gray-200" />}
                <BookmarkIcon onClick={() => router.push(`/profile/${user.login}/bookmarks`)} className="navBtn text-gray-200" />
              </>  
            )}{/* <HeartIcon className="navBtn text-gray-200" /> */}
            <img
              onClick={() => {
                user ? router.push(`/profile/${user.login}`) : toggleLogin();
              }} // Firebase user displayName
              src={user?.profImg ? user.profImg : (user?.image ? user.image : require("../public/checker.png").default.src)} // Use Firebase user's photoURL
              alt="Profile Pic"
              className={`h-8 w-8 rounded-quad ${user ? "" : "loginbtn"} cursor-pointer`}
            />

            {!user && showLogin && (
              <Login />
            )}
          </div>
        </div>
      </div>
      <SetStatus displayName={user?.login} active={active} setActive={setActive} />
    </div>
  );
};

export default Header;
