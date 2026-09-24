import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
/*
  1. Get tweet content from req.body.

2. Check whether content is provided.

3. Get logged-in user's ID from req.user._id.

4. Create a Tweet with:
      content
      owner

5. Return the created tweet.

     */

     const {content} = req.body

     if(!content){
        throw new ApiError(400,"Tweet content is required")
     }

     const tweet =await Tweet.create({
        content: content,
        owner: req.user._id
     })

     return res.status(201).json(
        new ApiResponse(
            201,
            tweet,
            "Tweet created successfully"
        )
     )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    // Get userId from URL params
    const {userId}=req.params
    
    //check if user exist
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id")
    }
     
    //find all tweets done by owner 
    const tweets =await Tweet.find({
        owner:userId
    })
    
    //return the response
     return res.status(200).json(
        new ApiResponse(
            200,
            tweets,
            "Uer tweets fetched successfully"
        )
     )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    //get tweetId and content 
const {tweetId}=req.params
const {content}=req.body

     //check 
     if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    if (!content) {
        throw new ApiError(400, "Tweet content is required")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() != req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this tweet")
    }

    tweet.content = content

    await tweet.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            tweet,
            "Tweet updated successfully"
        )
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() != req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this tweet")
    }

    await tweet.deleteOne()

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Tweet deleted successfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}