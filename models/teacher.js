'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Teacher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Teacher.belongsTo(models.User, {
        foreignKey: 'userId'
      })

      Teacher.hasMany(models.AvailableDay, {
        foreignKey: 'teacherId'
      })

      Teacher.belongsTo(models.LessonDurationMinute, {
        foreignKey: 'lessonDurationMinuteId'
      })

      Teacher.hasMany(models.Reservation, {
        foreignKey: 'teacherId'
      })

      Teacher.hasMany(models.Comment, {
        foreignKey: 'teacherId'
      })
    }
  }
  Teacher.init({
    teachingStyle: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    classIntro: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    classLink: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Teacher',
    tableName: 'Teachers',
    underscored: true
  })
  return Teacher
}
