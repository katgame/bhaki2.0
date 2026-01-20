import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AppStore } from '../../../state/app.store';
import { DomSanitizer } from '@angular/platform-browser';
import { ButtonComponent } from '../../ui/button/button.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { SelectComponent, Option } from '../../form/select/select.component';
import { LabelComponent } from '../../form/label/label.component';
import { BhakiService } from '../../../services/bhaki-service';
import { ToastService } from '../../../services/toast.service';
import { TokenStorageService } from '../../../services/token-storage.service';

@Component({
  selector: 'app-student-info-card',
  imports: [
    CommonModule,
    ButtonComponent,
    ModalComponent,
    InputFieldComponent,
    SelectComponent,
    LabelComponent,
  ],
  templateUrl: './student-info-card.component.html',
  styles: ``
})
export class StudentInfoCardComponent implements OnInit, OnDestroy {
  registrationDetails: any | null = null;
  private subscription?: Subscription;
  idDocument: any;
  
  // Student edit modal state
  isStudentEditModalOpen = false;
  isSavingStudent = false;
  isAdmin = false;
  
  // Student form data
  studentEditForm: {
    name: string;
    surname: string;
    idType: string;
    idNumber: string;
    passport: string;
    emailAddress: string;
    cellPhone: string;
    streetAddress: string;
    line1: string;
    line2: string;
    city: string;
    postalCode: string;
  } = {
    name: '',
    surname: '',
    idType: 'idNumber',
    idNumber: '',
    passport: '',
    emailAddress: '',
    cellPhone: '',
    streetAddress: '',
    line1: '',
    line2: '',
    city: '',
    postalCode: ''
  };

  // ID Type options
  idTypeOptions: Option[] = [
    { value: 'idNumber', label: 'ID Number' },
    { value: 'passport', label: 'Passport' }
  ];
  
  constructor(
    private store: AppStore,
    private cdr: ChangeDetectorRef,
    private _sanitizer: DomSanitizer,
    private bhakiService: BhakiService,
    private toastService: ToastService,
    private tokenStorage: TokenStorageService
  ) {
    const user = this.tokenStorage.getUser();
    const roles = (user as any)?.role ?? (user as any)?.roles ?? [];
    this.isAdmin = Array.isArray(roles)
      ? roles.some((r: string) => r?.toLowerCase?.() === 'admin')
      : typeof roles === 'string'
        ? roles.toLowerCase() === 'admin'
        : false;
  }

  ngOnInit(): void {
    this.subscription = this.store.$registrationDetails.subscribe((data) => {
      this.registrationDetails = data || null;
      if (this.registrationDetails?.registration?.student?.idDocument) {
        const idDoc = this.registrationDetails.registration.student.idDocument;
        console.log('idDocument type:', typeof idDoc, 'isArray:', Array.isArray(idDoc), 'length:', Array.isArray(idDoc) ? idDoc.length : idDoc?.length || 'N/A');
        console.log('idDocument sample:', Array.isArray(idDoc) ? idDoc.slice(0, 10) : (typeof idDoc === 'string' ? idDoc.substring(0, 50) : idDoc));
        
        let base64String = '';
        
        // Check if it's an array of numbers (byte array from API)
        if (Array.isArray(idDoc)) {
          console.log('Converting byte array to base64, array length:', idDoc.length);
          // Convert byte array to base64 (handle large arrays efficiently)
          const bytes = new Uint8Array(idDoc);
          let binary = '';
          const chunkSize = 8192; // Process in chunks to avoid stack overflow
          for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.slice(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, Array.from(chunk));
          }
          base64String = btoa(binary);
          console.log('Converted to base64, length:', base64String.length);
        } 
        // Check if it's already a string
        else if (typeof idDoc === 'string') {
          base64String = idDoc;
          console.log('Using string as base64, length:', base64String.length);
        }
        
        // Only create the data URL if we have a valid base64 string
        if (base64String && base64String.length > 10) { // Basic validation - base64 should be longer than "Pw=="
          this.idDocument = this._sanitizer.bypassSecurityTrustResourceUrl(
            'data:image/jpeg;base64,' + base64String
          );
          console.log('Image data URL created successfully');
        } else {
          console.warn('Invalid or truncated idDocument data. Length:', base64String?.length || 0, 'Data:', idDoc);
          this.idDocument = null;
        }
      } else {
        console.log('No idDocument found in registration data');
        this.idDocument = null;
      }
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  // Student Details Modal Methods
  openStudentEditModal(): void {
    if (!this.registrationDetails || !this.isAdmin) return;
    
    const student = this.registrationDetails?.registration?.student || {};
    const address = student.address || {};
    
    // Determine ID type based on available data
    let idType = 'idNumber';
    if (student.passport && !student.idNumber) {
      idType = 'passport';
    }
    
    // Populate student form with current values
    this.studentEditForm = {
      name: student.name || '',
      surname: student.surname || '',
      idType: idType,
      idNumber: student.idNumber || '',
      passport: student.passport || '',
      emailAddress: student.emailAddress || '',
      cellPhone: student.cellPhone || '',
      streetAddress: address.streetName || '',
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      postalCode: address.postalCode || ''
    };
    
    this.isStudentEditModalOpen = true;
  }

  closeStudentEditModal(): void {
    this.isStudentEditModalOpen = false;
    // Reset form
    this.studentEditForm = {
      name: '',
      surname: '',
      idType: 'idNumber',
      idNumber: '',
      passport: '',
      emailAddress: '',
      cellPhone: '',
      streetAddress: '',
      line1: '',
      line2: '',
      city: '',
      postalCode: ''
    };
  }

  saveStudentChanges(): void {
    if (!this.registrationDetails || !this.isAdmin) return;
    
    this.isSavingStudent = true;
    
    // Create updated registration details object with student info
    const updatedDetails = {
      ...this.registrationDetails,
      registration: {
        ...this.registrationDetails.registration,
        student: {
          ...this.registrationDetails.registration.student,
          name: this.studentEditForm.name,
          surname: this.studentEditForm.surname,
          idNumber: this.studentEditForm.idType === 'idNumber' ? this.studentEditForm.idNumber : '',
          passport: this.studentEditForm.idType === 'passport' ? this.studentEditForm.passport : '',
          emailAddress: this.studentEditForm.emailAddress,
          cellPhone: this.studentEditForm.cellPhone,
          address: {
            ...(this.registrationDetails.registration.student.address || {}),
            streetName: this.studentEditForm.streetAddress,
            line1: this.studentEditForm.line1,
            line2: this.studentEditForm.line2,
            city: this.studentEditForm.city,
            postalCode: this.studentEditForm.postalCode
          }
        }
      }
    };
    
    // Update the store
    this.store.setRegistrationDetails(updatedDetails);
    

    this.bhakiService.updateRegistration(updatedDetails).subscribe({
      next: (res) => {
        this.isSavingStudent = false;
        this.closeStudentEditModal();
        this.toastService.show('Student details updated successfully', 'success');
      },
      error: (err) => {
        console.error('Error updating registration:', err);
        this.isSavingStudent = false;
        this.toastService.show('Error updating student details', 'error');
      }
    });
    
    // For now, just update locally
    setTimeout(() => {
      this.isSavingStudent = false;
      this.closeStudentEditModal();
    }, 500);
  }
}


