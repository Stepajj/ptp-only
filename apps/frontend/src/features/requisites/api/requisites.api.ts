import type { Requisite } from '@/features/requisites/model/requisites.types';
import { mockRequisites } from '@/features/requisites/mocks/requisites.mock';

export async function getRequisites(): Promise<Requisite[]> {
  return mockRequisites;
}