const express = require('express');
const port=process.env||9000;
const bodyParser=require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc=require('swagger-jsdoc');
const checkToken=require('./authenticate');

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'YSquare Technologies Test APIs',
        version: '1.0.0',
      },
    },
    apis: ['*.js']
  };
  
  const openapiSpecification = swaggerJSDoc(options);



const User=require('./models/user');
const app=express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://chandra:chandramouli@cluster0.irqko.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{ 
    useUnifiedTopology: true,
    useNewUrlParser: true 
 })


/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login.
 *     responses:
 *       201:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The user ID.
 *                       example: 60a0b5f9b939cb3430a9f42b
 *                     username:
 *                       type: string
 *                       description: The user's name.
 *                       example: Leanne Graham
 *                     email:
 *                       type: string
 *                       description: The user's email.
 *                       example:     test@dummy.com
 *                     password:
 *                       type: string
 *                       description: User's password
 *                       example:  ejjdhshjds    
*/  




app.post('/login',(req,res)=>{
    
    User.find({email:req.body.email}).then(user=>{
        if(user.length===0){
            res.status(401).json({
                message:"Auth Failed"
            })
        }
        else{
            bcrypt.compare(req.body.password, user[0].password, function(err, result) {
                if(!result){
                    res.status(401).json({
                        message:"Auth Failed"
                    })
                }
                else{
                    const token=jwt.sign({
                        email:user[0].email,
                        user_id:user[0]._id
                    },"Secret key",
                    {
                        expiresIn:"1h"
                    })
                    res.status(200).json({
                        message:"Login success",
                        token:token
                    })
                }
            });
        }
    })
});


/**
 * @openapi
 *  /getAllUsers:
 *    get:
 *     summary: User login
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                       id:
 *                         type: string
 *                         description: The user ID created by MogoDB.
 *                         example: 60a0b5f9b939cb3430a9f42b
 *                       username:
 *                         type: string
 *                         description: The user's name.
 *                         example: Chandramouli
 *                       password:
 *                         type:string
 *                         description:User's hashed password
 *                         example:tyisdndn87@%jsjdd8asasjass     
 * 
 */

app.get('/getAllUsers',checkToken,(req,res)=>{
    User.find().exec().then(result=>{
     //   console.log(res);
        res.status(200).json({
            message:"All user data",
            data:result
        })
    })
    .catch(err=>{
        console.log(err);
    })
 
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Create a new user.
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The user ID.
 *                       example: 60a0b5f9b939cb3430a9f42b
 *                     username:
 *                       type: string
 *                       description: The user's name.
 *                       example: Leanne Graham
 *                     email:
 *                       type: string
 *                       description: The user's email.
 *                       example:     test@dummy.com
 *                     password:
 *                       type: string
 *                       description: User's password
 *                       example:  ejjdhshjds    
*/  


app.post('/register',(req,res)=>{
    User.find({email:req.body.email}).exec().then(user=>{
        if(user.length!=0){
            return res.status(409).json({
                message:"OOPS!,This mail is already registered with us"
            })
        }
        else{
            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(req.body.password, salt, function(err, hash) {
                    const user=new User({
                        _id:new mongoose.Types.ObjectId(),
                        username:req.body.username,
                        email:req.body.email,
                        password:hash
                });
                user.save().then(res=>{
                    console.log("After storing data",res);
                })
                .catch(err=>{
                    console.log(err);
                })
                res.status(201).json({
                    message:"User created",
                    data:user
                })
            });
           
            
            });
        }
    })
 
    
});

app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(openapiSpecification));

app.listen(9000,()=>{
    console.log("Sever started");
})
