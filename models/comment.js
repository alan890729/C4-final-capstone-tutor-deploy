'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Comment.belongsTo(models.Student, {
        foreignKey: 'studentId'
      })

      Comment.belongsTo(models.Teacher, {
        foreignKey: 'teacherId'
      })

      Comment.belongsTo(models.Reservation, {
        foreignKey: 'reservationId'
      })
    }
  }
  Comment.init({
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    rate: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Comment',
    tableName: 'Comments',
    underscored: true
  })
  return Comment
}
