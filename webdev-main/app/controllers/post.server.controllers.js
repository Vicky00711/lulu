const posts = require("../models/post.models");
const users = require("../models/user.models");
const config = require("../../config/config");
const Joi = require("joi");

const add_new_posts = (req, res) => {
  const schema = Joi.object({
    text: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);

  if (error) return res.sendStatus(400);

  let post = Object.assign({}, req.body);
  let token = req.get(config.get("authToken"));
  users.getIdFromToken(token, function (err, user_id) {
    if (err) return res.status(500).send(err);
    else {
      posts.addingPost(user_id, post, (err, id) => {
        if (err) {
          return res.sendStatus(500);

          
        } 
       
        
        else {
          return res.status(201).send({ post_id: id });
        }
      });
    }
  });
};

const get_post = (req, res) => {
  let post_id = parseInt(req.params.post_id);
  posts.getSinglePost(post_id, (err, result) => {
    if (err === 404) return res.sendStatus(404);
    if (err) return res.sendStatus(500);

    return res.status(200).send(result);
  });
};

const updating_a_post = (req, res) => {
  let post_id = parseInt(req.params.post_id);
  let token = req.get(config.get("authToken"));
  users.getIdFromToken(token, function (err, id) {
    if (err) res.send(err);
    else {
      posts.getSinglePost(post_id, (err, post) => {
        if (err === 404) return res.sendStatus(404);
        if (err) return res.sendStatus(500);

        const schema = Joi.object({
          text: Joi.string().required(),
        });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        if (post.author.user_id != id) {
            return res.status(403).send("You can only update your own posts");
          }
        if (post.text === req.body.text) {
          res.sendStatus(200);
        } else {
          console.log(post.author.user_id + " " + id);
           
            let text = req.body.text;
            posts.updatePost(post_id, text, id, (err) => {
              if (err) return res.sendStatus(500);
              else {
                return res.sendStatus(200);
              }
            });
          }
        
      });
    }
  });
};

const delete_post = (req, res) => {
  let post_id = parseInt(req.params.post_id);
  let token = req.get(config.get("authToken"));
  users.getIdFromToken(token, function (err, id) {
    if (err) res.send(err);
    else {
      posts.getSinglePost(post_id, (err, post) => {
        if (err === 404) return res.sendStatus(404);
        if (err) return res.sendStatus(500);
        else {
          if (post.author.user_id != id) {
            return res
              .status(403)
              .send("Cannot delete the post authored by someone else ");
          } else {
            posts.removePost(post_id, id, function (err) {
              if (err) {
                return res.sendStatus(400);
              } else {
                return res.sendStatus(200);
              }
            });
          }
        }
      });
    }
  });
};

const like_post = (req, res) => {
  let post_id = parseInt(req.params.post_id);
  let token = req.get(config.get("authToken"));
  users.getIdFromToken(token, function (err, id) {
    if (err) res.send(err);
    else {
      posts.getSinglePost(post_id, (err, post) => {
        if (err === 404) return res.sendStatus(404);
        if (err) return res.sendStatus(500);
        else {
          if (post.likes.find((like) => like.user_id === id)) {
            res.status(403).send("You cannot like the post twice ");
          } else {
            posts.like(post_id, id, function (err) {
              if (err) {
                return res.sendStatus(400);
              } else {
                return res.sendStatus(200);
              }
            });
          }
        }
      });
    }
  });
};

const unliking = (req, res) => {
  let post_id = parseInt(req.params.post_id);
  let token = req.get(config.get("authToken"));
  users.getIdFromToken(token, function (err, id) {
    if (err) res.send(err);
    else {
      posts.getSinglePost(post_id, (err, post) => {
        if (err === 404) return res.sendStatus(404);
        if (err) return res.sendStatus(500);
        else {
          if (post.likes.length === 0) {
            res.status(403).send("You cannot dislike the post twice ");
          } else {
            posts.removeLike(post_id, id, function (err) {
              if (err) {
                return res.sendStatus(400);
              } else {
                return res.sendStatus(200);
              }
            });
          }
        }
      });
    }
  });
};

module.exports = {
  add_new_posts: add_new_posts,
  get_post: get_post,
  updating_a_post: updating_a_post,
  delete_post: delete_post,
  like_post: like_post,
  unliking: unliking,
};
