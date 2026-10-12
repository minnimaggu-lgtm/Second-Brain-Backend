import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const model = mongoose.model;

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true}

});

const UserModel = model('User', userSchema);

const contentSchema = new Schema({
    link: {type: String, required: true},
    contentType: {type: String, enum: ['document', 'tweet', 'youtube', 'link'] , required: true},
    title: {type: String, required: true},
    contentText: {type: String},
    tags: [{type: Schema.Types.ObjectId, ref: 'Tag'}],
    userId: {type: Schema.Types.ObjectId, ref: 'User' , required: true}
});

const ContentModel = model('Content', contentSchema);

const tagSchema = new Schema({
    title: {type: String, required:true, unique: true}
});

const TagModel = model('Tag', tagSchema);

const linkSchema = new Schema({
    hash: {type: String, required: true, unique: true},
    userId: {type: Schema.Types.ObjectId, ref:'User', required: true }
})

const LinkModel = model('Link', linkSchema);

export { UserModel, ContentModel, TagModel, LinkModel };