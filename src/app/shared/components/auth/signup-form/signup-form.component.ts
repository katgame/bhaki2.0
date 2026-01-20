import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LabelComponent } from '../../form/label/label.component';
import { BhakiService } from '../../../services/bhaki-service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LabelComponent],
  templateUrl: './signup-form.component.html',
  styles: ``,
})
export class SignupFormComponent {

  constructor(private router: Router, private bhakiService: BhakiService, private toast: ToastService) {}
  showPassword = false;
  isChecked = false;

  fname = '';
  lname = '';
  email = '';
  phoneNumber = '';
  password = '';
  confirmPassword = '';
  authMethod: 'email' | 'phone' = 'email'; // Toggle between email and phone

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  get passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  isValidEmail(email: string): boolean {
    if (!email || !email.trim()) {
      return false;
    }
    // RFC 5322 compliant email regex pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email.trim());
  }

  onSignUp() {
    if (!this.passwordsMatch) {
      alert('Passwords do not match!');
      return;
    }

    // Validate based on selected auth method
    if (this.authMethod === 'email') {
      if (!this.email.trim()) {
        alert('Please enter your email address.');
        return;
      }
      if (!this.isValidEmail(this.email)) {
        alert('Please enter a valid email address.');
        return;
      }
    } else {
      if (!this.phoneNumber.trim()) {
        alert('Please enter your phone number.');
        return;
      }
    }

    // Use email for username if email method, otherwise use phone number
    const username = this.authMethod === 'email' ? this.email.trim() : this.phoneNumber.trim();

    const user = {
      "name": this.fname,
      "surname": this.lname,
      "userName": username,
      "email": this.authMethod === 'email' ? this.email.trim() : null,
      "phoneNumber": this.authMethod === 'phone' ? this.phoneNumber.trim() : null,
      "password": this.password,
      "role": "Student",
      "branchId": "00000000-0000-0000-0000-000000000000"
    }

    this.bhakiService.registerUser(user).subscribe({
      next: (response) => {
        this.toast.show('Registration successful! Please log in.');
        this.router.navigate(['signin']);
      },
      error: (error) => {

        this.toast.show('Registration failed. Please try again.', "error");
      }
    });
  }
}
