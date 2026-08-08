export interface BanksResponseDto {
  success: true;
  data: {
    id: number;
    name: string;
    tier1: boolean;
  }[];
}
