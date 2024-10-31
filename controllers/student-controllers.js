const { LessonDurationMinute, User, Student, Teacher, AvailableDay, sequelize } = require('../models')

const studentControllers = {
  getBecomeTeacherPage (req, res, next) {
    return LessonDurationMinute.findAll()
      .then(lessonDurationMinutes => {
        lessonDurationMinutes = lessonDurationMinutes.map(minute => minute.toJSON())
        return res.render('student/become-teacher', { lessonDurationMinutes })
      })
      .catch(err => next(err))
  },

  async postTeacher (req, res, next) {
    try {
      const userId = Number(req.params.userId)
      const teachingStyle = req.body.teachingStyle?.trim()
      const classIntro = req.body.classIntro?.trim()
      const classLink = req.body.classLink?.trim()
      const lessonDurationMinuteId = Number(req.body.lessonDurationMinuteId)
      let availableDays = req.body.availableDays

      if (userId !== req.user.id) throw new Error('access denied!')
      if (!availableDays) throw new Error('You must pick at least one available day!')

      if (typeof availableDays === 'string') {
        availableDays = Number(availableDays)
        if (availableDays < 0 || availableDays > 6 || !Number.isInteger(availableDays)) throw new Error('Invalid Input on availableDays!')
      } else if (Array.isArray(availableDays)) {
        availableDays = availableDays.map(day => {
          day = Number(day)
          if (day < 0 || day > 6 || !Number.isInteger(day)) throw new Error('Invalid Input on availableDays!')

          return day
        })
      } else {
        throw new Error('Invalid Input on availableDays!')
      }

      if (!userId || userId < 1 || !Number.isInteger(userId)) throw new Error('User didn\'t exist!')
      if (!lessonDurationMinuteId || lessonDurationMinuteId < 1 || !Number.isInteger(lessonDurationMinuteId)) throw new Error('Invalid Input on lessonDurationMinuteId')

      const transaction = await sequelize.transaction()
      try {
        await Student.destroy({ where: { userId }, transaction })
        await User.update({ status: 'teacher' }, { where: { id: userId }, transaction })
        const teacher = await Teacher.create({
          teachingStyle,
          classIntro,
          classLink,
          userId,
          lessonDurationMinuteId
        }, { transaction })

        if (typeof availableDays === 'number') await AvailableDay.create({ day: availableDays, teacherId: teacher.id }, { transaction })
        if (Array.isArray(availableDays)) {
          await Promise.all(availableDays.map(async day => {
            await AvailableDay.create({ day, teacherId: teacher.id }, { transaction })
          }))
        }

        await transaction.commit()
      } catch (err) {
        await transaction.rollback()
        throw err
      }

      req.flash('success_messages', '您已成為老師!')
      return res.redirect(`/user/profile/${userId}`)
    } catch (err) {
      return next(err)
    }
  }
}

module.exports = studentControllers
