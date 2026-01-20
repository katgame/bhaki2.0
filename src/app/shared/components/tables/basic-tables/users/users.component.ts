// ...existing code...
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BhakiService } from '../../../../services/bhaki-service';
import { TokenStorageService } from '../../../../services/token-storage.service';
import { Course } from '../../../../models/course';
import { FormsModule } from '@angular/forms';
import { Branch } from '../../../../models/branch';
import { UserDetails } from '../../../../models/users';
import { BadgeComponent } from '../../../ui/badge/badge.component';
import { ToastService } from '../../../../services/toast.service';
import { Router } from '@angular/router';

type NewUserRow = {
  user: {
    name: string;
    surname: string;
    email: string;
    password: string;
    confirmPassword: string;
    lockoutEnabled: boolean;
  };
  branch: {
    id: string;
    name: string;
  };
  role: string;
};

@Component({
  selector: 'app-users',
  imports: [CommonModule, BadgeComponent, FormsModule],
  templateUrl: './users.component.html',
  styles: ``,
})
export class UsersTableComponent {
  Math = Math;
  userDetails: UserDetails | null = null;
  tableRowData: UserDetails[] = [];
  paginatedData: UserDetails[] = [];
  filteredData: UserDetails[] = []; // ← for search and sort
  // pagination state
  currentPage = 1;
  pageSize = 10;

  selectedRows: string[] = [];
  selectAll = false;

  // edit state
  editingRowId: string | null = null;
  editBuffer: any = {};

  // search and sort
  searchQuery = '';
  sortColumn: keyof UserDetails | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Handle search input changes
  onSearchChange(value: string) {
    this.searchQuery = value;
    this.currentPage = 1; // Reset to first page when search changes
    this.applyFilters();
  }

  // add row state
  isAdding = false;
  newRow: NewUserRow = this.createEmptyRow();

  branches: Branch[] = [];
  branchOptions: { label: string; value: string; id: string }[] = [];
  RolesOptions = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Clerk', value: 'Clerk' },
    { label: 'Manager', value: 'Manager' },
  ];
  constructor(
    private bhakiService: BhakiService,
    private tokenStorage: TokenStorageService,
    private toastService: ToastService,
    private router : Router
  ) {
    this.userDetails = this.tokenStorage.getUser();
    this.getBranches();
    this.getUsers();

  }

  private createEmptyRow(): NewUserRow {
    return {
      user: { name: '', surname: '', email: '', password: '', confirmPassword: '', lockoutEnabled: false },
      branch: { id: '', name: '' },
      role: '',
    };
  }
  getBranches() {
    this.bhakiService.getBranches().subscribe({
      next: (res) => {
        // keep full branch objects for selection and lookups
        this.branches = res;
        this.branchOptions = res.map((branch: Branch) => ({
          label: branch.name,
          value: branch.id,
          id: branch.id
        }));
      },
      error: (err) => { },
    });
  }
  onBranchSelected(branchId: string) {
    const selected = this.branchOptions.find(branch => branch.value === branchId);
    this.newRow.branch.id = branchId;
    this.newRow.branch.name = selected?.label ?? '';
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
      this.selectedRows = this.paginatedData
        .map((row) => row.user.id)
        .filter((id): id is string => id !== undefined);
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

  getUsers() {
    this.bhakiService.getAllUsers().subscribe({
      next: (res) => {
        this.tableRowData = res;
        this.applyFilters();
      },
      error: (err) => { },
    });
  }


  deleteRow(row: UserDetails) {
    if (!row) return;
    if (!confirm(`Delete user ${row.user.name} ${row.user.surname}?`)) return;

    const idsToDelete = [row.user.id];
    const backup = [...this.tableRowData];

    // optimistic removal
    this.tableRowData = this.tableRowData.filter(b => !idsToDelete.includes(b.user.id));
    this.selectedRows = [];
    this.selectAll = false;
    this.updatePaginatedData();

    // call delete for each — adapt to a bulk API if available
    idsToDelete.forEach(id => {
      this.bhakiService.enableUser(row.user.id).subscribe({
        next: () => { this.getUsers(); },
        error: (err) => {
          console.error('Failed to delete user', id, err);
          // simple error handling: rollback once if any fail
          this.tableRowData = backup;
          this.updatePaginatedData();
        }
      });
    });
  }
  // ✅ Combine search + sort + pagination
  applyFilters() {
    let data = [...this.tableRowData];

    // 🔍 Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      data = data.filter(
        (users) =>
          users.user.name?.toLowerCase().includes(q) ||
          users.user.surname?.toLowerCase().includes(q) ||
          users.user.email?.toLowerCase().includes(q) ||
          users.branch.name?.toLowerCase().includes(q)
      );
    }

    // 🔽 Sort
    if (this.sortColumn) {
      data.sort((a: any, b: any) => {
        const valA = (a[this.sortColumn] ?? '').toString().toLowerCase();
        const valB = (b[this.sortColumn] ?? '').toString().toLowerCase();

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredData = data;
    
    // Reset to page 1 when filtering changes to avoid empty pages
    const maxPage = Math.ceil(this.filteredData.length / this.pageSize);
    if (this.currentPage > maxPage && maxPage > 0) {
      this.currentPage = 1;
    } else if (maxPage === 0) {
      this.currentPage = 1;
    }
    
    this.updatePaginatedData();
  }

  // ✅ Sort toggling
  sortData(column: keyof UserDetails) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getBranchDisplayName(row: UserDetails): string {
    return row.branch?.name ?? 'N/A';
  }

  getBadgeColor(type: boolean): 'success' | 'error' {
    if (type === null || type === undefined) return 'error';

    if (type === true) return 'error';
    if (type === false) return 'success';
    return 'success';
  }

  enableUser(enable: boolean, user: any) {

    if (enable === false) {
      this.bhakiService.deleteUser(user.id).subscribe({
        next: (res) => {
          this.toastService.show('User disabled successfully', 'success');
          this.getUsers();

        },
        error: (err) => {
          this.toastService.show('Failed to disable user', 'error');
        },
      });
    } else {
      this.bhakiService.enableUser(user.id).subscribe({
        next: (res) => {
          this.toastService.show('User enabled successfully', 'success' );
          this.getUsers();

        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  viewUserProfile(user: any) { 
    // Navigate to user profile page
    this.router.navigate(["profile", user.id]);
  }

  // Toggle add new user form
  toggleAddForm() {
    this.isAdding = !this.isAdding;
    if (!this.isAdding) {
      this.newRow = this.createEmptyRow();
    }
  }

  // Cancel add new user
  cancelAdd() {
    this.isAdding = false;
    this.newRow = this.createEmptyRow();
  }

  // Confirm add new user
  confirmAdd() {
    // Basic validation
    if (
      !this.newRow.user.name ||
      !this.newRow.user.surname ||
      !this.newRow.user.email ||
      !this.newRow.user.password ||
      !this.newRow.user.confirmPassword ||
      !this.newRow.branch.id ||
      !this.newRow.role
    ) {
      this.toastService.show('Please fill all required fields', 'error');
      return;
    }
    if (this.newRow.user.password !== this.newRow.user.confirmPassword) {
      this.toastService.show('Passwords do not match', 'error');
      return;
    }

    // Prepare payload
    const payload = {
      name: this.newRow.user.name,
      surname: this.newRow.user.surname,
      email: this.newRow.user.email,
      password: this.newRow.user.password,
      branchId: this.newRow.branch.id,
      role: [this.newRow.role].toString(),
      userName: this.newRow.user.email,
    };

    // Call service to add user
     this.bhakiService.registerUser(payload).subscribe({
     next: (res) => {
         this.toastService.show('User added successfully', 'success');
         this.getUsers();
         this.cancelAdd();
       },
       error: (err) => {
         this.toastService.show('Failed to add user', 'error');
       }
    });
  }
  
} 