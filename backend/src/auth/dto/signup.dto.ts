import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { PASSWORD_REGEX } from '../password.policy';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Fadwa' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({ example: 'Passw0rd!' })
  @IsString()
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must be at least 8 characters and include at least one letter, one number, and one special character.',
  })
  password!: string;
}
