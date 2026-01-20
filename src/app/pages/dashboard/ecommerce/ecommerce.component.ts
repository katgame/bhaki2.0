import { Component } from '@angular/core';
import { EcommerceMetricsComponent } from '../../../shared/components/ecommerce/ecommerce-metrics/ecommerce-metrics.component';
import { MonthlySalesChartComponent } from '../../../shared/components/ecommerce/monthly-sales-chart/monthly-sales-chart.component';
import { MonthlyTargetComponent } from '../../../shared/components/ecommerce/monthly-target/monthly-target.component';
import { StatisticsChartComponent } from '../../../shared/components/ecommerce/statics-chart/statics-chart.component';
import { DemographicCardComponent } from '../../../shared/components/ecommerce/demographic-card/demographic-card.component';
import { RecentOrdersComponent } from '../../../shared/components/ecommerce/recent-orders/recent-orders.component';
import { ViewAllRegistrationsComponent } from '../../../shared/components/tables/basic-tables/registrations/view-all-registrations.component';
import { RegistrationStatsComponent } from '../../../shared/components/ecommerce/registration-stats/registration-stats.component';
import { TokenStorageService } from '../../../shared/services/token-storage.service';
import { Router } from '@angular/router';
import { UserDetails } from '../../../shared/models/users';

@Component({
  selector: 'app-ecommerce',
  imports: [
    EcommerceMetricsComponent,
    ViewAllRegistrationsComponent,
    RegistrationStatsComponent,
    // MonthlySalesChartComponent,
    // MonthlyTargetComponent,
    // StatisticsChartComponent,
    // DemographicCardComponent,
    // RecentOrdersComponent,
  ],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent { 
   private userDetails: UserDetails | null = null;
  constructor(  private tokenService: TokenStorageService,  private router: Router) {
    this.userDetails = this.tokenService.getUser();
    if (!this.userDetails || !this.userDetails.role.includes('Admin') && !this.userDetails.role.includes('Manager')) {
      this.router.navigate(['/admin-registration']);
    }
  }
}

