import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels, ApexStroke, ApexFill, ApexTooltip, ApexGrid } from 'ng-apexcharts';
import { BhakiService } from '../../shared/services/bhaki-service';
import { TokenStorageService } from '../../shared/services/token-storage.service';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { SelectComponent, Option } from '../../shared/components/form/select/select.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';

type Granularity = 'day' | 'week' | 'month';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    SelectComponent,
    LabelComponent
  ],
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements OnInit {
  presetOptions: Option[] = [
    { label: 'Last 7 days', value: 'last7' },
    { label: 'Last 30 days', value: 'last30' },
    { label: 'Month to date', value: 'mtd' },
    { label: 'Year to date', value: 'ytd' }
  ];
  selectedPreset = 'last30';
  start!: string;
  end!: string;
  granularityOptions: Option[] = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' }
  ];
  granularity: Granularity = 'day';
  selectedBranchId: string = '';
  branchOptions: Option[] = [];
  branches: any[] = [];
  isStudent = false;

  summary: any = null;
  branchBreakdown: any[] = [];
  courseBreakdown: any[] = [];
  recent: any[] = [];

  // pagination
  pageSize = 8;
  branchPage = 1;
  coursePage = 1;
  recentPage = 1;

  // charts
  series: ApexAxisChartSeries = [];
  chartOptions: ApexChart = { type: 'area', height: 320, toolbar: { show: false } };
  xaxis: ApexXAxis = { categories: [] };
  dataLabels: ApexDataLabels = { enabled: false };
  stroke: ApexStroke = { curve: 'straight' };
  fill: ApexFill = { type: 'gradient', gradient: { opacityFrom: 0.55, opacityTo: 0 } };
  tooltip: ApexTooltip = { shared: true };
  grid: ApexGrid = { xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } };

  constructor(
    private bhaki: BhakiService,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    // Check if user is a student
    const user = this.tokenStorage.getUser();
    const roles = (user as any)?.role ?? (user as any)?.roles ?? [];
    this.isStudent = Array.isArray(roles)
      ? roles.some((r: string) => r?.toLowerCase?.() === 'student')
      : typeof roles === 'string'
        ? roles.toLowerCase() === 'student'
        : false;
    
    // Only load branches if user is not a student
    if (!this.isStudent) {
      this.loadBranches();
    } else {
      // Students should not filter by branch - they only see their own data
      this.selectedBranchId = '';
    }
    this.applyPreset(this.selectedPreset);
  }

  loadBranches() {
    this.bhaki.getBranches().subscribe({
      next: (data) => {
        this.branches = data || [];
        this.branchOptions = [
          { label: 'All Branches', value: '' },
          ...(data || []).map((branch: any) => ({
            label: branch.name,
            value: branch.id
          }))
        ];
      },
      error: (err) => {
        console.error('Failed to load branches', err);
        this.branches = [];
        this.branchOptions = [{ label: 'All Branches', value: '' }];
      }
    });
  }

  applyPreset(preset: string) {
    this.selectedPreset = preset;
    const now = new Date();
    switch (preset) {
      case 'last7':
        this.start = this.toIsoDate(new Date(now.getTime() - 7 * 86400000));
        break;
      case 'mtd':
        this.start = this.toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
        break;
      case 'ytd':
        this.start = this.toIsoDate(new Date(now.getFullYear(), 0, 1));
        break;
      default:
        this.start = this.toIsoDate(new Date(now.getTime() - 30 * 86400000));
        break;
    }
    this.end = this.toIsoDate(now);
    this.refresh();
  }

  refresh() {
    const startParam = this.start;
    const endParam = this.end;
    const branchId = this.selectedBranchId || undefined;
    
    this.bhaki.getReportSummary(startParam, endParam, branchId).subscribe(data => this.summary = data);
    this.bhaki.getReportSeries(startParam, endParam, this.granularity, branchId).subscribe(data => {
      this.xaxis = { categories: data.map((x: any) => new Date(x.bucketStart).toLocaleDateString()) };
      this.series = [
        { name: 'Registrations', data: data.map((x: any) => x.registrations) },
        { name: 'Paid', data: data.map((x: any) => x.paidAmount) },
        { name: 'Outstanding', data: data.map((x: any) => x.outstandingAmount) },
      ];
    });
    this.bhaki.getReportByBranch(startParam, endParam, branchId).subscribe(data => {
      this.branchBreakdown = data;
      this.branchPage = 1;
    });
    this.bhaki.getReportByCourse(startParam, endParam, branchId).subscribe(data => {
      this.courseBreakdown = data;
      this.coursePage = 1;
    });
    this.bhaki.getRecentRegistrations(50, branchId).subscribe(data => {
      this.recent = data;
      this.recentPage = 1;
    });
  }

  onBranchChange(branchId: string) {
    this.selectedBranchId = branchId;
    this.refresh();
  }

  onPresetChange(preset: string) {
    this.selectedPreset = preset;
    this.applyPreset(preset);
  }

  onGranularityChange(granularity: string) {
    this.granularity = granularity as Granularity;
    this.refresh();
  }

  private toIsoDate(d: Date): string {
    return d.toISOString();
  }

  get branchTotalPages() {
    return Math.max(1, Math.ceil(this.branchBreakdown.length / this.pageSize));
  }
  get courseTotalPages() {
    return Math.max(1, Math.ceil(this.courseBreakdown.length / this.pageSize));
  }
  get recentTotalPages() {
    return Math.max(1, Math.ceil(this.recent.length / this.pageSize));
  }
  get branchStart() {
    return this.branchBreakdown.length ? (this.branchPage - 1) * this.pageSize + 1 : 0;
  }
  get branchEnd() {
    return Math.min(this.branchPage * this.pageSize, this.branchBreakdown.length);
  }
  get courseStart() {
    return this.courseBreakdown.length ? (this.coursePage - 1) * this.pageSize + 1 : 0;
  }
  get courseEnd() {
    return Math.min(this.coursePage * this.pageSize, this.courseBreakdown.length);
  }
  get recentStart() {
    return this.recent.length ? (this.recentPage - 1) * this.pageSize + 1 : 0;
  }
  get recentEnd() {
    return Math.min(this.recentPage * this.pageSize, this.recent.length);
  }

  get branchPageData() {
    return this.paginate(this.branchBreakdown, this.branchPage);
  }
  get coursePageData() {
    return this.paginate(this.courseBreakdown, this.coursePage);
  }
  get recentPageData() {
    return this.paginate(this.recent, this.recentPage);
  }

  nextBranch() {
    this.branchPage = Math.min(this.branchPage + 1, this.branchTotalPages);
  }
  prevBranch() {
    this.branchPage = Math.max(1, this.branchPage - 1);
  }
  nextCourse() {
    this.coursePage = Math.min(this.coursePage + 1, this.courseTotalPages);
  }
  prevCourse() {
    this.coursePage = Math.max(1, this.coursePage - 1);
  }
  nextRecent() {
    this.recentPage = Math.min(this.recentPage + 1, this.recentTotalPages);
  }
  prevRecent() {
    this.recentPage = Math.max(1, this.recentPage - 1);
  }

  private paginate(arr: any[], page: number) {
    const start = (page - 1) * this.pageSize;
    return arr.slice(start, start + this.pageSize);
  }
}

