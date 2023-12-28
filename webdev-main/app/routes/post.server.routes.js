const posts = require('../controllers/post.server.controllers');
const auth= require('../lib/authentication');

module.exports = function(app){

app.route('/posts')
    .post(auth.isAuthenticated,posts.add_post);
    
app.route('/posts/:post_id')
    .get(posts.get_post) 

app.route('/posts/:post_id')
    .patch(auth.isAuthenticated ,posts.update_post)

app.route('/posts/:post_id')
    .delete(auth.isAuthenticated ,posts.delete_post);

app.route('/posts/:post_id/like')
    .post(auth.isAuthenticated ,posts.add_like)

    app.route('/posts/:post_id/like')
    .delete(auth.isAuthenticated ,posts.remove_like);



};