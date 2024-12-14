import { ArrowLeftIcon, SearchIcon } from "@heroicons/react/outline";
import { onUserAuthStateChanged } from "../firebase";
import Image from "next/image";
import { useState, useEffect } from "react";
import Moment from "react-moment";
import { getUserProfilePic, getUser, getName, getAdminLogins } from "../utils/utilityFunctions";

const Likes = ({ setOpenLikes, users, likes, router }) => {
  const imgLoader = ({ src }) => { return `${src}`; };
  const [search, setSearch] = useState("");
  const [currentUser, setUser] = useState(null); // State to hold the user session

  useEffect(() => {
    const unsubscribe = onUserAuthStateChanged((user) => {
      if (user) setUser(user); 
      else setUser(null); 
    });
    return () => unsubscribe();
  });


  return (
    <div className="w-full md:max-w-3xl m-auto bg-gray-100 text-gray-200 bg-gray-900 fixed top-0 z-50 h-screen flex flex-col">
      {/* likes header */}
      <section className="w-full md:max-w-3xl bg-gray-900">
        <div className="flex space-x-3 px-3 items-center bg-gray-900 text-white h-16">
          <ArrowLeftIcon
            className="h-6 w-6 cursor-pointer"
            onClick={() => setOpenLikes(false)}
          />
          <h1 className="text-lg font-bold">Likes</h1>
        </div>

        <div className="mx-3 mt-5 flex">
          <div className="flex items-center space-x-3 m-auto h-9 bg-slate-200 bg-gray-700 rounded-lg p-3 w-full text-sm md:w-[60%] bg-opacity-40">
            <SearchIcon className="h-4 w-4" />
            <input
              className="bg-transparent outline-none focus:ring-0"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="mx-3 mt-5 flex justify-between items-center mb-2">
          <h1 className="font-semibold">LIKED BY</h1>
          {likes?.length && (
            <p className="text-gray-400 text-sm">
              {likes.length} {likes.length === 1 ? "Like" : "Likes"}
            </p>
          )}
        </div>
      </section>

      <section className="flex-1 overflow-y-scroll scrollbar-hide bg-white bg-gray-900">
        {likes
          ?.filter((user) => user.username.toLowerCase().includes(search.toLowerCase()))
          .map((like, i) => (
            <div
              key={i}
              className="mt-1 px-3 w-full flex justify-between items-center"
            >
              <div className="relative h-16 flex items-center w-full">
                <div className="relative h-14 w-14">
                  <Image
                    unoptimized
                    loader={imgLoader}
                    loading="eager"
                    alt="image"
                    src={getUserProfilePic(like.login, users)}
                    layout="fill"
                    className="rounded-full"
                  />
                  <span
                    className={`top-0 right-0 absolute  w-4 h-4 ${
                      getUser(like.login, users)?.active
                        ? "bg-green-400"
                        : "bg-slate-400"
                    } border-[3px] border-gray-900 rounded-full`}
                  ></span>
                </div>

                <div className="ml-3">
                  <h1
                    onClick={() => router.push(`/profile/${like.login}`)}
                    className="font-semibold mt-1 cursor-pointer flex space-x-1 items-center"
                  >
                    {getName(getUser(like.login, users))}
                    {getAdminLogins().includes(like.login) && (
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
                  </h1>
                  {like.timeStamp && (
                    <Moment
                      className="text-gray-400 text-xs align-text-top"
                      fromNow
                    >
                      {like.timeStamp.toDate()}
                    </Moment>
                  )}
                </div>
              </div>
              {like.login !== currentUser?.email.split("@")[0] && (
                <button
                  onClick={() => router.push(`/profile/${like.login}`)}
                  className="bg-gray-900 bg-slate-600 text-white bg-opacity-80 bg-opacity-90 border-gray-400 py-1 px-6 text-xs font-semibold rounded-md"
                >
                  Profile
                </button>
              )}
            </div>
          ))}
      </section>
    </div>
  );
};

export default Likes;
