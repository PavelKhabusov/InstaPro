import { db, onUserAuthStateChanged } from "../firebase";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { UserAddIcon, UserGroupIcon, SearchIcon } from "@heroicons/react/solid";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useRouter } from "next/router";
import Loading from "../components/Loading";
import {
  getValidUsers,
  getOtherEmail,
  getAllUsers,
  getUser
} from "../utils/utilityFunctions";
import { uuidv4 } from "@firebase/util";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatList from "../components/ChatList";
import { useRecoilState } from "recoil";
import { themeState } from "../atoms/states";
import Image from "next/image";
import sendPush from "../utils/sendPush";

const Chats = () => {
  const imgLoader = ({ src }) => { return `${src}`; };
  const [currentUser, setUser] = useState(null); // State to hold the user session

  useEffect(() => {
    const unsubscribe = onUserAuthStateChanged((user) => {
      if (user) setUser(user); 
      else setUser(null); 
    });
    return () => unsubscribe();
  });


  const router = useRouter();
  const [validChats, setValidChats] = useState([]);
  const [validGroups, setValidGroups] = useState([]);
  const [search, setSearch] = useState("");
  const values = getAllUsers();
  const [darkMode, setDarkMode] = useRecoilState(themeState);
  const [user] = useDocumentData(doc(db, `profile/${currentUser?.email.split("@")[0]}`));
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    let unsubGroups;
    let unsubChats;
    const getUserData = async () => {
      if (!currentUser) return null; // If no current user, return null
      
      // Attempt to get the user from the provided function
      const fetchedUser = await getUser(currentUser?.email.split("@")[0], values);
      return fetchedUser;
    };

    const fetchData = async () => {
      if (!user) {
        user = await getUserData();
        // fetchData();
      } else {
        if (user) {
          // Now that user is available, set up Firestore listeners
          unsubGroups = onSnapshot(
            query(collection(db, "groups"), orderBy("timeStamp", "desc")),
            (gRes) => {
              if (!gRes.empty) {
                setValidGroups(getValidUsers(getArray(gRes.docs), user?.login));
              }
            }
          );

          unsubChats = onSnapshot(
            query(collection(db, "chats"), orderBy("timeStamp", "desc")),
            (cRes) => {
              console.log(cRes);
              if (!cRes.empty) {
                setValidChats(getValidUsers(getArray(cRes.docs), user?.login));
              }
            }
          );
        }
      }
    };

    fetchData(); // Initiate the data fetch

    // Cleanup function
    return () => {
      if (unsubChats) unsubChats();
      if (unsubGroups) unsubGroups();
    };
  }, [currentUser, user, router]);

  const getArray = (documents) => {
    const arr = [];
    documents.forEach((user) => {
      arr.push({
        id: user.id,
        ...user.data(),
      });
    });
    return arr;
  };

  const chatExits = (email) => {
    let valid = false;
    validChats?.map((docf) => {
      if (
        (docf.users[0].login === user.login &&
          docf.users[1].login === email) ||
        (docf.users[1].login === user.login &&
          docf.users[0].login === email)
      ) {
        if (!docf.name) {
          valid = true;
        }
        stop();
      }
    });
    return valid;
  };

  const addUser = async () => {
    setMenu(false);
    const uName = prompt("Enter login: ")?.split(" ").join("").toLowerCase();
    if (uName?.length > 0) {
      if (uName !== user.login) {
        if (!chatExits(uName)) {
          const ind = values?.findIndex((user) => user.login === uName);
          if (ind !== -1) {
            await addDoc(collection(db, "chats"), {
              users: [
                { username: values[ind].username, login: values[ind].login },
                { username: user.username, login: user.login },
              ],
              timeStamp: serverTimestamp(),
            }).then(() => {
              actions("chat", ind);
            });
          } else {
            toast.warn("User Not Found 😐", { toastId: "notFound" });
          }
        } else {
          toast.error("User Already Exist 🙂", { toastId: "exits" });
        }
      } else {
        toast.error("You can not add yourselt 🙄", { toastId: "eorr" });
      }
    }
  };

  const createGroup = async () => {
    setMenu(false);
    const ref = uuidv4().split("/")[0];
    const newUser = prompt("Enter User Login: ")
      ?.split(" ")
      .join("")
      .toLowerCase();
    if (newUser?.length > 0) {
      const ind = values?.findIndex((user) => user.login === newUser);
      if (ind !== -1) {
        const name = prompt("Enter Group Name: ") || "MyGroup";
        await setDoc(doc(db, `groups/group-${ref}`), {
          name: name,
          image:
            "https://www.hotelbenitsesarches.com/wp-content/uploads/community-group.jpg",
          users: [
            { username: values[ind].displayName, login: values[ind].login },
            { username: user.displayName, login: user.login, creator: true },
          ],
          timeStamp: serverTimestamp(),
        }).then(() => {
          actions("group", ind, name);
        });
      } else {
        toast.warn("User Not Found 😐", { toastId: "notFound" });
      }
    }
  };

  const actions = (create, ind, name) => {
    toast.success(create + " created Successfully 🤞", { toastId: "added" });
    sendPush(
      values[ind]?.uid,
      "",
      user?.fullname || user?.username,
      `has added you in ${create === "group" ? name : "chat"}`,
      user?.profImg || user?.image,
      "https://insta-pro.vercel.app/chats"
    );
  };

  const removeChat = (id) => {
    setValidChats(validChats.filter((chat) => chat.id !== id));
  };

  const removeGroup = (id) => {
    setValidGroups(validGroups.filter((group) => group.id !== id));
  };

  const redirect = (id) => {
    router.push(`/chat/${id}`);
  };

  return (
    !user ? (
      <Loading />
    ) : (
    <>
      <div className="container mt-4">
        <Header setDarkMode={setDarkMode} darkMode={darkMode} user={user} />
        <h2 className="lang" key="menuTitle">Чаты</h2>
        {/* <img alt="Light ray background" src="../../public//bghero.png" className="bghero"></img> */}
        <div className="privacy feed scroll-smooth relative md:w-[700px] w-full mx-auto">
          <div className="radial"></div>
          <div className="relative w-full flex items-center justfy-between">
            <button className="flex text-lg w-full justify-center items-center p-3 mb-2 shadow-md">
              <div className="relative w-12 h-12">
                <Image
                  unoptimized
                  loader={imgLoader}
                  loading="eager"
                  layout="fill"
                  src={user?.profImg ? user.profImg : user?.image ? user.image : require("../public/checker.png")}
                  alt="story"
                  className="rounded-full"
                />
              </div>
              <h1
                onClick={() =>
                  router.push(`/profile/${user?.login}`)
                }
                className="font-semibold ml-2"
              >
                {user?.fullname ? user.fullname : user?.username}
              </h1>
            </button>
            <button
              onClick={() => setMenu((prev) => !prev)}
              className="absolute right-3 top-4 items-center p-2 text-sm font-medium text-center rounded-lg focus:ring-0 focus:outline-none text-white bg-gray-800"
              type="button"
            >
              <div className="flex space-x-2">
                Create
                {menu ? (
                  <svg
                    className="w-6 h-6"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                )}
              </div>
            </button>
            <div
              hidden={!menu}
              className="absolute right-3 top-16 z-10 w-44 rounded divide-y shadow bg-gray-700 divide-gray-600"
            >
              <ul className="py-1 text-sm text-gray-200">
                <li>
                  <button
                    onClick={addUser}
                    className="flex items-center w-full py-2 px-4 hover:bg-gray-600 hover:text-white text-left"
                  >
                    <UserAddIcon className="mr-2 h-5 w-5" />
                    Create Chat
                  </button>
                </li>
                <li>
                  <button
                    onClick={createGroup}
                    className="flex items-center w-full py-2 px-4 hover:bg-gray-600 hover:text-white text-left"
                  >
                    <UserGroupIcon className="mr-2 h-5 w-5" />
                    Create Group
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="mx-3 mb-5 flex">
            <div className="flex items-center space-x-3 m-auto h-9 bg-gray-700 rounded-lg p-3 w-full text-sm md:w-[60%] bg-opacity-40">
              <SearchIcon className="h-4 w-4" />
              <input
                className="bg-transparent outline-none focus:ring-0 placeholder:text-gray-300"
                placeholder="search username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-1">
            {validGroups && validChats && values === undefined ? (
              <Loading page={router?.pathname} />
            ) : (
              <>
                {validGroups.length > 0 && (
                  <p className="font-bold ml-4 my-2">Groups</p>
                )}
                {validGroups.map((group, i) => (
                  <ChatList
                    toast={toast}
                    collection={collection}
                    removeGroup={removeGroup}
                    doc={doc}
                    key={i}
                    visitor={user}
                    group={group}
                    id={group.id}
                    redirect={redirect}
                  />
                ))}
                {validChats.length > 0 && (
                  <p
                    className={`font-bold ml-4 ${
                      validGroups.length > 0 ? "mt-4" : "mt-1"
                    } mb-2`}
                  >
                    Messages
                  </p>
                )}
                {validChats
                  ?.filter((curuser) =>
                    getOtherEmail(curuser, user?.login)?.includes(
                      search.toLowerCase()
                    )
                  )
                  .map((curuser, i) => (
                    <ChatList
                      toast={toast}
                      removeChat={removeChat}
                      collection={collection}
                      doc={doc}
                      key={i}
                      visitor={user}
                      id={curuser.id}
                      redirect={redirect}
                      user={curuser.users[0].login === user.login ? curuser.users[1] : curuser.users[0]}
                    />
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  ));
};

export default Chats;
