import {
  useCollection,
  useCollectionData,
} from "react-firebase-hooks/firestore";
import { query, collection, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

const getChatMessages = (id, lim = 15) => {
  const [messages, loading] = useCollection(
    query(
      collection(
        db,
        `${id?.includes("group") ? "groups" : "chats"}/${id}/messages`
      ),
      orderBy("timeStamp", "desc"),
      limit(lim)
    )
  );
  if (!loading) {
    return messages.docs;
  }
};

const getOtherEmail = (all, login) => {
  return all?.users?.filter(
    (user) => user.login !== login
  )[0]?.username;
};

const getAllUsers = () => {
  const [values] = useCollectionData(collection(db, "profile"));
  return values;
};

const getValidUsers = (allUsers, currentUser) => {
  const validUsers = [];
  allUsers?.map((doc) => {
    doc?.users?.map(({ login }) => {
      if (
        login === currentUser &&
        validUsers.findIndex((e) => e.id === doc.id) === -1
      ) {
        console.log(doc);
        validUsers.push(doc);
      }
    });
  });
  return validUsers;
};

const getUserProfilePic = (login, users) => {
  let profileImg;
  users?.forEach((user) => {
    if (user.login === login) {
      profileImg = user.profImg ? user.profImg : user.image;
    }
  });
  return profileImg;
};

const getUser = (login, users) => {
  const currUser = users?.filter((user) => user.login === login)[0];
  return currUser;
};

const getName = (user) => {
  return user?.fullname ? user.fullname : user?.displayName;
};

const Modal = ({ src, onClose }) => {
  return (
    <div className="modal">
      <span className="close" onClick={onClose}>
        &times;
      </span>
      <img className="modal-content" src={src} alt="modal" />
    </div>
  );
};

const getAdminLogins = () => {
  return ["xabusva20", "xabusva", "idemian"];
}

export {
  getChatMessages,
  getOtherEmail,
  getAllUsers,
  getAdminLogins,
  getUser,
  getName,
  getValidUsers,
  getUserProfilePic,
  Modal,
};
