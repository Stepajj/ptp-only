export interface Bank {
  id: string;
  name: string;
}

export async function getBanks(): Promise<Bank[]> {
  return [];
}