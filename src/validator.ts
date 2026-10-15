import mongoose from 'mongoose';
import z from 'zod';

const passwordErorr: string = "Length of password must be between 8-20 and must contain one lowercase, uppercase, number and special character";
const usernameError: string = "Length of username must be between 3-10"
const signInError: string = "Username or Password field can't be empty";

const signupSchema = z.object({
    username: z.string().min(3,usernameError).max(10,usernameError),
    password: z.string().min(8,passwordErorr).max(20,passwordErorr).regex(/[a-z]/,passwordErorr).regex(/[A-Z]/,passwordErorr).regex(/[0-9]/,passwordErorr).regex(/[^a-zA-Z0-9]/,passwordErorr)
})

const signinSchema = z.object({
    username: z.string().min(1,signInError).max(10),
    password: z.string().min(1,signInError).max(64)
})

const titleError:string = "length of title should be between 5-200";
const typeError: string = "Please select card type"


const contentSchema = z.object({
    link : z.url().max(2048),
    contentType: z.enum(['document', 'tweet', 'youtube', 'link'],typeError),
    title: z.string().min(5,titleError).max(200,titleError),
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