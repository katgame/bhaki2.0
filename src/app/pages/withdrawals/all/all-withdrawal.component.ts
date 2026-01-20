import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { BasicTableOneComponent } from '../../../shared/components/tables/basic-tables/basic-table-one/basic-table-one.component';
import { BasicTableTwoComponent } from '../../../shared/components/tables/basic-tables/basic-table-two/basic-table-two.component';

@Component({
  selector: 'app-all-withdrawal',
  imports: [
    ComponentCardComponent,
    PageBreadcrumbComponent,
    BasicTableOneComponent,
  ],
  templateUrl: './all-withdrawal.component.html',
  styles: ``
})
export class AllWithdrawalComponent {

}
