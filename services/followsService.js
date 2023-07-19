//Impor model
const follow = require("../models/follows")

const followUserIds = async (identityUserId) => {
    try {
        //Get follows info
        let following = await follow.find({ "user": identityUserId })
            .select({ "followed": 1, "_id": 0 }).exec()


        let followers = await follow.find({ "followed": identityUserId })
            .select({ "user": 1, "_id": 0 }).exec()

        //Proccess Ids array
        let followingClean = []
        following.forEach(follow => {
            followingClean.push(follow.followed)
        });
        let followersClean = []
        followers.forEach(follow => {
            followersClean.push(follow.user)
        });
        return {
            following: followingClean,
            followers: followersClean
        }
    } catch (error) {
        return {};
    }
}



const followThisUser = async (identityUserId, profileUserId) => {

}
module.exports = {
    followUserIds
}