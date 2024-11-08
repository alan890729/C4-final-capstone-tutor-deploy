'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Reservation.belongsTo(models.Student, {
        foreignKey: 'studentId'
      })

      Reservation.belongsTo(models.Teacher, {
        foreignKey: 'teacherId'
      })

      Reservation.hasOne(models.Comment, {
        foreignKey: 'reservationId'
      })
    }
  }
  Reservation.init({
    startFrom: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    durationHours: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: false
    },
    isExpired: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Reservation',
    tableName: 'Reservations',
    underscored: true
  })
  return Reservation
}
