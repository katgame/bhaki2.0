import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../services/modal.service';
import { CommonModule } from '@angular/common';
import { UserDetails, UpdateUserDetails } from '../../../models/users';
import { BhakiService } from '../../../services/bhaki-service';
import { ActivatedRoute } from '@angular/router';
import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { LabelComponent } from '../../form/label/label.component';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-user-info-card',
  imports: [
    CommonModule,
    ModalComponent,
    ButtonComponent,
    InputFieldComponent,
    LabelComponent,
    FormsModule,
  ],
  templateUrl: './user-info-card.component.html',
  styles: ``
})
export class UserInfoCardComponent implements OnInit {
  userId: string | null = null;
  constructor(
    public modal: ModalService, 
    private userService: BhakiService, 
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.route.params.subscribe((params: { [x: string]: string | null; }) => {
      this.userId = params['userId'];
    });
  }
  user: UserDetails = {
    user: {},
    branch: {},
    role: []
  } as UserDetails;
  roles : string[] = [];
  
  // Form data for editing
  editForm: UpdateUserDetails = {
    name: '',
    surname: '',
    email: '',
    phoneNumber: '',
    userName: ''
  };

  ngOnInit(): void {
    this.loadUserDetails();
  }

  loadUserDetails(): void {
    this.userService.getUserDetails(this.userId || '').subscribe({
      next: (data) => {
        this.user = data || { user: {}, branch: {}, role: [] };
        // Initialize form with current user data
        if (this.user.user) {
          this.editForm = {
            name: this.user.user.name || '',
            surname: this.user.user.surname || '',
            email: this.user.user.email || '',
            phoneNumber: this.user.user.phoneNumber || '',
            userName: this.user.user.userName || ''
          };
        }

        // Ensure roles is always a string array
        this.roles = Array.isArray(this.user.role)
          ? this.user.role
          : (this.user.role ? [this.user.role] : []);

      },
      error: (err) => {
        console.error('Error loading user details:', err);
        this.toastService.show('Failed to load user details', 'error');
      }
    });
  }

  isOpen = false;
  openModal() { 
    // Reset form to current user data when opening
    if (this.user.user) {
      this.editForm = {
        name: this.user.user.name || '',
        surname: this.user.user.surname || '',
        email: this.user.user.email || '',
        phoneNumber: this.user.user.phoneNumber || '',
        userName: this.user.user.userName || ''
      };
    }
    this.isOpen = true; 
  }
  closeModal() { this.isOpen = false; }

  handleNameChange(value: string | number): void {
    this.editForm.name = String(value);
  }

  handleSurnameChange(value: string | number): void {
    this.editForm.surname = String(value);
  }

  handleEmailChange(value: string | number): void {
    this.editForm.email = String(value);
  }

  handlePhoneNumberChange(value: string | number): void {
    this.editForm.phoneNumber = String(value);
  }

  handleUserNameChange(value: string | number): void {
    this.editForm.userName = String(value);
  }

  handleSave() {
    if (!this.userId) {
      this.toastService.show('User ID is missing', 'error');
      return;
    }

    // Validate required fields
    if (!this.editForm.name || !this.editForm.surname || !this.editForm.email) {
      this.toastService.show('Please fill in all required fields (Name, Surname, Email)', 'error');
      return;
    }

    this.userService.updateUserDetails(this.userId, this.editForm).subscribe({
      next: (response) => {
        this.toastService.show('User details updated successfully', 'success');
        this.closeModal();
        // Reload user details to reflect changes
        this.loadUserDetails();
      },
      error: (err) => {
        console.error('Error updating user details:', err);
        this.toastService.show('Failed to update user details', 'error');
      }
    });
  }
}
