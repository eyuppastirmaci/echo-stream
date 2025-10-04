import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, RegisterRequest } from '../../services/user.service';

@Component({
  selector: 'page-register',
  imports: [FormsModule],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss'
})
export class RegisterPage {
  formData: RegisterRequest = {
    email: '',
    username: '',
    password: '',
    passwordAgain: ''
  };

  isSubmitting = false;
  successMessage = '';
  generalError = '';
  emailError = '';
  usernameError = '';
  passwordError = '';
  passwordConfirmError = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) return;

    // Clear previous errors
    this.clearErrors();

    // Validate form using service methods
    if (!this.validateForm()) return;

    this.isSubmitting = true;

    try {
      const response = await this.userService.register(this.formData).toPromise();

      this.successMessage = response?.message || 'Registration successful! Please check your email for verification.';

      // Clear form data
      this.formData = {
        email: '',
        username: '',
        password: '',
        passwordAgain: ''
      };

      // Redirect to login after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);

    } catch (error: any) {
      this.generalError = error.message || 'Registration failed. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  private validateForm(): boolean {
    let isValid = true;

    // Email validation using service
    if (!this.formData.email) {
      this.emailError = 'Email is required';
      isValid = false;
    } else if (!this.userService.isValidEmail(this.formData.email)) {
      this.emailError = 'Please enter a valid email address';
      isValid = false;
    }

    // Username validation using service
    const usernameValidation = this.userService.isValidUsername(this.formData.username);
    if (!usernameValidation.isValid) {
      this.usernameError = usernameValidation.message!;
      isValid = false;
    }

    // Password validation using service
    const passwordValidation = this.userService.isValidPassword(this.formData.password);
    if (!passwordValidation.isValid) {
      this.passwordError = passwordValidation.message!;
      isValid = false;
    }

    // Password confirmation validation
    if (!this.formData.passwordAgain) {
      this.passwordConfirmError = 'Please confirm your password';
      isValid = false;
    } else if (this.formData.password !== this.formData.passwordAgain) {
      this.passwordConfirmError = 'Passwords do not match';
      isValid = false;
    }

    return isValid;
  }

  private clearErrors(): void {
    this.generalError = '';
    this.emailError = '';
    this.usernameError = '';
    this.passwordError = '';
    this.passwordConfirmError = '';
    this.successMessage = '';
  }
}
