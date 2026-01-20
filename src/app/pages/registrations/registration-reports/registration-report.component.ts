import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewAllRegistrationsComponent } from '../../../shared/components/tables/basic-tables/registrations/view-all-registrations.component';

@Component({
  selector: 'app-registration-report',
  imports: [ 
    CommonModule,
    ViewAllRegistrationsComponent
  ],
  templateUrl: './registration-report.component.html',
  styles: ``  
})
export class RegistrationReportComponent {

}
