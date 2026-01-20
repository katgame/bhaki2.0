import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { TokenStorageService } from '../../../services/token-storage.service';
import { UserDetails } from '../../../models/users';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports:[CommonModule,RouterModule,DropdownComponent,DropdownItemTwoComponent]
})
export class UserDropdownComponent {
  isOpen = false;
  userDetails: any;
  constructor(private tokenStorage: TokenStorageService,private router: Router) {
    this.userDetails = this.tokenStorage.getUser();
    console.log(this.userDetails);
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
  signOut() {
    this.tokenStorage.logOut();
    this.router.navigate(['/signin']);
  }
}