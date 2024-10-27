'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Student.belongsTo(models.User, {
        foreignKey: 'userId'
      })
    }
  }
  Student.init({
    totalLearningHours: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Student',
    tableName: 'Students',
    underscored: true
  })
  return Student
}
