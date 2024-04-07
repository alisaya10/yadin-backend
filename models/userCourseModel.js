const mongoose = require('mongoose');
const { numbers } = require('nanoid-dictionary');

const Schema = mongoose.Schema;

const usercourseSchema = new Schema({

user : {
    type : mongoose.Schema.Types.ObjectId,
    ref:'users'
},
course: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'courses'
},
lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'lessons'
},
quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'quizes'
},
practice: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'practices'
},

boughtCourses :{type:Boolean},

completedCourses:{type:Boolean},

passedCourses : {type:Boolean, default: false},

score : {type:Number},

watchedLessons:[ {
    type: mongoose.Schema.Types.ObjectId,
    ref:'lessons'
}],
donePractices:[ {
    type: mongoose.Schema.Types.ObjectId,
    ref:'practices'
}],

books:{type:Number},

currentCourseProgress :{type:Number},

currentLesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'lessons'
},

currentLessontime : {type:Number},
removed: { type: Boolean, default: false },
cDate: { type: Date },
uDate: { type: Date },
pDate: { type: Date },
quizDate: { type: Date },
  
})

module.exports = mongoose.model('userCourses', usercourseSchema);