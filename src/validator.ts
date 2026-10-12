import mongoose from 'mongoose';
import z from 'zod';

const signupSchema = z.object({
    username: z.string().min(3).max(10),
    password: z.string().min(8).max(20).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/)
})

const signinSchema = z.object({
    username: z.string().min(1).max(10),
    password: z.string().min(1).max(64)
})

const contentSchema = z.object({
    link : z.url().max(2048),
    contentType: z.enum(['document', 'tweet', 'youtube', 'link']),
    title: z.string().min(5).max(200),
    contentText: z.string().min(10).max(1000).optional(),
    tags: z.array(z.string().trim().toLowerCase().min(1).max(20)).max(10).transform((arr) => [...new Set(arr)]).default([])
})

type contentGetSchema = {
    id:mongoose.Types.ObjectId;
    type: "link" | "document" | "tweet" | "youtube";
    link: string;
    contentText?: string | null | undefined;
    title: string;
    tags: string[];
}

const deleteSchema = z.object({
    id: z.string().refine(mongoose.isValidObjectId,"Invalid content id")
})



type signupInput = z.infer<typeof signupSchema>;
type signinInput = z.infer<typeof signinSchema>;
type contentInput = z.infer<typeof contentSchema>;
type contentInputWithUser = Pick<contentInput, "link" | "contentType" | "title"> & { tags: mongoose.Types.ObjectId[], userId: mongoose.Types.ObjectId}


export {signupSchema, signinSchema, contentSchema, deleteSchema, type signupInput, type signinInput, type contentInput, type contentInputWithUser, type contentGetSchema};