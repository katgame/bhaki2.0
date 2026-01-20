// ...existing code...
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BhakiService } from '../../../../services/bhaki-service';
import { TokenStorageService } from '../../../../services/token-storage.service';
import { Branch, BranchRequest } from '../../../../models/branch';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../ui/modal/modal.component';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-view-branches',
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './view-branches.component.html',
  styles: ``,
})
export class ViewBranchesComponent {
  Math = Math;
  userDetails: any;
  tableRowData: Branch[] = [];
  paginatedData: Branch[] = [];

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
  newRow: Partial<Branch> = { id: '', name: '', description: '' };

  // delete confirmation modal state
  isDeleteModalOpen = false;
  branchToDelete: Branch | null = null;

  constructor(
    private bhakiService: BhakiService,
    private tokenStorage: TokenStorageService,
    private toast: ToastService
  ) {
    this.userDetails = this.tokenStorage.getUser();

    this.getBranches();
  }

  getBranches() {
    this.bhakiService.getBranches().subscribe({
      next: (res) => {
        this.tableRowData = res;
        this.updatePaginatedData();
      },
      error: (err) => { },
    });
  }
  updatePaginatedData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.tableRowData.slice(startIndex, endIndex);
  }

  // start "add new" flow
  startAdd() {
    this.isAdding = true;
    // initialize with a temporary id (server should normalize)
    this.newRow = {  name: '', description: '' };
  }

  cancelAdd() {
    this.isAdding = false;
    this.newRow = { name: '', description: '' };
  }

  async confirmAdd() {
    // basic validation
    if (!this.newRow.name || this.newRow.name.trim() === '' || !this.newRow.description  ) {
      // You can wire a UI error state instead of alert
      alert('Name and Description are required');
      this.cancelAdd();
      return;
    }

    const branchRequest: BranchRequest = {
      name: this.newRow.name,
      description: this.newRow.description,
    };
    // Optional: persist to server. Uncomment and adapt if BhakiService has createBranch
    this.bhakiService.addBranch(branchRequest).subscribe({
      next: (saved) => {
    
        this.getBranches();
      },
      error: (err) => {
      }
    });
       this.cancelAdd();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePaginatedData();
  }

  get totalPages(): number {
    return Math.ceil(this.tableRowData.length / this.pageSize);
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
      this.bhakiService.updateBranch(this.tableRowData[idx]).subscribe({
        next: (res) => {
          this.getBranches();
        },
        error: (err) => {
          console.log(err);
        },
      });
      console.log('Branch saved:', this.tableRowData[idx]);
    }
    this.cancelEdit();
  }

  deleteRow(row: Branch) {
    if (!row) return;
    this.branchToDelete = row;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.branchToDelete = null;
  }

  confirmDelete() {
    if (!this.branchToDelete) return;

    const row = this.branchToDelete;
    const idsToDelete = [row.id];
    const backup = [...this.tableRowData];

    // Close modal first
    this.closeDeleteModal();

    // Optimistic removal
    this.tableRowData = this.tableRowData.filter(b => !idsToDelete.includes(b.id));
    this.selectedRows = [];
    this.selectAll = false;
    this.updatePaginatedData();

    // Call delete API
    idsToDelete.forEach(id => {
      this.bhakiService.deleteBranch(row.id).subscribe({
        next: () => { 

          // Refresh branches to ensure UI is in sync
          this.getBranches();
          this.toast.success('Branch deleted successfully');
        },
        error: (err) => {
          console.error('Failed to delete branch', id, err);
          // Error handling: rollback if delete fails
          this.tableRowData = backup;
          this.updatePaginatedData();
        }
      });
    });
  }

}