import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../services/modal.service';
import { CommonModule } from '@angular/common';
import { UserDetails } from '../../../models/users';
import { ActivatedRoute } from '@angular/router';
import { BhakiService } from '../../../services/bhaki-service';

@Component({
  selector: 'app-user-meta-card',
  imports: [
    CommonModule,
  ],
  templateUrl: './user-meta-card.component.html',
  styles: ``
})
export class UserMetaCardComponent implements OnInit {
  userId: string | null = null;
  constructor(public modal: ModalService, private userService: BhakiService, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.userId = params['userId'];
    });
  }
  // Example user data (could be made dynamic)
  user: UserDetails = {
    user: {},
    branch: {},
    role: []
  } as UserDetails;
  
  ngOnInit(): void {
    this.userService.getUserDetails(this.userId || '').subscribe({
      next: (data) => {
      console.log(data);
      this.user = data;
      },
      error: (err) => {
        console.error('Error loading user details:', err);
      }
    });
  }

  isOpen = false;
  openModal() { this.isOpen = true; }
  closeModal() { this.isOpen = false; }



  handleSave() {
    // Handle save logic here
    console.log('Saving changes...');
    this.modal.closeModal();
  }
}
