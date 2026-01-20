import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxComponent } from '../../../form/input/checkbox.component';
import { Registration } from '../../../../models/registration';
import { BhakiService } from '../../../../services/bhaki-service';
import { TokenStorageService } from '../../../../services/token-storage.service';
import { Branch } from '../../../../models/branch';
import { SelectComponent } from '../../../form/select/select.component';
import { DatePickerComponent } from '../../../form/date-picker/date-picker.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-all-registrations',
  imports: [CommonModule, FormsModule, SelectComponent, DatePickerComponent],
  templateUrl: './view-all-registrations.component.html',
  styles: ``,
})
export class ViewAllRegistrationsComponent implements OnInit {
  branches: Branch[] = [];
  branchOptions: { label: string; value: string }[] = [];

  Math = Math;
  userDetails: any;
  tableRowData: Registration[] = [];
  filteredData: Registration[] = [];
  paginatedData: Registration[] = [];

  // pagination state
  currentPage = 1;
  pageSize = 10;

  selectedRows: string[] = [];
  selectAll = false;

  // filter state
  showFilters = false;
  selectedBranch: string = '';
  dateFrom: string = '';
  dateTo: string = '';
  searchQuery: string = '';

  // sort state
  sortColumn: keyof Registration | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private bhakiService: BhakiService,
    private tokenStorage: TokenStorageService,
    private router : Router
  ) {
    this.userDetails = this.tokenStorage.getUser();

    this.bhakiService.getAllRegistrations('null').subscribe({
      next: (res) => {
        this.tableRowData = res;
        this.applyFilters();
      },
      error: (err) => {},
    });
  }

  ngOnInit(): void {
    this.getBranches();
  }

  getBranches() {
    this.bhakiService.getBranches().subscribe({
      next: (res) => {
        this.branches = res;
        this.branchOptions = res.map((branch: Branch) => ({
          label: branch.name,
          value: branch.id
        }));
      },
      error: (err) => { },
    });
  }

  get branchOptionsWithAll() {
    return [{ label: 'All Branches', value: '' }, ...this.branchOptions];
  }

  applyFilters() {
    // Ensure we have data to filter
    if (!this.tableRowData || this.tableRowData.length === 0) {
      this.filteredData = [];
      this.paginatedData = [];
      return;
    }

    let data = [...this.tableRowData];

    // Search filter - search on name, surname, registrationID, and IdNumber only
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.trim().toLowerCase();
      data = data.filter((reg) => {
        const regNumber = reg.registrationNumber ? String(reg.registrationNumber).toLowerCase() : '';
        const studentName = reg.studentName ? String(reg.studentName).toLowerCase() : '';
        const surname = reg.surname ? String(reg.surname).toLowerCase() : '';
        const studentId = reg.studentId ? String(reg.studentId).toLowerCase() : '';
        
        return regNumber.includes(query) ||
               studentName.includes(query) ||
               surname.includes(query) ||
               studentId.includes(query);
      });
    }

    // Branch filter
    if (this.selectedBranch) {
      const selectedBranchObj = this.branches.find(b => b.id === this.selectedBranch);
      if (selectedBranchObj) {
        data = data.filter((reg) => reg.branchName === selectedBranchObj.name);
      }
    }

    // Date range filter
    if (this.dateFrom) {
      const fromDate = new Date(this.dateFrom);
      data = data.filter((reg) => {
        const regDate = new Date(reg.registrationDate);
        return regDate >= fromDate;
      });
    }

    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      toDate.setHours(23, 59, 59, 999); // Include entire end date
      data = data.filter((reg) => {
        const regDate = new Date(reg.registrationDate);
        return regDate <= toDate;
      });
    }

    // Sort
    if (this.sortColumn) {
      const column = this.sortColumn as keyof Registration;
      data.sort((a, b) => {
        let valA: any = a[column];
        let valB: any = b[column];

        // Handle date fields
        const dateFields: string[] = ['registrationDate', 'createdOn', 'commencementDate'];
        if (dateFields.includes(column as string)) {
          valA = valA ? new Date(valA).getTime() : 0;
          valB = valB ? new Date(valB).getTime() : 0;
        } else {
          // Handle string fields
          valA = (valA ?? '').toString().toLowerCase();
          valB = (valB ?? '').toString().toLowerCase();
        }

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredData = data;
    this.currentPage = 1; // Reset to first page when filters change
    this.updatePaginatedData();
  }

  clearFilters() {
    this.selectedBranch = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.searchQuery = '';
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.applyFilters();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
    //clear filters when hiding 
    if (!this.showFilters) {
      this.clearFilters();
    }
  }

  handleDateFromChange(event: { dateStr?: string }) {
    this.dateFrom = event?.dateStr ?? '';
    this.applyFilters();
  }

  handleDateToChange(event: { dateStr?: string }) {
    this.dateTo = event?.dateStr ?? '';
    this.applyFilters();
  }

  updatePaginatedData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePaginatedData();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  handleSelectAll() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedRows = this.paginatedData.map((row) => row.registrationId);
    } else {
      this.selectedRows = [];
    }
  }

  handleRowSelect(id: string) {
    if (this.selectedRows.includes(id)) {
      this.selectedRows = this.selectedRows.filter((rowId) => rowId !== id);
    } else {
      this.selectedRows = [...this.selectedRows, id];
    }
  }

  getBadgeColor(type: string): 'success' | 'warning' | 'error' {
    if (type === 'Complete') return 'success';
    if (type === 'Pending') return 'warning';
    return 'error';
  }

  sortData(column: keyof Registration | string) {
    const validColumn = column as keyof Registration;
    if (this.sortColumn === validColumn) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = validColumn;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  viewRegistration(regId: string) {
    this.router.navigate(["registration-view", regId]);
  }
}
