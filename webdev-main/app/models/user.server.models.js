const db= require('../../database');
const crypto= require('crypto');

const getHash= function(password, salt){
    return crypto.pbkdf2Sync(password, salt, 1000000, 256, 'sha256').toString('hex');
}



const getIdFromToken= function(token, done){
    if (token===undefined||token===null){
        return done(true)// error occured user not logged in
    }
    else{
        db.get('Select user_id From users Where session_token=?', [token], function(err,row){
            if (row){
                return done(null, row.user_id);
            }
            else {
               return  done(err, null);
            }
        })
    }
};







const insert = function (user, done) {
    const salt = crypto.randomBytes(64);
    const hash = getHash(user.password, salt);
    let values = [user.first_name, user.last_name, user.username, hash, salt.toString('hex')];
    const sql = 'INSERT INTO users (first_name, last_name, username, password, salt) VALUES (?, ?, ?, ?, ?)';
  
    db.run(sql, values, function (err) {
      if (err) {
        console.log(err);
        done(err); // Pass the error to the callback
      } else {
        return done(false,this.lastID); // Pass the entire result to the callback
      }
    });
  };

  const authenticate = function(username, password, done){
    db.get(
        'SELECT user_id, password, salt FROM users WHERE (username=?)',
        [username],
        function(err, row) {

            if (err || !row){
                console.log("AUTH 1", err, row);
                return done(true); // return error = true (failed auth)
            }else{

                if(row.salt == null){
                    row.salt = '';
                }

                let salt = Buffer.from(row.salt, 'hex');

                if (row.password === getHash(password, salt)){
                    return done(false, row.user_id);
                }else{
                    console.log("failed password check");
                    return done(true); // failed password check
                }

            }
        }
    );
};
const getToken = function(id, done){
    db.get(
        'SELECT session_token FROM users WHERE user_id=?',
        [id],
        function(err, row){
          if (row && row.session_token){
            return done(null, row.session_token);
          }else{
            return done(null, null);
          } 
        }
    );
};



/**
 * create and store a new token for a user
 */
const setToken = function(id, done){
    let token = crypto.randomBytes(16).toString('hex');
    db.run(
        'UPDATE users SET session_token=? WHERE user_id=?',
        [token, id],
        function(err){return done(err, token)}
    );
};


const removeToken= function (token, done){
    const sql= 'UPDATE users SET session_token=null WHERE session_token=?';
    db.run(sql, [token], function (err){
       
            return done(err);
        })
    }


module.exports = {
    getIdFromToken: getIdFromToken,
    insert: insert,
    authenticate: authenticate,
    getToken: getToken,
    setToken: setToken,
    removeToken: removeToken,
    
    
};


