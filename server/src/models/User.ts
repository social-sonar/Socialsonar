import { DataTypes, type Model, type Optional } from 'sequelize'
import { sequelize } from '.'

interface UserAttributes {
  id: string
  name: string
}

interface UserCreationAttributes
  extends Optional<UserAttributes, 'id'> {}

interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
  UserAttributes {
  createdAt?: Date
  updatedAt?: Date
}

const User = sequelize.define<UserInstance>(
  'Users',
  {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED,
      unique: true
    },
    name: {
      allowNull: false,
      type: DataTypes.TEXT
    }
  }
)

export default User
