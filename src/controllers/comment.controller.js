import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

     const comments =await Comment.find({video:videoId}).populate("owner","username avatar").skip((page-1)*limit).limit(Number(limit))

     return res.status(200).json(
        new ApiResponse(
            200,
            comments,
            "Comments fetched successfully"
        )
     )


})

const addComment = asyncHandler(async (req, res) => {
   /*
    Request
  ↓
Get videoId from URL
  ↓
Get content from request body
  ↓
Get logged-in user's ID from req.user
  ↓
Create Comment document
  ↓
Save to MongoDB
  ↓
Send response
*/

     const {videoId} =req.params
     const {content} =req.body

     const comment = await Comment.create({
        content,
        video:videoId,
        owner: req.user._id
     })

     return res.status(201).json(
        new ApiResponse(
            201,
            comment,
            "Comment added sucessfully"
        )
     )

})

const updateComment = asyncHandler(async (req, res) => {
    /*
    commentId from URL
      ↓
Find comment in MongoDB
      ↓
Check whether comment exists
      ↓
Check whether logged-in user is the owner
      ↓
Get new content from req.body
      ↓
Update comment
      ↓
Send response
    */

const {commentId}=req.params

const {content}=req.body

const comment= await Comment.findById(commentId);

if(!comment){
    throw new ApiError(404,"Comment not found")
}
if(comment.owner.toString() !=req.user._id.toString()){
    throw new ApiError(403,"You are not allowed to update this comment")
}

comment.content=content;

await comment.save()

return res.status(200).json(
    new ApiResponse(
        200,
        comment,
        "Comment updated successfully"
    )
)


})

const deleteComment = asyncHandler(async (req, res) => {
    /*
    Comment ID from URL
        ↓
Find comment in MongoDB
        ↓
Does comment exist?
        ↓
    No → 404 Error
        ↓
    Yes
        ↓
Check logged-in user == comment owner
        ↓
    No → 403 Error
        ↓
    Yes
        ↓
Delete comment
        ↓
Send success response
    */
    
    const {commentId}=req.params
    const comment =await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404,"Comment not found");
    }
    if(comment.owner.toString() !=req.user._id.toString()){
    throw new ApiError(403,"You are not allowed to delete this comment")
      }
    await comment.deleteOne();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Comment deleted successfully"
            )
        )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }