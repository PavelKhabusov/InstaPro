import { ArrowLeftIcon, SearchIcon } from "@heroicons/react/outline";
import { useEffect, useState } from "react";
import Moment from "react-moment";
import Image from "next/image";
import { getUserProfilePic, getName, getUser, getAdminLogins } from "../utils/utilityFunctions";
const randomImg = require("../public/checker.png");

const FollowList = ({
  setShowFollowers,
  setShowFollowings,
  showFollowers,
  showFollowings,
  follow,
  followers,
  followings,
  router,
  users,
  login,
}) => {
  const [show, setShow] = useState([]);
  const [search, setSearch] = useState("");
  const imgLoader = ({ src }) => { return `${src}`; };

  useEffect(() => {
    if (followers) {
      setShow([...followers]);
    } else if (followings) {
      setShow([...followings]);
    }
  }, [followers, followings]);

  return (
    <div hidden={showFollowers || showFollowings ? false : true}>
      {/* Followers header */}
      <section className="sticky top-0 z-40 w-full md:max-w-3xl">
        <div className="flex space-x-3 px-3 items-center bg-blue-500 bg-gray-900 text-white h-16">
          <ArrowLeftIcon
            className="h-6 w-6 cursor-pointer"
            onClick={
              follow
                ? () => setShowFollowers(false)
                : () => setShowFollowings(false)
            }
          />
          <h1 className="text-lg font-bold">
            {follow ? "Followers" : "Followings"}
          </h1>
        </div>

        <div className="mx-3 mt-5 flex border-b-2 pb-4 border-gray-700">
          <div className="flex items-center space-x-3 m-auto h-9 bg-slate-100 bg-gray-700 rounded-lg p-3 w-full text-sm md:w-[60%] bg-opacity-40">
            <SearchIcon className="h-4 w-4" />
            <input
              className="bg-transparent outline-none focus:ring-0"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="flex-1 overflow-y-scroll scrollbar-hide">
        <div className="mx-3">
          {show
            ?.filter((curruser) =>
              curruser.login.includes(search.toLowerCase())
            )
            .map((user, i) => (
              <div
                key={i}
                className="py-1 mb-1 w-full flex justify-between items-center"
              >
                <div className="h-16 flex items-center w-full">
                  <div className="relative h-14 w-14">
                    <Image
                      unoptimized
                      loader={imgLoader}
                      loading="eager"
                      alt="image"
                      src={
                        users
                          ? getUserProfilePic(user.login, users)
                          : randomImg
                      }
                      layout="fill"
                      className="rounded-full"
                    />
                    <span
                      className={`top-0 right-0 absolute  w-4 h-4 ${
                        getUser(user.login, users)?.active
                          ? "bg-green-400"
                          : "bg-slate-400"
                      } border-[3px] border-gray-900 rounded-full`}
                    ></span>
                  </div>
                  <div className="ml-3">
                    <button
                      onClick={() => router.push(`/profile/${user.login}`)}
                      className="font-bold cursor-pointer flex items-center"
                    >
                      {getName(getUser(user.login, users))}
                      {getAdminLogins().includes(user.login) && (
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
                    </button>
                    {user.timeStamp && (
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-400 text-xs">Followed:</span>
                        <Moment
                          className="text-gray-400 text-xs align-text-top"
                          fromNow
                        >
                          {user.timeStamp.toDate()}
                        </Moment>
                      </div>
                    )}
                  </div>
                </div>
                {user.login !== login && (
                  <button
                    onClick={() => router.push(`/profile/${user.login}`)}
                    className="bg-slate-600 py-1 px-6 text-xs font-semibold rounded-md text-white"
                  >
                    Profile
                  </button>
                )}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default FollowList;
