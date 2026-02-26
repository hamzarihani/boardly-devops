export type TeamRole = 'ADMIN' | 'MEMBER';

export class CreateTeamMemberDto {
  name!: string;
  email!: string;
  role!: TeamRole;
}
