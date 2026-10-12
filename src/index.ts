import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { env } from "./env.js";
import type { Request, Response, NextFunction } from "express";
import { signupSchema, type signupInput, signinSchema, type signinInput, contentSchema, type contentInput, type contentInputWithUser, type contentGetSchema, deleteSchema} from "./validator.js";
import { UserModel, ContentModel, TagModel, LinkModel } from "./db.js";
import { auth } from "./middleware.js";
import  cors  from "cors"
const app = express();

app.use(express.json());
app.use(cors());

await mongoose.connect(env.connectionString!); 

app.post("/api/v1/signup",async (req, res) => {
    const result = signupSchema.safeParse(req.body);
    if(!result.success){
        return res.status(400).json({
            Errors: result.error.issues
        });
    }
    try{
        const signupBody: signupInput = result.data;
        const hashed = await bcrypt.hash(signupBody.password, 10);
        await UserModel.create({
            username: signupBody.username,
            password: hashed
        });
        return res.status(200).json({
            Message: "Signed up"
        });
    }catch(e: any){
        if(e.code === 11000){
            return res.status(403).json({ 
                Message: "User already exists"
            });
        }
        console.error(e);
        return res.status(500).json({
            Message: "Server error" 
            });
    }

})

app.post("/api/v1/signin",async (req, res) => {
    const result = signinSchema.safeParse(req.body);
    if(!result.success){
        return res.status(400).json({
            Errors: result.error.issues
        })
    }
    try{
        const signinBody = result.data;
        const user = await UserModel.findOne({
            username: signinBody.username
        });
        if(!user){
            return res.status(403).json({
                Message: "Wrong username or password"
            })
        }
        
        const isMatch = await bcrypt.compare(signinBody.password, user.password);

        if(!isMatch){
            return res.status(403).json({
                Message: "Wrong username or password"
            })
        }

        const token = jwt.sign({
            userId: user._id.toString()
        },env.secretKey, { expiresIn: "7d" });

        return res.status(200).json({
            Message: "Signedin",
            Jwt_token: token
        })

    }catch(e){
        console.error(e);
        return res.status(500).json({
            Message: "Server error"
        })
    }

})

app.use(auth);

app.post("/api/v1/content",async (req, res) => {
    const result = contentSchema.safeParse(req.body);

    if(!result.success){
        return res.status(400).json({
            Message: result.error.issues
        });
    }

    try{
        const tags: string[] = result.data.tags;
        const tagsId = await Promise.all(tags.map(async (tag) => {
            const doc = await TagModel.findOneAndUpdate({title: tag},{ $setOnInsert: { title:tag } }, {new:true, upsert:true});
            return doc!._id;
            })
        );
        

        const contentDoc: contentInputWithUser = {
            ...result.data,
            tags: tagsId,
            userId: req.userId!
        }

        const insert = await ContentModel.create(contentDoc);
        return res.status(201).json({
            Message:"Content inserted",
            id: insert._id
        })
    }catch(e){
        console.error(e)
        return res.status(500).json({
            Message: "Server error"
        })
    }
})

app.get("/api/v1/content",async (req, res) => {
    try{
        const contentDb = await ContentModel.find({
            userId: req.userId!
        },"-userId -__v").populate("tags","title");

        const contentFrontend:contentGetSchema[] = contentDb.map(cont=>({
            id: cont._id,
            type: cont.contentType,
            link: cont.link,
            title: cont.title,
            contentText: cont.contentText,
            tags: cont.tags.map((t: any) => t.title)
        }));

        return res.status(200).json({
            "Content": contentFrontend
        })

    }catch(e){
        console.error(e);
        return res.status(500).json({
            "Message": "Server error"
        })
    }
})

app.delete("/api/v1/content",async (req, res) => {
    const result = deleteSchema.safeParse(req.body);

    if(!result.success){
        return res.status(400).json({
            "Message": result.error.issues
        })
    }
    try{
        const deleteBody = result.data;
        const deleteQuery = await ContentModel.deleteOne({_id: deleteBody.id});
    }catch(e){

    }

})

app.post("/api/v1/brain/share", (req, res) => {

})

app.get("/api/v1/brain/share", (req, res) => {

})



app.listen(process.env.PORT ||3000);
