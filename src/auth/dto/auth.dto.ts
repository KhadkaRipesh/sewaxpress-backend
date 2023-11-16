export class CreateAccountDto {
  @IsString()
  @IsnotEmpty()
  email: string;
  password: string;
}
