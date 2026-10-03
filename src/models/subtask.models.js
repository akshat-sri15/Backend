import mongoose, {Schema} from 'mongoose'

const subTaskSchema=new Schema({
    title: {
        type :String,
        required: true,
    },
    task: {
        type: Schema.Types.ObjectId,
        ref:"Task",
        required:true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    isComplete: {
        type: Boolean,
        default: false
    },

},{timestamps:true})

export const subtasks=mongoose.model("Subtask",subTaskSchema);
