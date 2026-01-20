// ...existing code...
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BhakiService } from '../../../../services/bhaki-service';
import { TokenStorageService } from '../../../../services/token-storage.service';
import { Course } from '../../../../models/course';
import { FormsModule } from '@angular/forms';
import { Branch } from '../../../../models/branch';
import { SelectComponent } from '../../../form/select/select.component';
import { LabelComponent } from '../../../form/label/label.component';


@Component({
  selector: 'app-courses',
  imports: [CommonModule, FormsModule, SelectComponent, LabelComponent],
  templateUrl: './courses.component.html',
  styles: ``,
})
export class CoursesComponent {
  Math = Math;
  userDetails: any;
  tableRowData: Course[] = [];
  paginatedData: Course[] = [];
  filteredData: Course[] = []; // ← for search and sort
  // pagination state
  currentPage = 1;
  pageSize = 10;

  selectedRows: string[] = [];
  selectAll = false;

  // edit state
  editingRowId: string | null = null;
  editBuffer: any = {};

  // add row state
  isAdding = false;
  newRow: Partial<Course> = {  name: '', description: '', courseDuration: '', price: 0 };

   // search and sort
  searchQuery = '';
  sortColumn: keyof Course | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  branchName: string;
  branchDescription: string;
  selectedBranch: Branch | null = null;
  branchOptions: { label: string; value: string; id: string }[] = [];

  constructor(
    private bhakiService: BhakiService,
    private tokenStorage: TokenStorageService
  ) {
    this.userDetails = this.tokenStorage.getUser();
    this.branchName = '';
    this.branchDescription = '';
    this.getBranches();
  
  }

  getBranches() {
    this.bhakiService.getBranches().subscribe({
      next: (res) => {
          this.branchOptions = res.map((branch: Branch) => ({
                   label: branch.name ,
                   value: branch.id,
                   id: branch.id
                 }));
      },
      error: (err) => { },
    });
  }

  onBranchSelected(event: any) {
    this.branchDescription = this.branchOptions.find(b => b.value === event)?.label || '';
    this.getCourses(event);
  }
  getCourses(branchId: string) {
    this.bhakiService.getCourses( branchId).subscribe({
      next: (res) => {
        this.tableRowData = res;
        // this.updatePaginatedData();
        this.applyFilters();
      },
      error: (err) => { },
    });
  }
  updatePaginatedData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  // start "add new" flow
  startAdd() {
    this.isAdding = true;
    // initialize with a temporary id (server should normalize)
    this.newRow = {  name: '', description: '', courseDuration: '', price: 0 };
  }

  cancelAdd() {
    this.isAdding = false;
    this.newRow = { name: '', description: '', courseDuration: '', price: 0 };
  }

  async confirmAdd() {
    // basic validation
    if (!this.newRow.name || this.newRow.name.trim() === '' || !this.newRow.description  ) {
      // You can wire a UI error state instead of alert
      alert('Name and Description are required');
      this.cancelAdd();
      return;
    }

    const courseRequest: Partial<Course> = {
      branchId: this.branchName,
      name: this.newRow.name,
      description: this.newRow.description,
      courseDuration: this.newRow.courseDuration ?? '',
      createdOn: new Date().toISOString(),
      price: this.newRow.price,
    };
    // Optional: persist to server. Uncomment and adapt if BhakiService has createBranch
    this.bhakiService.addCourse(courseRequest).subscribe({
      next: (saved) => {

        this.getCourses(this.branchName);
      },
      error: (err) => {
        console.log(err);
      }
    });
       this.cancelAdd();
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
      this.selectedRows = this.paginatedData.map((row) => row.id);
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
  // start inline edit
  startEdit(row: any) {
    this.editingRowId = row.id;
    this.editBuffer = { ...row }; // copy to buffer
  }

  // cancel edit
  cancelEdit() {
    this.editingRowId = null;
    this.editBuffer = {};
  }

  // save edit (updates local array; call API here to persist)
  saveEdit() {
    if (!this.editBuffer || !this.editBuffer.id) return;

    const idx = this.tableRowData.findIndex(r => r.id === this.editBuffer.id);
    if (idx !== -1) {
      // locally update UI
      this.tableRowData[idx] = { ...this.tableRowData[idx], ...this.editBuffer };
      //Check if name and description are not empty
      if (this.tableRowData[idx].name.trim() === '' || this.tableRowData[idx].description.trim() === '') {
        this.cancelEdit();
        return;
      }
      this.bhakiService.updateCourses(this.tableRowData[idx]).subscribe({
        next: (res) => {
          this.getCourses(this.branchName);
        },
        error: (err) => {
          console.log(err);
        },
      });
      console.log('Course saved:', this.tableRowData[idx]);
    }
    this.cancelEdit();
  }

  deleteRow(row: Course) {
    if (!row) return;
    if (!confirm(`Delete course ${row.name}?`)) return;

    const idsToDelete = [row.id];
    const backup = [...this.tableRowData];

   // optimistic removal
   this.tableRowData = this.tableRowData.filter(b => !idsToDelete.includes(b.id));
   this.selectedRows = [];
   this.selectAll = false;
   this.updatePaginatedData();

   // call delete for each — adapt to a bulk API if available
   idsToDelete.forEach(id => {
     this.bhakiService.deleteCourses(row.id).subscribe({
       next: () => { this.getCourses(this.branchName); },
       error: (err) => {
         console.error('Failed to delete branch', id, err);
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
        (course) =>
          course.name?.toLowerCase().includes(q) ||
          course.description?.toLowerCase().includes(q) ||
          course.courseDuration?.toLowerCase().includes(q)
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
    this.updatePaginatedData();
  }

  // ✅ Sort toggling
  sortData(column: keyof Course) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }
}