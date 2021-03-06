const express = require('express');
const asyncHandler = require('express-async-handler');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User, Event, Ticket, Comment } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { response } = require('express');

const router = express.Router();

const validateEvent = [
  check('title')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a title for your event.'),
  check('location')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a location for your event.'),
  check('datetime')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a date and time for your event.'),
  check('summary')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a description for your event.'),
  check('image')
    .exists({ checkFalsy: true })
    .withMessage('Please provide an image for your event.'),
  handleValidationErrors
]

router.get('/', asyncHandler(async(req, res) => {
  const events = await Event.findAll()
  return res.json(events)
}))

router.post('/', requireAuth, validateEvent, asyncHandler(async(req, res) => {
  const event = await Event.create(req.body)
  return res.json(event)
}))

router.get('/:id', asyncHandler(async(req, res) => {
  const event = await Event.findByPk(req.params.id, {
    include: [User]
  })
  return res.json(event)
}))

router.put('/:id', requireAuth, validateEvent, asyncHandler(async(req, res) => {
  const event = await Event.findByPk(req.params.id)
  const updatedEvent = await event.update(req.body)
  const updatedEventx = await Event.findByPk(updatedEvent.id, {
    include: [User]
  })
  return res.json(updatedEventx)
}))

router.delete('/:id', requireAuth, asyncHandler(async(req, res) => {
  const event = await Event.findByPk(req.params.id)
  if (!event) throw new Error('Cannot find event');
  await event.destroy();
  return res.json({})
}))


// ---------- Comments -----------

const validateComment = [
  check('comment')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a comment.'),
  handleValidationErrors
]

router.get('/:id/comments', asyncHandler(async(req, res) => {
  const comments = await Comment.findAll({
    where: { eventId: req.params.id },
    include: [User]
  })
  return res.json(comments)
}))

router.post('/:id/comments', requireAuth, validateComment, asyncHandler(async(req, res) => {
  const comment = await Comment.create(req.body)
  const commentx = await Comment.findByPk(comment.id, {
    include: [User]
  })
  return res.json(commentx)
}))

router.put('/:id/comments/:commentId', requireAuth, validateComment, asyncHandler(async(req, res) => {
  const comment = await Comment.findByPk(req.params.commentId)
  const updatedComment = await comment.update(req.body)
  const updatedCommentx = await Comment.findByPk(updatedComment.id, {
    include: [User]
  })
  return res.json(updatedCommentx)
}))

router.delete('/:id/comments/:commentId', requireAuth, asyncHandler(async(req, res) => {
  const comment = await Comment.findByPk(req.params.commentId)
  if (!comment) throw new Error('Cannot find comment');
  await comment.destroy();
  return res.json({comment})
}))



module.exports = router;
