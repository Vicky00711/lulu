
const db= require('../../database');

const addingPost= function(user_id,post, done){
    const sql='Insert into posts (text,date_published,author_id) Values (?,?,?)';
    let values=[post.text,Date.now(),user_id];

    db.run(sql,values, function(err){
        if (err){
            return done(err);
            
        }
        else {
            return done (null, this.lastID);
        }
    })
}
const getSinglePost=(post_id, done)=>{
    const sql= `Select p.post_id, p.date_published, p.text, u.user_id, u.first_name,
                u.last_name, u.username From posts p, users u Where p.post_id=? And p.author_id=u.user_id`;

    db.get(sql, [post_id], function(err, post_details){
        if (err) return done(err);
        if(!post_details) return done(404);

        const sql=`Select u.user_id, u.first_name, u.last_name, u.username From users u, likes l
                    where  l.post_id=? And l.user_id=u.user_id`;

        const likes=[];

        db.each(sql, [post_id], (err, row)=>{
            if(err) return done(err);

            likes.push({
                user_id: row.user_id,
                first_name: row.first_name,
                last_name: row.last_name,
                username: row.username
            })
        },(err, num_rows)=>{
            if (err) return done(err);

            return done(null,{
                post_id:post_details.post_id,
                timestamp: post_details.date_published,
                text:post_details.text,

                author:{
                    user_id:post_details.user_id,
                    first_name:post_details.first_name,
                    last_name:post_details.last_name,
                    username:post_details.username
                },
                likes:likes
            })
        })

    })
}

const updatePost= (post_id, new_text,id,done)=>{
    const sql= 'Update posts Set text=? Where post_id=? And author_id=?';
    db.run(sql, [new_text, post_id, id], (err)=>{
        return done(err);
    })
}
const getLikes = function(post_id, done){
    db.get(
        'SELECT post_id, user_id FROM likes WHERE post_id=?',
        [post_id],
        function(err, row){
          if (row && row.user_id){
            return done(null, row.user_id);
          }else{
            return done(null, null);
          } 
        }
    );
};
const like= ( post_id,id, done)=>{
    const query= 'Insert into likes (post_id,user_id) Values (?,?)';
    let values= [post_id,id];
    db.run(query, values, function (err, result){
        done(err);
    });
}

const removeLike= (post_id, id,done)=>{
    let query= 'Delete from likes Where post_id=? AND user_id=?';
    let values=[post_id,id];
    db.run(query, values, function (err, results){
        done(err);
    });
}

const removePost= (post_id,id, done)=>{
    let query= 'Delete from posts Where post_id=? and author_id=?';
    let values=[post_id,id];
    db.run(query, values, function (err, results){
        done(err);
    });
}

module.exports={
    addingPost:addingPost,
    getSinglePost:getSinglePost,
    updatePost:updatePost,
    like:like,
    removePost:removePost,
    removeLike:removeLike,
    like:like,
    getLikes:getLikes
}