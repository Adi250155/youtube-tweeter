import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    /*         
    first check if already subscribed
   if yes, delete it
   if no, create a new subscription
    */
      
   if(!isValidObjectId(channelId)){
    throw new ApiError(400,"Invalid channel Id")
   }

   const existingSubscription = await Subscription.findOne({
            subscriber : req.user._id,
            channel:channelId
   })

   if(existingSubscription){
    await existingSubscription.deleteOne()

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Channel unsbscribed Successfully!"
        )
    )
   }

   const subscription = await Subscription.create({
            subscriber : req.user._id,
            channel:channelId
   })


  return res.status(201).json(
        new ApiResponse(
            201,
            subscription,
            "Channel sbscribed Successfully!"
        )
    )
   


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    /*
      1. Get channelId from req.params.

      2. Validate channelId.

      3. Find all subscriptions where:
      channel = channelId

      4. Populate `subscriber`
    → instead of getting only subscriber's ObjectId,
     get the subscriber's user details.

       5. Return the subscriber list.
    */
       if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const subscribers = await Subscription.find({
        channel: channelId
    }).populate("subscriber", "username")

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribers,
            "Subscribers fetched successfully"
        )
    )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
      /*

           1. Get subscriberId from req.params.

        2. Validate subscriberId.

       3. Find all subscriptions where:
      subscriber = subscriberId

        4. Populate "channel"
   → get the actual User/channel details.

        5. Return the subscribed channel list.
      */

     
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "Invalid subscriber ID")
     }

      const channels = await Subscription.find({
        subscriber:subscriberId,
      }).populate("channel","username avatar")
      
      return res.status(200).json(
        new ApiResponse(
            200,
            channels,
            "Subscribed channels fetched successfully"
        )
      )


})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}