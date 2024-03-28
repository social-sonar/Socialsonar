import { type Model } from 'sequelize'

export interface ModelStatic extends Model {
  associate?: (models: Record<string, ModelStatic>) => void
}
