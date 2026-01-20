import { Routes } from '@angular/router';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { AllWithdrawalComponent } from './pages/withdrawals/all/all-withdrawal.component';
import { AuthGuard } from './shared/services/auth.guard';
import { AdminRegistrationComponent } from './shared/components/form/admin-registration/admin-registration.component';
import { ManageBranchComponent } from './pages/branches/manage-branches/manage-branch.component';
import { CoursesComponent } from './shared/components/tables/basic-tables/courses/courses.component';
import { UsersTableComponent } from './shared/components/tables/basic-tables/users/users.component';
import { AllRegistrationComponent } from './pages/registrations/admin-reg/admin-reg.component';
import { RegistrationReportComponent } from './pages/registrations/registration-reports/registration-report.component';
import { ViewRegistrationComponent } from './pages/registrations/view-registration/view-reg.component';
import { ReportsComponent } from './pages/reports/reports.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin', "Clerk", "Student", "Manager"] },
    children: [
      {
        data: { roles: ['Admin'] },
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title:
          'Bhaki Dashboard ',
      },
      {

        data: { roles: ['Admin'] },
        path: 'calendar',
        component: CalenderComponent,
        title: 'Bhaki Calender '
      },

      {
        data: { roles: ['Admin'] },
        path: 'profile/:userId',
        component: ProfileComponent,
        title: 'Bhaki Profile Dashboard '
      },
      {
        data: { roles: ['Admin'] },
        path: 'form-elements',
        component: FormElementsComponent,
        title: 'Bhaki Form Elements Dashboard '
      },
      {
        data: { roles: ['Admin'] },
        path: 'basic-tables',
        component: BasicTablesComponent,
        title: 'Bhaki Basic Tables Dashboard '
      },
      {
        data: { roles: ['Admin'] },
        path: 'blank',
        component: BlankComponent,
        title: 'Bhaki Blank Dashboard '
      },
      // support tickets
      {
        data: { roles: ['Admin'] },
        path: 'invoice',
        component: InvoicesComponent,
        title: 'Bhaki Invoice Details Dashboard '
      },
      {
        data: { roles: ['Admin'] },
        path: 'line-chart',
        component: LineChartComponent,
        title: 'Bhaki Line Chart Dashboard '
      },
      {
        data: { roles: ['Admin'] },
        path: 'bar-chart',
        component: BarChartComponent,
        title: 'Bhaki Bar Chart Dashboard '
      },
      {
        data: { roles: ['Admin'] },
        path: 'alerts',
        component: AlertsComponent,
        title: 'Bhaki Alerts Dashboard '
      },
      {
        data: { roles: ['Admin'] },
        path: 'avatars',
        component: AvatarElementComponent,
        title: 'Bhaki Avatars Dashboard '
      },
      {
        data: { roles: ['Admin'] },
        path: 'badge',
        component: BadgesComponent,
        title: 'Bhaki Badges Dashboard '
      },
      {
        data: { roles: ['Admin'] },
        path: 'buttons',
        component: ButtonsComponent,
        title: 'Bhaki Buttons Dashboard '
      },
      {
        data: { roles: ['Admin'] },
        path: 'images',
        component: ImagesComponent,
        title: 'Bhaki Images Dashboard '
      },
      {
        data: { roles: ['Admin'] },
        path: 'videos',
        component: VideosComponent,
        title: 'Bhaki Videos Dashboard '
      },
      {
        data: { roles: ['Admin'] },
        path: 'all-withdrawals',
        component: AllWithdrawalComponent,
        title: 'Bhaki All Withdrawals Dashboard '
      },
      {
        data: { roles: ['Admin'] },
        path: 'manage-branch',
        component: ManageBranchComponent,
        title: 'Bhaki Manage Branches Dashboard '
      },
      {
        data: { roles: ['Admin'] },
        path: 'manage-course',
        component: CoursesComponent,
        title: 'Bhaki Manage Courses Dashboard '
      },
      {
        data: { roles: ['Admin'] },
        path: 'manage-user',
        component: UsersTableComponent,
        title: 'Bhaki Manage Users Dashboard '
      },
      {
        path: 'admin-registration',
        component: AllRegistrationComponent,
        title: 'Bhaki Admin Registration ',
        data: { roles: ['Admin', 'Clerk', 'Student', 'Manager'] }
      },
      {
        path: 'registration-report',
        component: RegistrationReportComponent,
        title: 'Bhaki Registration Reports ',
        data: { roles: ['Admin', 'Clerk', 'Manager'] }
      },
      {
        path: 'registration-view/:registationId',
        component: ViewRegistrationComponent,
        title: 'Bhaki Registration Reports ',
        data: { roles: ['Admin', 'Clerk', 'Manager'] }
      },
      {
        data: { roles: ['Admin'] },
        path: 'reports',
        component: ReportsComponent,
        title: 'Bhaki Reports Dashboard '
      },
    ]
  },
  // auth pages
  {
    path: 'signin',
    component: SignInComponent,
    title: 'Bhaki Sign In Dashboard ',
    data: { roles: ['Admin', 'Clerk', 'Student'] }
  },
  {
    path: 'signup',
    component: SignUpComponent,
    title: 'Bhaki Sign Up Dashboard ',
    data: { roles: ['Admin', 'Clerk', 'Student'] }
  },
  // error pages
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Bhaki NotFound Dashboard '
  },
];
