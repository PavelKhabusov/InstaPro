const getOtherEmail = (all, currentUser) => {
    return (all?.users.filter(user => user.username !== currentUser.username)[0]);
}

export default getOtherEmail;