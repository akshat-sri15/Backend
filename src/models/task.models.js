import mongoose, {Schema} from 'mongoose'
import {AvailableUserRole, AvailableTaskStatues} from '../utils/constants.js'

const taskSchema=new Schema({
    title: {
        type :String,
        required: true,
    },
    descriprion: {
        type: String
    },
    assignedTo:{
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    assignedBy:{
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type: String,
        enum: AvailableTaskStatues,
        default: AvailableTaskStatues.TODO
    },
    attachment:{
        type: [{
            url: String,
            mimetype: String,  // pdf,doc etc
            size: Number
        }],
        default: []
    }

},{timestamps:true})

export const tasks=mongoose.model("Task",taskSchema);
