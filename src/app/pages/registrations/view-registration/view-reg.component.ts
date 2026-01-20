import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationDetailsCardComponent } from '../../../shared/components/registration/registration-details-card/registration-details-card.component';
import { ActivatedRoute } from '@angular/router';
import { BhakiService } from '../../../shared/services/bhaki-service';
import { AppStore } from '../../../shared/state/app.store';
import { StudentInfoCardComponent } from '../../../shared/components/registration/student-info-card/student-info-card.component';


@Component({
  selector: 'app-view-registration',
  imports: [ 
    CommonModule,
    RegistrationDetailsCardComponent,
    StudentInfoCardComponent
  ],
  templateUrl: './view-reg.component.html',
  styles: ``  
})
export class ViewRegistrationComponent implements OnInit {
  registrationId: string | null = null;
  constructor(private store: AppStore ,private route: ActivatedRoute, private userService: BhakiService) {
    this.route.params.subscribe(params => {
      this.registrationId = params['registationId'];
    });
  }

  ngOnInit(): void {
    this.userService.getRegistrationDetails(this.registrationId || '').subscribe({
      next: (data) => {
        console.log(data);
        this.store.setRegistrationDetails(data);
      },
      error: (err) => {
        console.error('Error loading user details:', err);
      }
    });
  }
}
