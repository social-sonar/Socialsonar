import { Sequelize } from 'sequelize'

const databaseUrl = process.env.POSTGRES_URL ?? 'postgres://myuser:mypassword@db:5432/template'

export const sequelize = new Sequelize(databaseUrl)

sequelize.sync({ force: (process.env.FORCE_SYNC ?? false) as boolean, logging: process.env.NODE_ENV === 'development' }).catch(error => {
  console.log('Error syncing database:', error)
})
