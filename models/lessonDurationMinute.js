'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class LessonDurationMinute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      LessonDurationMinute.hasMany(models.Teacher, {
        foreignKey: 'lessonDurationMinuteId'
      })
    }
  }
  LessonDurationMinute.init({
    durationMinute: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'LessonDurationMinute',
    tableName: 'LessonDurationMinutes',
    underscored: true
  })
  return LessonDurationMinute
}
