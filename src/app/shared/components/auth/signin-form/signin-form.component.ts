import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BhakiService } from '../../../services/bhaki-service';
import { TokenStorageService } from '../../../services/token-storage.service';
import { AppStore } from '../../../state/app.store';
import { ToastService } from '../../../services/toast.service';
import { environment } from '../../../../../environments/environment';


@Component({
  selector: 'app-signin-form',
  imports: [
    CommonModule,
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './signin-form.component.html',
  styles: ``
})
export class SigninFormComponent {
  version = environment.version;
  
  constructor(
    private authService: BhakiService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private state: AppStore,
    private toastService: ToastService
  ) { }
  showPassword = false;
  isChecked = false;

  email: any = ''; // This can be email or phone number
  phoneNumber: any = '';
  password: any = '';
  authMethod: 'email' | 'phone' = 'email'; // Toggle between email and phone

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    const username = this.authMethod === 'email' ? this.email : this.phoneNumber;
    this.authService.login({ username: username, password: this.password }).subscribe({
      next: (data) => {
        this.tokenStorage.saveToken(data.token.token);
        this.tokenStorage.saveUser(data.userDetails);
        this.state.setUserDetails(data.userDetails);
        
        // Redirect students to registration page, others to dashboard
        const isStudent = data.userDetails?.role?.includes('Student') && 
                          !data.userDetails?.role?.includes('Admin') && 
                          !data.userDetails?.role?.includes('Clerk') &&
                          !data.userDetails?.role?.includes('Manager');
        
        if (isStudent) {
          this.router.navigate(['/admin-registration']);
        } else {
          this.router.navigate(['']);
        }
      },
      error: (error) => {
        // Handle 401 Unauthorized specifically
        if (error.status === 401) {
          const errorMessage = error?.error?.message || 
                              error?.error?.errorMessage || 
                              'Invalid email/phone or password. Please check your credentials and try again.';
          this.toastService.error(errorMessage, 5000);
        } else if (error.status === 400) {
          const errorMessage = error?.error?.message || 
                              error?.error?.errorMessage || 
                              'Invalid request. Please check your input and try again.';
          this.toastService.error(errorMessage, 5000);
        } else {
          const errorMessage = error?.error?.message || 
                              error?.error?.errorMessage || 
                              'Login failed. Please try again later.';
          this.toastService.error(errorMessage, 5000);
        }
      }
    });
  }
}
