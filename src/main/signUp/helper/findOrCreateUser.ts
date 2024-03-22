import { userProfileCache } from "../../cache";
import { userIf } from "../../interface/user";
import logger from "../../logger";
import setDataForUpdate from "./setDataForUpdate";
import DefaultDataGenerator from "../../defaultData";


async function findOrCreateUser(signUpData: userIf) {
  try {
    const { userId } = signUpData;
    let userProfile = await userProfileCache.getUserProfile(userId);
    logger.info(userId, "findOrCreateUser : getUserProfile :: ", userProfile);
    if (userProfile) {
      signUpData._id = userProfile._id;
      signUpData.tableId = userProfile.tableId;
      logger.info(userId, "findOrCreateUser : userProfile is avalible :: ", userProfile);
      // updating the user info
      const userProfileUpdateQuery: userIf = setDataForUpdate(signUpData);
      logger.info(userId, "findOrCreateUser : userProfileUpdateQuery ::", userProfileUpdateQuery );
      // update user info
      await userProfileCache.insertUserProfile(userId, userProfileUpdateQuery);
    } else {
      logger.info(userId, "findOrCreateUser : create data ::>>");

      // create new user
      const userDefaultData: userIf = DefaultDataGenerator.defaultUserData(signUpData);
      logger.info(userId, "findOrCreateUser : userDefaultData :: ", userDefaultData);
      
      // add user info
      await userProfileCache.insertUserProfile(userId, userDefaultData);
      userProfile = await userProfileCache.getUserProfile(userId);
      logger.info(userId, "findOrCreateUser : Create USer :: ", userProfile);
    }
    return userProfile;

  } catch (error) {
    logger.error("CATCH_ERROR :: findOrCreateUser :: signUpData :: ", signUpData, error);
    throw error;
  }
}

export = findOrCreateUser;