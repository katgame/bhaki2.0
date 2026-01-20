import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "../../../environments/environment";
import { Course } from '../models/course';
import { UpdateUserDetails } from '../models/users';
import { RegistrationDetails } from '../models/registration';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
};
@Injectable({
  providedIn: 'root'
})
export class BhakiService {

  private hostService: string;

  constructor(private httpClient: HttpClient,
  ) {
    this.hostService = environment.bhakiApi
  }

  //HOst Session
  public createRegitration(request: any): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.post(this.hostService + 'api/Registration/add-registration', request, httpOptions);
  }


  public getBranches(): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + 'api/Branch/get-all-branches', httpOptions);
  }

  public getReferrals(): Observable<any> {
    return this.httpClient.get(this.hostService + 'api/Referral/get-all-referrals', httpOptions);
  }

  public createYocoCheckout(request: any): Observable<any> {
    return this.httpClient.post(this.hostService + 'api/Yoco/create-checkout', request, httpOptions);
  }

  public getTotalFinancialStats(): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + 'api/Account/get-total-revenue', httpOptions);
  }

  public getMonthlyOverview(): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + 'api/Account/get-montly-revenue', httpOptions);
  }
  public getRegistrationDetails(registrationNumber: string): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + 'api/Registration/get-registration-details/' + registrationNumber, httpOptions);
  }
  public addBranch(branch: any): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.post(this.hostService + 'api/Branch/add-branch', branch, httpOptions);
  }
  public updateBranch(branch: any): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.put(this.hostService + 'api/Branch/update-branch', branch, httpOptions);
  }
    public deleteBranch(branchId: any): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.delete(this.hostService + 'api/Branch/delete-branch/' + branchId, { headers });
  }
  public getBranchesForDashBoard(): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + 'api/Branch/get-all-branches-for-report', httpOptions);
  }

  public getMontlyBranchesForDashBoard(): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + 'api/Branch/get-all-branches-montly-for-report', httpOptions);
  }

  public getDashBoard(): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + 'api/Registration/get-dashboard', httpOptions);
  }

  public registerUser(userInfo: any): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.post(this.hostService + 'api/Authentication/register-user', userInfo, httpOptions);
  }

  public deleteUser(userId: string): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.delete(this.hostService + 'api/Authentication/delete-user/' + userId, httpOptions);
  }
  public enableUser(userId: any): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.put(this.hostService + 'api/Authentication/enable-user/' + userId, httpOptions);
  }

  public getUserDetails(userId: string): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + 'api/Authentication/get-user-details/' + userId, httpOptions);
  }
  public getUserRoles(): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + 'api/Authentication/get-user-roles', httpOptions);
  }
  public getAllUsers(): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + 'api/Authentication/all-user', httpOptions);
  }
  public getBranchRegistrationsByRangeAndBranch(startdate: any, enddate: any, branchId: any, userId: any): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + 'api/Registration/get-all-registrations-by-date-branchId/' + startdate + '/' + enddate + '/' + branchId + '/' + userId, httpOptions);
  }

  public getAllRegistrations(userId: any): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + 'api/Registration/get-all-registrations' + '/' + userId, httpOptions);
  }


  public getAllRegistrationsByBranch(branchId: any, userId: any): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + 'api/Registration/get-all-registrations-by-branch-id/' + branchId + '/' + userId, httpOptions);
  }

  public getAllRegistrationsByIDNumber(IdNumber: any, userId: any): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + 'api/Registration/get-registration-details-by-id/' + IdNumber + '/' + userId, httpOptions);
  }
  public getAllRegistrationsByRange(start: any, end: any): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + `api/Registration/get-all-registrations-by-date/${start}/${end}`, httpOptions);
  }
  public getCourses(branchId: string): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + 'api/Course/get-all-courses/' + branchId, httpOptions);
  }

  public addCourse(course: Partial<Course>): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.post(this.hostService + 'api/Course/add-course', course, httpOptions);
  }
  public updateCourses(course: Course): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.put(this.hostService + 'api/Course/update-course', course, httpOptions);
  }

    public deleteCourses(courseId: string): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.delete(this.hostService + 'api/Course/delete-course/' + courseId, httpOptions);
  }
  public login(credentials: { username: any; password: any; }): Observable<any> {

    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.post(this.hostService + 'api/Authentication/login-user', {
      emailOrPhone: credentials.username,
      password: credentials.password
    }, httpOptions)
  }

  public deleteRegistration(registrationId: any, UserId: any): Observable<any> {

    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.delete(this.hostService + `api/Registration/delete-registration/${registrationId}/${UserId}`, httpOptions)
  }

  public updateUserDetails(userID: string, UpdateUserDetails: UpdateUserDetails): Observable<any> {

    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.patch(this.hostService + `api/Authentication/update-user-details/${userID}`, UpdateUserDetails, httpOptions)
  }

  public updateRegistration( request: any): Observable<any> {

    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.put(this.hostService + `api/Registration/update-registration`, request, httpOptions)
  }

  public getRegistrationAuditTrail(registrationId: string): Observable<any> {
    const headers = {
      ['Access-Control-Allow-Origin']: '*'
    };
    return this.httpClient.get(this.hostService + `api/Registration/get-audit-trail/${registrationId}`, httpOptions);
  }

  // Reporting
  public getReportSummary(start?: string, end?: string, branchId?: string): Observable<any> {
    let url = this.hostService + 'api/Reports/summary?';
    if (start) url += `start=${start}&`;
    if (end) url += `end=${end}&`;
    if (branchId) url += `branchId=${branchId}&`;
    return this.httpClient.get(url.replace(/[&?]$/, ''), httpOptions);
  }

  public getReportSeries(start: string, end: string, granularity: string, branchId?: string): Observable<any> {
    const branchParam = branchId ? `&branchId=${branchId}` : '';
    return this.httpClient.get(this.hostService + `api/Reports/series?start=${start}&end=${end}&granularity=${granularity}${branchParam}`, httpOptions);
  }

  public getReportByBranch(start: string, end: string, branchId?: string): Observable<any> {
    const branchParam = branchId ? `&branchId=${branchId}` : '';
    return this.httpClient.get(this.hostService + `api/Reports/by-branch?start=${start}&end=${end}${branchParam}`, httpOptions);
  }

  public getReportByCourse(start: string, end: string, branchId?: string): Observable<any> {
    const branchParam = branchId ? `&branchId=${branchId}` : '';
    return this.httpClient.get(this.hostService + `api/Reports/by-course?start=${start}&end=${end}${branchParam}`, httpOptions);
  }

  public getRecentRegistrations(take = 20, branchId?: string): Observable<any> {
    const branchParam = branchId ? `&branchId=${branchId}` : '';
    return this.httpClient.get(this.hostService + `api/Reports/recent?take=${take}${branchParam}`, httpOptions);
  }
}
  

