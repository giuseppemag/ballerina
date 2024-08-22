import { Func } from '../func'
import { BasicUpdater, Updater } from './updater'

export type PropertyUpdater<Entity, Property extends keyof Entity> = Func<
  BasicUpdater<Entity[Property]>,
  Updater<Entity>
>

export const propertyUpdater =
  <Entity>() =>
  <Property extends keyof Entity>(property: Property): PropertyUpdater<Entity, Property> =>
    Func((updater) => Updater<Entity>((entity) => ({ ...entity, [property]: updater(entity[property]) })))
