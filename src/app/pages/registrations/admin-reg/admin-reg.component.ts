import { Component } from '@angular/core';
import { AdminRegistrationComponent } from '../../../shared/components/form/admin-registration/admin-registration.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-registration',
  imports: [ 
    CommonModule,
    AdminRegistrationComponent
  ],
  templateUrl: './admin-reg.component.html',
  styles: ``
})
export class AllRegistrationComponent {

}
