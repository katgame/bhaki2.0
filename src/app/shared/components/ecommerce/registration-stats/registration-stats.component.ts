import { Component, OnInit } from '@angular/core';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';
import { BhakiService } from '../../../services/bhaki-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TokenStorageService } from '../../../services/token-storage.service';
import { AppStore } from '../../../state/app.store';

@Component({
  selector: 'app-registration-stats',
  imports: [CommonModule, FormsModule],
  templateUrl: './registration-stats.component.html'
})
export class RegistrationStatsComponent implements OnInit   {
  constructor(private bhakiService: BhakiService, private token: TokenStorageService) {}
  DashboardStats: any = {
    totalRevenue: 0,
    totalDepositsPaid: 0,
    totalOutstandingDeposits: 0,
    totalRegistrations: 0,
  };
  branches: any[] = [];
  selectedBranchId: string = 'all';
  currentMonth: string = '';
  ngOnInit(): void {
    this.getBranches();
    this.getFinancialStats();
    this.currentMonth = new Date().toLocaleString('default', { month: 'long' });
  }

  getBranches() {
    this.bhakiService.getBranches().subscribe(res => {
      this.branches = res || [];
    });
  }

  getFinancialStats() {
    if (this.selectedBranchId === 'all') {
    this.bhakiService.getMonthlyOverview().subscribe({
      next: (res) => {
        if(res) {
          this.DashboardStats = res;
        }
        }
      });
      return;
    }

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = now.toISOString();
    const user = this.token.getUser() as any;
    const userId = user?.id || user?.user?.id || null;

    this.bhakiService.getBranchRegistrationsByRangeAndBranch(start, end, this.selectedBranchId, userId).subscribe({
      next: (regs) => {
        const data = regs || [];
        const totalDepositsPaid = data.reduce((sum: number, r: any) => sum + (Number(r.paidAmount) || 0), 0);
        const totalOutstandingDeposits = data.reduce((sum: number, r: any) => sum + (Number(r.outstandingAmount) || 0), 0);
        this.DashboardStats = {
          totalRevenue: totalDepositsPaid + totalOutstandingDeposits,
          totalDepositsPaid,
          totalOutstandingDeposits,
          totalRegistrations: data.length
        };
      }
    });
  }
 
  onBranchChange() {
    this.getFinancialStats();
  }
}
