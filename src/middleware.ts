import jwt from "jsonwebtoken";
import {env} from "./env.js";
import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";

declare global {
    namespace Express {
        interface Request {
            userId?: mongoose.Types.ObjectId;
        }
    }
}

export function auth(req: Request, res: Response, next: NextFunction){
    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({
            Message: "Missing token"
        })
    }

    try{
        const decoded = jwt.verify(token, env.secretKey) as {userId: string}
        req.userId = new mongoose.Types.ObjectId(decoded.userId);
        next();

    }catch(e){
        return res.status(401).json({
            Message: "Invalid login credentials"
        });
    }
}
