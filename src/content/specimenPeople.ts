import { hasSpecimen } from '../domain/specimenGear';
import type { ContentPack, ExhibitRecord } from '../domain/types';

type People = NonNullable<NonNullable<ExhibitRecord['specimen']>['people']>;
const sections = import.meta.glob<Record<string, People>>('./*-people.json', { eager: true, import: 'default' });

export function addSpecimenPeople(content: ContentPack) {
  const accounts = Object.assign({}, ...Object.values(sections)) as Record<string, People>;
  content.exhibits = content.exhibits.map((exhibit) => {
    const people = hasSpecimen(exhibit) ? accounts[exhibit.specimen.key] : undefined;
    if (!people?.length || !hasSpecimen(exhibit)) return exhibit;
    return { ...exhibit, specimen: { ...exhibit.specimen, people: [...(exhibit.specimen.people ?? []), ...people] } };
  });
}
