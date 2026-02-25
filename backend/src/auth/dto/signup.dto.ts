import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { PASSWORD_REGEX } from '../password.policy';

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must be at least 8 characters and include at least one letter, one number, and one special character.',
  })
  password!: string;
}