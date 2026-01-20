import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { ViewBranchesComponent } from '../../../shared/components/tables/basic-tables/branches/view-branches.component';
import { BhakiService } from '../../../shared/services/bhaki-service';

@Component({
  selector: 'app-manage-branch',
  standalone: true,
  imports: [CommonModule, FormsModule, ComponentCardComponent, ViewBranchesComponent],
  templateUrl: './manage-branch.component.html',
  styles: ['']
})
export class ManageBranchComponent implements OnInit {
  branches: Array<{ id: string; name: string; description?: string }> = [];

  // simple models used by the template (no reactive forms)
  editModel = { branchId: '', name: '', description: '' };
  addModel = { name: '', description: '' };

  constructor(private bhakiService: BhakiService) {}

  ngOnInit(): void {
    this.getBranches();
  }

  getBranches() {
    // replace with service call
    this.bhakiService.getBranches().subscribe({
      next: (res) => {
        this.branches = res;
      },
      error: (err) => { },
    });
  }

  onSelectBranch(id: string) {
    const branch = this.branches.find(b => b.id === id);
    if (branch) {
      this.editModel.branchId = branch.id;
      this.editModel.name = branch.name;
      this.editModel.description = branch.description || '';
    } else {
      this.editModel = { branchId: '', name: '', description: '' };
    }
  }

  updateBranch() {
    if (!this.editModel.branchId || !this.editModel.name || !this.editModel.description) return;
    const payload = { ...this.editModel };
    // TODO: call branch update service
    console.log('Update branch', payload);
    this.bhakiService.updateBranch(payload).subscribe({
      next: (res) => {
        this.getBranches();
      },
      error: (err) => {
        console.log(err);
      },
    });

    // reflect change locally
    const idx = this.branches.findIndex(b => b.id === payload.branchId);
    if (idx > -1) {
      this.branches[idx] = { id: payload.branchId, name: payload.name, description: payload.description };
    }
  }

  saveBranch() {
    if (!this.addModel.name || !this.addModel.description) return;
    const payload = { ...this.addModel };
    // TODO: call branch create service
    const id = Date.now().toString();
    this.branches.push({ id, name: payload.name, description: payload.description });
    this.addModel = { name: '', description: '' };
  }
}