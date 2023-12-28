const users= require('../models/user.models');
const Joi = require('joi');
const config= require('../../config/config');




const register= (req, res)=>{
    const schema= Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        username: Joi.string().required(),
        password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,14}$/).required()
       
    });
   
    
    const {error}= schema.validate(req.body);
    if (error) return res.status(400).json({error_message: error.details[0].message});

    const user1= Object.assign({}, req.body);
    users.insert(user1, function(err,user_id){
        if (err){
            return res.status(400).json({error_message:"Could not register a user, username has been taken!!"})
        }
        else{
            return res.status(201).json({user_id: user_id});
        }
    })

}

const login = (req, res) => {
    
      let username = req.body.username;
      let password = req.body.password;

      const schema= Joi.object({
      
        username: Joi.string().required(),
        password: Joi.string().required()
       
    });
    const {error}= schema.validate(req.body);
    if (error) return res.status(400).json({error_message: error.details[0].message});
  
      users.authenticate(username, password, function(err, id){
          
          if(err){
              
              res.status(400).json({error_message:'Invalid username/password supplied'});
          } else {
              users.getToken(id, function(err, token){
                  
                  if (token){
                      return res.status(200).send({user_id: id, session_token: token});
                  } else {
                      
                      users.setToken(id, function(err, token){
                          res.status(200).send({user_id: id, session_token: token});
                      });
                  }
              });
          }
      });
    }

 
  

const logout= (req,res)=>{
    let token = req.get(config.get('authToken'));
    users.removeToken(token, function(err){
        if (err){
            return res.sendStatus(401);
        }else{
            return res.sendStatus(200);
        }
    });
    return null;
}
module.exports = {
    register: register,
    login: login,
    logout: logout,
   
    
};
