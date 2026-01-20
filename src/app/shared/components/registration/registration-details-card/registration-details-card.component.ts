import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppStore } from '../../../state/app.store';
import { Registration } from '../../../models/registration';
import { Subscription } from 'rxjs';
import { ModalComponent } from '../../ui/modal/modal.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { DatePickerComponent } from '../../form/date-picker/date-picker.component';
import { SelectComponent, Option } from '../../form/select/select.component';
import { LabelComponent } from '../../form/label/label.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { BhakiService } from '../../../services/bhaki-service';
import { TokenStorageService } from '../../../services/token-storage.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-registration-details-card',
  imports: [
    CommonModule,
    ModalComponent,
    InputFieldComponent,
    DatePickerComponent,
    SelectComponent,
    LabelComponent,
    ButtonComponent,
    DatePipe,
  ],
  templateUrl: './registration-details-card.component.html',
  styles: ``
})
export class RegistrationDetailsCardComponent implements OnInit, OnDestroy {
  registrationDetails: any | null = null;
  private subscription?: Subscription;
  
  // Modal state
  isEditModalOpen = false;
  isAdmin = false;
  
  // Form data
  editForm: {
    registrationNumber: string;
    registrationDate: string;
    paidAmount: number | string;
    outstandingAmount: number | string;
    branchId: string;
    courseId: string;
    receiptReference: string;
    commencementDate: string;
  } = {
    registrationNumber: '',
    registrationDate: '',
    paidAmount: '',
    outstandingAmount: '',
    branchId: '',
    courseId: '',
    receiptReference: '',
    commencementDate: ''
  };

  // Dropdown options
  branchOptions: Option[] = [];
  courseOptions: Option[] = [];
  
  // Loading state
  isSaving = false;
  userInfo: any;

  constructor(
    private store: AppStore,
    private cdr: ChangeDetectorRef,
    private bhakiService: BhakiService,
    private tokenStorage: TokenStorageService,
    private toastService: ToastService
  ) {
    this.userInfo = this.tokenStorage.getUser();
    // derive admin flag defensively from stored user roles
    const roles = (this.userInfo as any)?.role ?? (this.userInfo as any)?.roles ?? [];
    this.isAdmin = Array.isArray(roles)
      ? roles.some((r: string) => r?.toLowerCase?.() === 'admin')
      : typeof roles === 'string'
        ? roles.toLowerCase() === 'admin'
        : false;
  }

  ngOnInit(): void {
    this.subscription = this.store.$registrationDetails.subscribe((data) => {
      this.registrationDetails = data || null;
      this.cdr.markForCheck();
    });
    
    // Load branches and courses for dropdowns
    this.loadBranches();
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadBranches(): void {
    this.bhakiService.getBranches().subscribe({
      next: (res) => {
        this.branchOptions = res.map((branch: any) => ({
          label: branch.name,
          value: branch.id
        }));
      },
      error: (err) => {
        console.error('Error loading branches:', err);
      }
    });
  }

  loadCourses(branchId: string): void {
    if (!branchId) {
      this.courseOptions = [];
      return;
    }
    
    this.bhakiService.getCourses(branchId).subscribe({
      next: (res) => {
        this.courseOptions = res.map((course: any) => ({
          label: course.name,
          value: course.id
        }));
      },
      error: (err) => {
        console.error('Error loading courses:', err);
      }
    });
  }

  openEditModal(): void {
    if (!this.registrationDetails || !this.isAdmin) return;
    
    // Format date for date picker (expects Y-m-d format)
    // Use local time to avoid timezone offset issues
    let registrationDate = '';
    if (this.registrationDetails?.registration?.registrationDate) {
      const date = new Date(this.registrationDetails.registration.registrationDate);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        registrationDate = `${year}-${month}-${day}`; // Format as YYYY-MM-DD using local time
      }
    }

    // Format commencement date for date picker
    // Use local time to avoid timezone offset issues
    let commencementDate = '';
    if (this.registrationDetails?.registration?.commencementDate) {
      const date = new Date(this.registrationDetails.registration.commencementDate);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        commencementDate = `${year}-${month}-${day}`; // Format as YYYY-MM-DD using local time
      }
    }
    
    // Populate form with current values
    // Handle outstandingAmount and paidAmount - they can be 0, so use nullish coalescing
    const outstandingAmount = this.registrationDetails?.registration?.outstandingAmount != null 
      ? this.registrationDetails.registration.outstandingAmount 
      : '';
    const paidAmount = this.registrationDetails?.registration?.paidAmount != null 
      ? this.registrationDetails.registration.paidAmount 
      : '';
    
    this.editForm = {
      registrationNumber: this.registrationDetails?.registration?.registrationNumber || '',
      registrationDate: registrationDate,
      paidAmount: paidAmount,
      outstandingAmount: outstandingAmount,
      branchId: this.registrationDetails?.branch?.id || '',
      courseId: this.registrationDetails?.course?.id || '',
      receiptReference: this.registrationDetails?.registration?.recieptReference || '',
      commencementDate: commencementDate
    };
    
    // Load courses for the selected branch
    if (this.editForm.branchId) {
      this.loadCourses(this.editForm.branchId);
    }
    
    // Trigger change detection to ensure form values are set
    this.cdr.detectChanges();
    
    this.isEditModalOpen = true;
    
    // Use setTimeout to ensure date pickers are initialized after modal opens
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    // Reset form
    this.editForm = {
      registrationNumber: '',
      registrationDate: '',
      paidAmount: '',
      outstandingAmount: '',
      branchId: '',
      courseId: '',
      receiptReference: '',
      commencementDate: ''
    };
  }

  onBranchChange(branchId: string): void {
    this.editForm.branchId = branchId;
    this.editForm.courseId = ''; // Reset course when branch changes
    this.loadCourses(branchId);
  }

  onDateChange(event: any): void {
    if (event && event.dateStr) {
      this.editForm.registrationDate = event.dateStr;
    } else if (event && typeof event === 'string') {
      this.editForm.registrationDate = event;
    }
  }


  onCommencementDateChange(event: any): void {
    if (event && event.dateStr) {
      this.editForm.commencementDate = event.dateStr;
    } else if (event && typeof event === 'string') {
      this.editForm.commencementDate = event;
    }
  }
  saveChanges(): void {
    if (!this.registrationDetails || !this.isAdmin) return;
    
    this.isSaving = true;
    
    // Create updated registration details object
    const updatedDetails = {
      ...this.registrationDetails,
      registration: {
        ...this.registrationDetails.registration,
        registrationNumber: this.editForm.registrationNumber,
        registrationDate: this.editForm.registrationDate,
        commencementDate: this.editForm.commencementDate || '',
        paidAmount: this.editForm.paidAmount,
        outstandingAmount: this.editForm.outstandingAmount,
        recieptReference: this.editForm.receiptReference
      },
      branch: this.branchOptions.find(b => b.value === this.editForm.branchId) 
        ? { ...this.registrationDetails.branch, id: this.editForm.branchId, name: this.branchOptions.find(b => b.value === this.editForm.branchId)?.label || '' }
        : this.registrationDetails.branch,
      course: this.courseOptions.find(c => c.value === this.editForm.courseId)
        ? { ...this.registrationDetails.course, id: this.editForm.courseId, name: this.courseOptions.find(c => c.value === this.editForm.courseId)?.label || '' }
        : this.registrationDetails.course
    };
    debugger;
    if(updatedDetails.registration.outstandingAmount === null || updatedDetails.registration.outstandingAmount === undefined || updatedDetails.registration.outstandingAmount === "") {
      updatedDetails.registration.outstandingAmount = 0;
    } 
    // Update the store
    this.store.setRegistrationDetails(updatedDetails);
    
    this.bhakiService.updateRegistration(updatedDetails).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.closeEditModal();
        this.toastService.show('Registration details updated successfully', 'success');
      },
      error: (err) => {
        console.error('Error updating registration:', err);
        this.isSaving = false;
        this.toastService.show('Error updating registration details', 'error');
      }
    });
    
    // For now, just update locally
    setTimeout(() => {
      this.isSaving = false;
      this.closeEditModal();
    }, 500);
  }
}
