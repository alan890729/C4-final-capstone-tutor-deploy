'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class AvailableDay extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      AvailableDay.belongsTo(models.Teacher, {
        foreignKey: 'teacherId'
      })
    }
  }
  AvailableDay.init({
    day: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'AvailableDay',
    tableName: 'AvailableDays',
    underscored: true
  })
  return AvailableDay
}
