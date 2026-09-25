import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {

    const {page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId} = req.query

    const filter = {
        isPublished: true
    }

    if (query) {
        filter.$or = [
            {title: {$regex: query, $options: "i"}},
            {description: {$regex: query, $options: "i"}}
        ]
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID")
        }

        filter.owner = userId
    }

    const sort = {
        [sortBy]: sortType === "asc" ? 1 : -1
    }

    const videos = await Video.find(filter)
        .populate("owner", "username avatar")
        .sort(sort)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Videos fetched successfully"
        )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

      if (!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }


    const {videoFile} = req.files.videoFile?.[0]
    const {thumbnailFile}= req.files.thumbnailFile?.[0]  

     if (!videoFile) {
        throw new ApiError(400, "Video file is required")
    }

    if (!thumbnailFile) {
        throw new ApiError(400, "Thumbnail is required")
    }
    
     const video =await uploadOnCloudinary(videoFile.path)
     const thumbnail =await uploadOnCloudinary(thumbnailFile.path)

     if(!video) {
         throw new ApiError(500, "Video upload failed")
     }
     if(!thumbnail) {
          throw new ApiError(500, "Thumbnail upload failed")
     }

      const newVideo = await Video.create({
       videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: video.duration,
        owner: req.user._id

      })
      
       return res.status(201).json(
        new ApiResponse(
            201,
            newVideo,
            "Video published successfully"
        )
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
     
     if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
     const video = await Video.findById(videoId).populate("owner","username avatar")


     if(!video){
        throw new ApiError(404,"Video not found ")
     }

     return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video fetched successfully"
        )
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {title, description} = req.body
    //TODO: update video details like title, description, thumbnail
     if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found ")
     }

      if (video.owner.toString() != req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this video")
    }
       
    if (title) {
        video.title = title
    }

    if (description) {
        video.description = description
    }
    
     if (req.file){
         const thumbnail =await uploadOnCloudinary(req.file.path)

         if(!thumbnail) throw new ApiError(500,"Thumbnail upload failed");
         video.thumbnail=thumbnail.url;

     }

     await video.save()
     return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video updated successfully"
        )

    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
     if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found ")
     }
    
      if (video.owner.toString() != req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this video")
    }

     await video.deleteOne();
     return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Video deleted successfully"
        )
     )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params


})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
