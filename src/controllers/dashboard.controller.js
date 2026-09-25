import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
      const userId =req.user._id
      const videos=await Video.find({owner:userId})
      const totalVideos =videos.length
      const totalViews =videos.reduce((sum,video)=>{
        return sum + video.views
      },0)

      const totalSubscriber = await Subscription.countDocuments({
        channel:userId
      })
        
      const videoIds = videos.map(video => video._id)
      const totalLikes = await Like.countDocuments({
        video:{$in:videoIds}
    })

    const stats = {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes
    }

    return res.status(200).json(
        new ApiResponse(200,stats,"Channel stats fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user._id

    const videos = await Video.find({
        owner:userId
    })
    .populate("owner","username avatar")
    .sort({createdAt:-1})

    return res.status(200).json(
        new ApiResponse(200,videos,"Channel videos fetched successfully")
    )

})

export {
    getChannelStats, 
    getChannelVideos
    }