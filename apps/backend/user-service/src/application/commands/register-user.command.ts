export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly username: string,
    public readonly password: string,
    public readonly passwordAgain: string,
  ) {}
}