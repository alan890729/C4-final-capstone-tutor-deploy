const { LessonDurationMinute } = require('../models')

const studentControllers = {
  getBecomeTeacherPage (req, res, next) {
    return LessonDurationMinute.findAll()
      .then(lessonDurationMinutes => {
        lessonDurationMinutes = lessonDurationMinutes.map(minute => minute.toJSON())
        return res.render('student/become-teacher', { lessonDurationMinutes })
      })
      .catch(err => next(err))
  }
}

module.exports = studentControllers
