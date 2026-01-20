import * as uuid from "uuid";

import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { ComponentCardComponent } from '../../common/component-card/component-card.component';
import { LabelComponent } from '../label/label.component';
import { InputFieldComponent } from '../input/input-field.component';
import { Option, SelectComponent } from '../select/select.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { FormsModule } from '@angular/forms';

// Services - adjust paths if your project has different locations
import { BhakiService } from '../../../services/bhaki-service';
import { TokenStorageService } from '../../../services/token-storage.service';
import { DropzoneComponent } from "../form-elements/dropzone/dropzone.component";
import { ToastService } from '../../../services/toast.service';

declare var $: any;

function idOrPassportValidator(control: AbstractControl): ValidationErrors | null {
  const group = control as FormGroup;
  const idNumber = group.get('idNumber') && group.get('idNumber')!.value;
  const passport = group.get('passport') && group.get('passport')!.value;
  if (!idNumber && !passport) {
    return { idOrPassportRequired: true };
  }
  return null;
}

const IdExpress =
  /^(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/;

const form = new FormGroup({
  idType: new FormControl('idNumber'),
  idNumber: new FormControl({ value: "", disabled: false }, [
    Validators.pattern(IdExpress),
    Validators.minLength(13),
    Validators.maxLength(13),
  ]),
  passport: new FormControl({ value: "", disabled: false }),
  cellphone: new FormControl({ value: "", disabled: false }, [
    Validators.required,
  ]),
  firstName: new FormControl({ value: "", disabled: false }, [
    Validators.required,
  ]),
  lastName: new FormControl({ value: "", disabled: false }, [
    Validators.required,
  ]),
  email: new FormControl("", [
    Validators.email,
    Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
  ]),
  course: new FormControl({ value: "", disabled: false }, [
    Validators.required,
  ]),
  amountPaid: new FormControl({ value: "", disabled: false }, [
    Validators.required,
  ]),
  outstandingAmount: new FormControl({ value: "", disabled: true }, [
    Validators.required,
  ]),
  streetAddress: new FormControl({ value: "", disabled: false }, [
    Validators.required,
  ]),
  line1: new FormControl({ value: "", disabled: false }),
  line2: new FormControl({ value: "", disabled: false }),
  city: new FormControl({ value: "", disabled: false }, [Validators.required]),
  postalCode: new FormControl({ value: "", disabled: false }, [
    Validators.required,
  ]),
  registrationDate: new FormControl({ value: "", disabled: false }),
  commencementDate: new FormControl({ value: "", disabled: false }),
  idDocument: new FormControl({ value: "", disabled: false }, [Validators.required]),
  recieptReference: new FormControl({ value: "", disabled: false })
}, { validators: idOrPassportValidator });

type AdminFormModel = {
  firstName: string;
  lastName: string;
  idType: string;
  idNumber: string;
  passport: string;
  registrationDate: string;
  email: string;
  cellPhone: string;
  course: string;
  amountPaid: number | string;
  outstandingAmount: number | string;
  streetAddress: string;
  city: string;
  address1: string;
  address2: string;
  postalCode: string;
  receiptReference: string;
  file: File | null;
  commencementDate: string;
  referral: string;
};



@Component({
  selector: 'app-admin-registration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentCardComponent,
    LabelComponent,
    InputFieldComponent,
    SelectComponent,
    DatePickerComponent,
    DropzoneComponent
  ],
  templateUrl: './admin-registration.component.html',
  styles: ``
})
export class AdminRegistrationComponent implements OnInit {
  pageTitle = 'Admin Registration';
  isStudentLogin = false;
  isDragActive = false;
  uploadedFiles: File[] = [];
  
  // Step tracking for mobile view
  currentStep = 1;
  totalSteps = 4;

  async onFilesDropped(files: File[]) {
    try {
      this.uploadedFiles = files;
      // keep the same field name used elsewhere if needed
      const selectedFile = files && files.length ? files[0] : null;
      
      if (selectedFile) {
        // Validate file immediately on mobile
        if (selectedFile.size === 0) {
          this.toastService.show('❌ Selected file is empty. Please choose a valid file.', 'error', 5000);
          this.adminForm.file = null;
          this.updateRegistrationControl('idDocument', null);
          return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (selectedFile.size > maxSize) {
          this.toastService.show(`❌ File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB. Please choose a smaller file.`, 'error', 5000);
          this.adminForm.file = null;
          this.updateRegistrationControl('idDocument', null);
          return;
        }

        // Store file reference immediately (critical for mobile)
        this.adminForm.file = selectedFile;
        this.handleFieldChange('file', 'idDocument', this.adminForm.file);
        this.updateRegistrationControl('idDocument', this.adminForm.file);
        
        console.log('Files received from dropzone:', this.uploadedFiles);
        
        // Optionally pre-read the file on mobile to ensure we have access
        // This helps prevent permission issues later
        if (window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          try {
            await this.readFileAsBase64(selectedFile);
            console.log('File pre-read successfully on mobile');
          } catch (preReadError: any) {
            console.warn('Pre-read failed (will retry on submit):', preReadError);
            // Don't fail here - we'll retry on submit
          }
        }
      } else {
        this.adminForm.file = null;
        this.updateRegistrationControl('idDocument', null);
      }
    } catch (error: any) {
      console.error('Error handling dropped files:', error);
      this.toastService.show(`❌ Error handling file: ${error?.message || 'Unknown error'}`, 'error', 5000);
      this.adminForm.file = null;
      this.updateRegistrationControl('idDocument', null);
    }
  }

  async onFileSelected(event: Event) {
    try {
      const input = event.target as HTMLInputElement;
      if (input?.files && input.files.length) {
        const selectedFile = input.files[0];
        
        // Validate file immediately
        if (selectedFile.size === 0) {
          this.toastService.show('❌ Selected file is empty. Please choose a valid file.', 'error', 5000);
          this.adminForm.file = null;
          this.updateRegistrationControl('idDocument', null);
          // Reset input
          if (input) input.value = '';
          return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (selectedFile.size > maxSize) {
          this.toastService.show(`❌ File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB. Please choose a smaller file.`, 'error', 5000);
          this.adminForm.file = null;
          this.updateRegistrationControl('idDocument', null);
          // Reset input
          if (input) input.value = '';
          return;
        }

        // Store file reference immediately (critical for mobile)
        this.adminForm.file = selectedFile;
        this.updateRegistrationControl('idDocument', this.adminForm.file);
        
        // Optionally pre-read the file on mobile to ensure we have access
        if (window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          try {
            await this.readFileAsBase64(selectedFile);
            console.log('File pre-read successfully on mobile');
          } catch (preReadError: any) {
            console.warn('Pre-read failed (will retry on submit):', preReadError);
            // Don't fail here - we'll retry on submit
          }
        }
      } else {
        this.adminForm.file = null;
        this.updateRegistrationControl('idDocument', null);
      }
    } catch (error: any) {
      console.error('Error handling file selection:', error);
      this.toastService.show(`❌ Error selecting file: ${error?.message || 'Unknown error'}`, 'error', 5000);
      this.adminForm.file = null;
      this.updateRegistrationControl('idDocument', null);
    }
  }

  // keep the simple adminForm object so existing template bindings still work
  adminForm: AdminFormModel = {
    firstName: '',
    lastName: '',
    idType: 'idNumber',
    idNumber: '',
    passport: '',
    registrationDate: '',
    email: '',
    cellPhone: '',
    course: '',
    amountPaid: '',
    outstandingAmount: '',
    streetAddress: '',
    city: '',
    address1: '',
    address2: '',
    postalCode: '',
    receiptReference: '',
    file: null,
    commencementDate: '',
    referral: ''
  };

  // reactive registration form (more advanced validation & submission)
  public registrationForm: FormGroup = form;

  // metadata / lists
  idTypes = [
    { value: 'idNumber', label: 'ID Number' },
    { value: 'passport', label: 'Passport' }
  ];

  courseOptions = [];
  referralOptions = [];

  // reactive form helpers / UI state
  @ViewChild('file') fileInputRef!: ElementRef;
  today: string = new Date().toISOString().split('T')[0];
  loading = false;
  private base64textString: string = "";
  documentFile: any;
  Course: any = [];
  Branch: any = [];
  selectedBranch: any;
  outstandingAmount: any;
  userInfo: any;
  branchOptions: Option[] = [];
  public fields = {
    idNumber: "idNumber",
    cellphone: "cellphone",
    postalCode: "postalCode",
    city: "city",
    line2: "line2",
    line1: "line1",
    streetAddress: "streetAddress",
    outstandingAmount: "outstandingAmount",
    amountPaid: "amountPaid",
    email: "email",
    lastName: "lastName",
    firstName: "firstName",
    course: "course",
    idDocument: "idDocument",
    recieptReference: "recieptReference",
    registrationDate: "registrationDate"
  };
  hideSpinner = true;
  public showSpinner: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private readonly adminToReactiveMap: Record<keyof AdminFormModel, string> = {
    firstName: 'firstName',
    lastName: 'lastName',
    idType: 'idType',
    idNumber: 'idNumber',
    passport: 'passport',
    registrationDate: 'registrationDate',
    email: 'email',
    cellPhone: 'cellphone',
    course: 'course',
    amountPaid: 'amountPaid',
    outstandingAmount: 'outstandingAmount',
    streetAddress: 'streetAddress',
    city: 'city',
    address1: 'line1',
    address2: 'line2',
    postalCode: 'postalCode',
    receiptReference: 'recieptReference',
    file: 'idDocument',
    commencementDate: 'commencementDate',
    referral: 'referral'
  };

  private updateRegistrationControl(controlName: string, value: any, markAsInteracted = true) {
    const control = this.registrationForm.get(controlName);
    if (control) {
      control.setValue(value);
      if (markAsInteracted) {
        control.markAsDirty();
        control.markAsTouched();
      } else {
        control.markAsPristine();
        control.markAsUntouched();
      }
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  private syncAdminFormToReactive(markAsInteracted = false) {
    (Object.keys(this.adminToReactiveMap) as Array<keyof AdminFormModel>).forEach((modelKey) => {
      const controlName = this.adminToReactiveMap[modelKey];
      this.updateRegistrationControl(controlName, (this.adminForm as any)[modelKey] ?? '', markAsInteracted);
    });
  }

  handleFieldChange(modelKey: keyof AdminFormModel, controlName: string, value: any) {
    (this.adminForm as any)[modelKey] = value;
    this.updateRegistrationControl(controlName, value ?? '');
  }

  handleDateChange(event: { dateStr?: string; date?: Date }) {
    // Use the date object if available, otherwise use the dateStr
    // dateStr is in yyyy-mm-dd format which is what we need for the API
    const dateValue = event?.dateStr ?? '';
    
    // Ensure the date is properly formatted as yyyy-mm-dd
    if (dateValue) {
      this.handleFieldChange('registrationDate', 'registrationDate', dateValue);
    } else if (event?.date) {
      // Fallback: format the Date object to yyyy-mm-dd
      const formattedDate = this.formatDateForAPI(event.date);
      this.handleFieldChange('registrationDate', 'registrationDate', formattedDate);
    }
  }

  handleCommencementDateChange(event: { dateStr?: string; date?: Date }) {
    // Use the date object if available, otherwise use the dateStr
    // dateStr is in yyyy-mm-dd format which is what we need for the API
    const dateValue = event?.dateStr ?? '';
    
    // Ensure the date is properly formatted as yyyy-mm-dd
    if (dateValue) {
      this.handleFieldChange('commencementDate', 'commencementDate', dateValue);
    } else if (event?.date) {
      // Fallback: format the Date object to yyyy-mm-dd
      const formattedDate = this.formatDateForAPI(event.date);
      this.handleFieldChange('commencementDate', 'commencementDate', formattedDate);
    }
  }

  // Helper method to format date to yyyy-mm-dd for API
  private formatDateForAPI(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  handleBranchChange(branchId: string) {
    this.selectedBranch = branchId;
    // Load courses for the selected branch
    if (branchId) {
      this.getCourses(branchId);
    }
  }

  get idOrPassportError() {
    const errors = this.registrationForm.errors as any;
    return errors && errors['idOrPassportRequired'] &&
      ((this.registrationForm.get('idNumber') && this.registrationForm.get('idNumber')!.touched) ||
        (this.registrationForm.get('passport') && this.registrationForm.get('passport')!.touched));
  }

  get idType() {
    return this.registrationForm.get('idType') && this.registrationForm.get('idType')!.value;
  }

  // Helper method to get friendly field names for error messages
  private getFieldName(fieldKey: string): string {
    const fieldNames: { [key: string]: string } = {
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'idType': 'Identification Type',
      'idNumber': 'ID Number',
      'passport': 'Passport',
      'email': 'Email Address',
      'cellphone': 'Cell Phone',
      'branch': 'Branch',
      'course': 'Course',
      'registrationDate': 'Registration Date',
      'commencementDate': 'Commencement Date',
      'streetAddress': 'Street Address',
      'city': 'City',
      'postalCode': 'Postal Code',
      'idDocument': 'Identification Document',
      'amountPaid': 'Amount Paid',
      'outstandingAmount': 'Outstanding Amount'
    };
    return fieldNames[fieldKey] || fieldKey;
  }

  // Step navigation methods
  nextStep(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Sync adminForm to reactive form before validation
    this.syncAdminFormToReactive(false);
    
    const validationResult = this.validateCurrentStepWithDetails();
    
    if (validationResult.isValid && this.currentStep < this.totalSteps) {
      this.currentStep++;
    } else {
      // Show detailed error message if validation fails
      const stepNames = ['Personal Information', 'Course & Address', 'Document Upload', 'Payment'];
      const stepName = stepNames[this.currentStep - 1] || 'this step';
      const errorMessage = validationResult.missingFields.length > 0
        ? `❌ ${stepName} - Missing required fields: ${validationResult.missingFields.map(f => this.getFieldName(f)).join(', ')}. Please complete all required fields to continue.`
        : `❌ ${stepName} - Please complete all required fields to continue.`;
      this.toastService.error(errorMessage, 10000);
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.validateStep1();
      case 2:
        return this.validateStep2();
      case 3:
        return this.validateStep3();
      case 4:
        return this.validateStep4();
      default:
        return false;
    }
  }

  // New method to return validation result with missing fields
  validateCurrentStepWithDetails(): { isValid: boolean; missingFields: string[] } {
    switch (this.currentStep) {
      case 1:
        return this.validateStep1WithDetails();
      case 2:
        return this.validateStep2WithDetails();
      case 3:
        return this.validateStep3WithDetails();
      case 4:
        return this.validateStep4WithDetails();
      default:
        return { isValid: false, missingFields: [] };
    }
  }

  validateStep1(): boolean {
    return this.validateStep1WithDetails().isValid;
  }

  validateStep1WithDetails(): { isValid: boolean; missingFields: string[] } {
    // Step 1: Personal Information - Only validate: firstName, lastName, idType, idNumber/passport, email (optional), cellPhone
    const firstName = this.registrationForm.get('firstName');
    const lastName = this.registrationForm.get('lastName');
    const cellphone = this.registrationForm.get('cellphone');
    const idType = this.registrationForm.get('idType')?.value || this.adminForm.idType || 'idNumber';
    const idNumber = this.registrationForm.get('idNumber');
    const passport = this.registrationForm.get('passport');
    const email = this.registrationForm.get('email');

    const missingFields: string[] = [];

    // Mark fields as touched to show errors
    firstName?.markAsTouched();
    lastName?.markAsTouched();
    cellphone?.markAsTouched();
    if (idType === 'idNumber') {
      idNumber?.markAsTouched();
    } else if (idType === 'passport') {
      passport?.markAsTouched();
    }

    // Validate required fields - First Name, Last Name, Cell Phone
    const firstNameValue = firstName?.value || this.adminForm.firstName || '';
    const lastNameValue = lastName?.value || this.adminForm.lastName || '';
    const cellphoneValue = cellphone?.value || this.adminForm.cellPhone || '';

    if (!firstNameValue || firstNameValue.trim() === '') {
      missingFields.push('firstName');
    }
    if (!lastNameValue || lastNameValue.trim() === '') {
      missingFields.push('lastName');
    }
    if (!cellphoneValue || cellphoneValue.trim() === '') {
      missingFields.push('cellphone');
    }

    // Validate ID Number or Passport based on selected type
    if (idType === 'idNumber') {
      const idNumberValue = idNumber?.value || this.adminForm.idNumber || '';
      if (!idNumberValue || idNumberValue.trim() === '') {
        missingFields.push('idNumber');
      }
    } else if (idType === 'passport') {
      const passportValue = passport?.value || this.adminForm.passport || '';
      if (!passportValue || passportValue.trim() === '') {
        missingFields.push('passport');
      }
    }

    // Email is optional - if provided, it should be a valid format
    const emailValue = email?.value || this.adminForm.email || '';
    if (emailValue && emailValue.trim() !== '') {
      // Only validate format if email is provided
      if (email?.invalid) {
        missingFields.push('email');
      }
    }

    return { isValid: missingFields.length === 0, missingFields };
  }

  validateStep2(): boolean {
    return this.validateStep2WithDetails().isValid;
  }

  validateStep2WithDetails(): { isValid: boolean; missingFields: string[] } {
    // Course & Address: branch (if student), course, registrationDate, commencementDate, streetAddress, city, postalCode
    const course = this.registrationForm.get('course');
    const registrationDate = this.registrationForm.get('registrationDate');
    const commencementDate = this.registrationForm.get('commencementDate');
    const streetAddress = this.registrationForm.get('streetAddress');
    const city = this.registrationForm.get('city');
    const postalCode = this.registrationForm.get('postalCode');

    const missingFields: string[] = [];

    // Mark fields as touched
    course?.markAsTouched();
    registrationDate?.markAsTouched();
    commencementDate?.markAsTouched();
    streetAddress?.markAsTouched();
    city?.markAsTouched();
    postalCode?.markAsTouched();

    // Validate branch for students
    if (this.isStudentLogin && !this.selectedBranch) {
      missingFields.push('branch');
    }

    // Validate required fields - check both reactive form and adminForm
    const courseValid = course?.valid || (this.adminForm.course && this.adminForm.course.trim() !== '');
    const registrationDateValid = registrationDate?.value || (this.adminForm.registrationDate && this.adminForm.registrationDate.trim() !== '');
    const commencementDateValid = commencementDate?.value || (this.adminForm.commencementDate && this.adminForm.commencementDate.trim() !== '');
    const streetAddressValid = streetAddress?.valid || (this.adminForm.streetAddress && this.adminForm.streetAddress.trim() !== '');
    const cityValid = city?.valid || (this.adminForm.city && this.adminForm.city.trim() !== '');
    const postalCodeValid = postalCode?.valid || (this.adminForm.postalCode && this.adminForm.postalCode.trim() !== '');

    if (!courseValid) missingFields.push('course');
    if (!registrationDateValid) missingFields.push('registrationDate');
    if (!commencementDateValid) missingFields.push('commencementDate');
    if (!streetAddressValid) missingFields.push('streetAddress');
    if (!cityValid) missingFields.push('city');
    if (!postalCodeValid) missingFields.push('postalCode');

    return { isValid: missingFields.length === 0, missingFields };
  }

  validateStep3(): boolean {
    return this.validateStep3WithDetails().isValid;
  }

  validateStep3WithDetails(): { isValid: boolean; missingFields: string[] } {
    // Step 3: Document Upload - receiptReference (optional), idDocument (required)
    const idDocument = this.registrationForm.get('idDocument');

    const missingFields: string[] = [];

    // Mark fields as touched
    idDocument?.markAsTouched();

    // Validate required fields - check both reactive form and adminForm
    const idDocumentValid = idDocument?.value || this.adminForm.file;

    if (!idDocumentValid) {
      missingFields.push('idDocument');
    }

    return { isValid: missingFields.length === 0, missingFields };
  }

  validateStep4(): boolean {
    return this.validateStep4WithDetails().isValid;
  }

  validateStep4WithDetails(): { isValid: boolean; missingFields: string[] } {
    // Step 4: Payment - amountPaid (required), outstandingAmount (auto-calculated)
    const amountPaid = this.registrationForm.get('amountPaid');

    const missingFields: string[] = [];

    // Mark fields as touched
    amountPaid?.markAsTouched();

    // Validate required fields - check both reactive form and adminForm
    const amountPaidValid = amountPaid?.valid || (this.adminForm.amountPaid && this.adminForm.amountPaid !== '' && this.adminForm.amountPaid !== null);

    if (!amountPaidValid) {
      missingFields.push('amountPaid');
    }

    return { isValid: missingFields.length === 0, missingFields };
  }

  constructor(
    private bhakiService: BhakiService,
    private tokenService: TokenStorageService,
    private toastService: ToastService
  ) {
    // initialize
    this.disableEditFields(false);
    this.userInfo = this.tokenService.getUser();
    if(this.userInfo && this.userInfo.role.includes('Student')) { 
      this.loadBranches();
      this.isStudentLogin = true;
    }
    else { 
      if (this.userInfo && this.userInfo.branchId) {
        this.getCourses(this.userInfo.branchId);
      }
    }
   
    this.loading = true;
    this.syncAdminFormToReactive();
  }

  ngOnInit(): void {
    this.loadReferrals();

    this.showSpinner.subscribe((res) => {
      this.hideSpinner = res;
    });
  }

  // -------------------------
  // Helper / UI methods
  // -------------------------
  numbersValidation(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    return !(charCode > 31 && (charCode < 48 || charCode > 57));
  }

  console(data: any) {
    // small helper for debugging in template if needed
    // eslint-disable-next-line no-console
    console.log(data);
  }

  checkFutureRegistrationDate() {
    const registrationDateStr = this.registrationForm.value.registrationDate || this.adminForm.registrationDate;
    if (registrationDateStr) {
      // Parse yyyy-mm-dd format
      const registrationDate = new Date(registrationDateStr + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      
      if (!isNaN(registrationDate.getTime()) && registrationDate > today) {
        this.registrationForm.controls['registrationDate'].setValue('');
        this.adminForm.registrationDate = '';
        this.toastService.show('❌ Registration date cannot be in the future. Please select a valid registration date (today or earlier).', 'error', 10000);
        return false;
      }
    }
    return true;
  }

  // -------------------------
  // Submit / API interaction
  // -------------------------
  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check if file is valid
      if (!file || !(file instanceof File)) {
        reject(new Error('Invalid file object'));
        return;
      }

      // Check file size (max 10MB to avoid memory issues on mobile)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        reject(new Error(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`));
        return;
      }

      // Use ArrayBuffer for better mobile support
      const reader = new FileReader();
      
      reader.onerror = () => {
        const error = reader.error || new Error('Unknown file reading error');
        reject(new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`));
      };

      reader.onload = () => {
        try {
          if (reader.result instanceof ArrayBuffer) {
            // Convert ArrayBuffer to base64
            const bytes = new Uint8Array(reader.result);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            resolve(base64);
          } else if (typeof reader.result === 'string') {
            // If result is already a string (DataURL), extract base64 part
            // Format: data:image/png;base64,iVBORw0KGgo...
            const base64Match = reader.result.match(/base64,(.+)$/);
            if (base64Match && base64Match[1]) {
              resolve(base64Match[1]);
            } else {
              // Fallback: treat as binary string
              resolve(btoa(reader.result));
            }
          } else {
            reject(new Error('Unexpected file reader result type'));
          }
        } catch (error: any) {
          reject(new Error(`Failed to convert file to base64: ${error?.message || 'Unknown error'}`));
        }
      };

      // Use readAsArrayBuffer for better mobile compatibility
      // Fallback to readAsDataURL if ArrayBuffer is not supported
      try {
        reader.readAsArrayBuffer(file);
      } catch (error) {
        // Fallback for older browsers
        try {
          reader.readAsDataURL(file);
        } catch (fallbackError: any) {
          reject(new Error(`File reading not supported: ${fallbackError?.message || 'Unknown error'}`));
        }
      }
    });
  }

  async createRegistration() {
    try {
      if (!this.registrationForm.valid) {
        const invalidFields = Object.keys(this.registrationForm.controls).filter(
          (field) => this.registrationForm.controls[field].invalid
        );
        const errorMessage = invalidFields.length > 0
          ? `❌ Registration submission failed. Missing or invalid fields: ${invalidFields.map(f => this.getFieldName(f)).join(', ')}. Please complete all required information and try again.`
          : '❌ Registration submission failed. Please complete all required information and try again.';
        this.toastService.show(errorMessage, 'error', 10000);
        return;
      }

      this.checkFutureRegistrationDate();

      const courseObj = this.Course.find((x: any) => x.name === this.registrationForm.value.course);
      const courseId = courseObj ? courseObj.id : null;
      let IdNumber: any;
      let Passport: any;
      if (this.idType === 'passport') {
        Passport = this.registrationForm.value.passport;
      } else {
        IdNumber = this.registrationForm.value.idNumber;
      }

      let idDocumentString: string | null = null;
      const idDocumentFile = this.registrationForm.value.idDocument as File | null;
      
      // Also check adminForm.file as fallback (for mobile file uploads)
      const fileToRead = idDocumentFile || this.adminForm.file;
      
      if (fileToRead && fileToRead instanceof File) {
        try {
          // Validate file before reading
          if (fileToRead.size === 0) {
            throw new Error('File is empty');
          }
          
          idDocumentString = await this.readFileAsBase64(fileToRead);
        } catch (fileError: any) {
          this.showSpinner.next(false);
          const errorMessage = `❌ Failed to read file: ${fileError?.message || 'Unknown error'}. Please try selecting the file again.`;
          this.toastService.show(errorMessage, 'error', 10000);
          if (window.innerWidth < 768) {
            this.currentStep = 3; // Go back to document step
          }
          return;
        }
      }

      // Convert date strings to proper format for API
      // Dates come in yyyy-mm-dd format from flatpickr
      // Need to send as ISO string but preserve the date without timezone shifts
      let registrationDateStr: string;
      let commencementDateStr: string;
      
      try {
        const regDateStr = this.registrationForm.value.registrationDate || this.adminForm.registrationDate;
        if (regDateStr && regDateStr.trim() !== '') {
          // Parse yyyy-mm-dd format and create Date at midnight in local timezone
          // Use UTC to avoid timezone shifts when converting back
          const dateParts = regDateStr.split('-');
          if (dateParts.length !== 3) {
            throw new Error('Invalid registration date format. Expected yyyy-mm-dd');
          }
          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
          const day = parseInt(dateParts[2], 10);
          
          if (isNaN(year) || isNaN(month) || isNaN(day)) {
            throw new Error('Invalid registration date format');
          }
          
          // Create date at midnight UTC to preserve the date without timezone shifts
          const date = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
          if (isNaN(date.getTime())) {
            throw new Error('Invalid registration date');
          }
          registrationDateStr = date.toISOString();
        } else {
          throw new Error('Registration date is required');
        }

        const commDateStr = this.registrationForm.value.commencementDate || this.adminForm.commencementDate;
        if (commDateStr && commDateStr.trim() !== '') {
          // Parse yyyy-mm-dd format and create Date at midnight in local timezone
          const dateParts = commDateStr.split('-');
          if (dateParts.length !== 3) {
            throw new Error('Invalid commencement date format. Expected yyyy-mm-dd');
          }
          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
          const day = parseInt(dateParts[2], 10);
          
          if (isNaN(year) || isNaN(month) || isNaN(day)) {
            throw new Error('Invalid commencement date format');
          }
          
          // Create date at midnight UTC to preserve the date without timezone shifts
          const date = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
          if (isNaN(date.getTime())) {
            throw new Error('Invalid commencement date');
          }
          commencementDateStr = date.toISOString();
        } else {
          throw new Error('Commencement date is required');
        }
      } catch (dateError: any) {
        this.showSpinner.next(false);
        this.toastService.show(`❌ Date Error: ${dateError.message}. Please select valid dates.`, 'error', 10000);
        if (window.innerWidth < 768) {
          this.currentStep = 2; // Go back to step 2 where dates are entered
        }
        return;
      }

      const request = {
        branchId: this.isStudentLogin ? this.selectedBranch : this.userInfo.branchId,
        courseId: courseId,
        name: this.registrationForm.value.firstName,
        surname: this.registrationForm.value.lastName,
        idNumber: IdNumber,
        passport: Passport,
        idDocument: idDocumentString,
        emailAddress: this.registrationForm.value.email,
        cellphone: this.registrationForm.value.cellphone,
        courseName: this.registrationForm.value.course,
        amountPaid: this.registrationForm.value.amountPaid,
        balance: this.adminForm.outstandingAmount,
        createdBy: this.userInfo.id,
        recieptReference: this.registrationForm.value.recieptReference,
        registrationDate: registrationDateStr, // ISO string format for API (preserves date without timezone shift)
        commencementDate: commencementDateStr, // ISO string format for API (preserves date without timezone shift)
        referralId: this.adminForm.referral || null,
        address: {
          id: (uuid as any).v4 ? (uuid as any).v4() : uuid.v4(), // support both import styles
          streetName: this.registrationForm.value.streetAddress,
          line1: this.registrationForm.value.line1,
          line2: this.registrationForm.value.line2,
          city: this.registrationForm.value.city,
          postalCode: this.registrationForm.value.postalCode,
        },
      };

      this.showSpinner.next(true);
      this.bhakiService.createRegitration(request).subscribe({
        next: (res: any) => {
          this.showSpinner.next(false);
          
          // Handle new response format: check if success property exists
          if (res && res.success === false) {
            // Duplicate or other error from API
            let errorMessage = res.message || res.errorMessage || '❌ An error occurred while creating the registration. Please check your information and try again.';
            
            // Make duplicate errors more prominent
            if (res.errorCode === 'DUPLICATE_REGISTRATION') {
              errorMessage = '⚠️ Duplicate Registration: This student is already registered for the selected course. Please select a different course or verify the student information.';
            }
            
            // Show error for 10 seconds so user can read it (especially on mobile)
            this.toastService.show(errorMessage, 'error', 10000);
            // Scroll to top to ensure user sees the error - don't reload on mobile
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // On mobile, ensure we stay on the current step (Step 4) to see the error and preserve form data
            if (window.innerWidth < 768) {
              this.currentStep = 4; // Keep user on payment step to see the error
            }
            return;
          }
          
          // Success case: res might be the registration number (old format) or res.registrationNumber (new format)
          const registrationNumber = res?.registrationNumber || res;
          
          this.registrationForm.reset();
          //clear the form
          this.adminForm = {
            firstName: '',
            lastName: '',
            idType: 'idNumber',
            idNumber: '',
            passport: '',
            registrationDate: '',
            email: '',
            cellPhone: '',
            course: '',
            amountPaid: '',
            outstandingAmount: '',
            streetAddress: '',
            city: '',
            address1: '',
            address2: '',
            postalCode: '',
            receiptReference: '',
            file: null,
            commencementDate: '',
            referral: ''
          };
          this.syncAdminFormToReactive();
          //clear dropzone and clear image preview
          this.uploadedFiles = [];
          this.adminForm.file = null;
          this.updateRegistrationControl('idDocument', null);
          this.documentFile = null;
          this.documentFile = '';
          this.documentFile = '';
          //scroll to the top of the page
          window.scrollTo(0, 0);

          this.toastService.show('Your registration was successful with registration number :' + registrationNumber, 'success');
        },
        error: (error: any) => {
          this.showSpinner.next(false);
          
          // Handle duplicate registration error (409 Conflict)
          if (error?.status === 409 || error?.error?.errorCode === 'DUPLICATE_REGISTRATION') {
            const errorMessage = error?.error?.message || 
                                error?.error?.errorMessage || 
                                '⚠️ Duplicate Registration: This student is already registered for the selected course. Please select a different course or verify the student information.';
            // Show error for longer duration so user can read it (especially on mobile)
            this.toastService.show(errorMessage, 'error', 10000);
            // Scroll to top to ensure user sees the error - don't reload on mobile
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // On mobile, ensure we stay on the current step (Step 4) to see the error
            if (window.innerWidth < 768) {
              this.currentStep = 4; // Keep user on payment step to see the error
            }
            return;
          }
          
          // Handle other errors
          let errorMessage = '❌ An error occurred while creating the registration. Please check your information and try again.';
          if (error?.error?.message) {
            errorMessage = `❌ ${error.error.message}`;
          } else if (error?.error?.errorMessage) {
            errorMessage = `❌ ${error.error.errorMessage}`;
          } else if (error?.message) {
            errorMessage = `❌ ${error.message}`;
          } else if (error?.status) {
            errorMessage = `❌ Registration failed with error code ${error.status}. Please check your information and try again.`;
          }
          // Show error for 10 seconds so user can read it (especially on mobile)
          this.toastService.show(errorMessage, 'error', 10000);
          // Scroll to top to ensure user sees the error - don't reload on mobile
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // On mobile, ensure we stay on the current step to see the error
          if (window.innerWidth < 768) {
            this.currentStep = 4; // Keep user on payment step to see the error
          }
        },
      });
    } catch (err) {
      this.showSpinner.next(false);
      const errorMessage = err instanceof Error 
        ? `❌ Registration failed: ${err.message}. Please ensure all required fields are completed and try again.`
        : '❌ Registration failed. Please ensure all required fields are completed and try again.';
      this.toastService.show(errorMessage, 'error', 10000);
      // Scroll to top to show error - don't reload on mobile to preserve form state
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // On mobile, ensure we stay on the current step to see the error and keep form data
      if (window.innerWidth < 768) {
        this.currentStep = 4; // Keep user on payment step to see the error
        // Don't reload on mobile - preserve form state so user can fix and resubmit
      } else {
        // Only reload on desktop as fallback (though ideally we shouldn't reload at all)
        // window.location.reload(); // Commented out to preserve form state on all devices
      }
    }
  }

  // -------------------------
  // Enable/Disable fields
  // -------------------------
  disableEditFields(enable: boolean) {
    const controls = this.registrationForm.controls;
    if (!enable) {
      controls['firstName'].disable();
      controls['lastName'].disable();
      controls['idNumber'].disable();
      controls['email'].disable();
      controls['cellphone'].disable();

      controls['course'].disable();
      controls['amountPaid'].disable();
      controls['streetAddress'].disable();
      controls['city'].disable();

      controls['line1'].disable();
      controls['line2'].disable();
      controls['postalCode'].disable();
      controls['idDocument'].disable();
      controls['registrationDate'].disable();
      controls['passport'].disable();
      controls['commencementDate'].disable();
    } else {
      controls['firstName'].enable();
      controls['lastName'].enable();
      controls['idNumber'].enable();
      controls['email'].enable();
      controls['cellphone'].enable();

      controls['course'].enable();
      controls['amountPaid'].enable();
      controls['streetAddress'].enable();
      controls['city'].enable();

      controls['line1'].enable();
      controls['line2'].enable();
      controls['postalCode'].enable();
      controls['idDocument'].enable();
      controls['registrationDate'].enable();
      controls['passport'].enable();
      controls['commencementDate'].enable();
    }
  }

  // -------------------------
  // Outstanding / course helpers
  // -------------------------
  getOustandingAmount() {
    const amountPaid = this.adminForm.amountPaid;
    const courseObj = this.Course.find((x: any) => x.name === this.adminForm.course) || { price: 0 };
    const coursePrice = courseObj.price;
    if (this.adminForm.amountPaid > coursePrice) {
      //  this.adminForm.controls['amountPaid'].setValue('');
      this.adminForm.outstandingAmount = 0;
      this.toastService.show('❌ Amount Paid cannot be greater than the course price. Please enter a valid amount that does not exceed the course price.', 'error', 10000);
    } else {
      this.adminForm.outstandingAmount = Number(coursePrice) - Number(amountPaid);
    }
    this.updateRegistrationControl('outstandingAmount', this.adminForm.outstandingAmount);
  }

  textValidation(event: any): boolean {
    const charCode = event.keyCode;
    return (
      (charCode > 64 && charCode < 91) ||
      (charCode > 96 && charCode < 123) ||
      charCode === 8
    );
  }

  // -------------------------
  // Data loading
  // -------------------------
  loadReferrals() {
    this.bhakiService.getReferrals().subscribe({
      next: (res: any) => {
        // Map referral data to select options
        this.referralOptions = res.map((referral: any) => ({
          value: referral.id,
          label: referral.name
        }));
      },
      error: (error) => {
        console.error('Error loading referrals:', error);
      }
    });
  }

  getCourses(branchId: any) {
    this.showSpinner.next(true);
    this.bhakiService.getCourses(branchId).subscribe({
      next: (res: any) => {
        this.showSpinner.next(false);
        if (res.length > 0) {
          //pass course data to select options courseOptions
          this.courseOptions = res.map((course: any) => ({
            label: course.name + ' - R' + course.price,
            value: course.name,
            price: course.price,
            id: course.id
          }));
          this.Course = res;
          this.disableEditFields(true);
        } else {
          this.toastService.show('❌ No courses available. Please contact your administrator to load courses for your branch.', 'error', 10000);
        }
      },
      error: () => {
        this.showSpinner.next(false);
        this.toastService.show('❌ No courses available for this branch. Please contact your administrator to add courses.', 'error', 10000);
      },
    });
  }

  loadBranches() {
    this.bhakiService.getBranches().subscribe({
      next: (data) => {
        this.branchOptions = data.map((branch: any) => ({
          label: branch.name,
          value: branch.id
        }));
      },
      error: (err) => {
        console.error('Failed to load branches', err);  
      }
    });
  }

  // -------------------------
  // File handling
  // -------------------------
  _handleReaderLoaded(readerEvt: ProgressEvent<FileReader>) {
    try {
      const result = readerEvt.target?.result;
      if (result instanceof ArrayBuffer) {
        // Convert ArrayBuffer to base64
        const bytes = new Uint8Array(result);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        this.base64textString = btoa(binary);
        this.documentFile = btoa(binary);
      } else if (typeof result === 'string') {
        // Extract base64 from DataURL if needed
        const base64Match = result.match(/base64,(.+)$/);
        if (base64Match && base64Match[1]) {
          this.base64textString = base64Match[1];
          this.documentFile = base64Match[1];
        } else {
          this.base64textString = btoa(result);
          this.documentFile = btoa(result);
        }
      }
    } catch (error: any) {
      console.error('Error processing file:', error);
      this.toastService.show(`❌ Failed to process file: ${error?.message || 'Unknown error'}`, 'error', 5000);
    }
  }

  onFileSelect(event: any) {
    const files = event.target.files;
    const file = files && files[0];

    if (files && file) {
      // Validate file
      if (file.size === 0) {
        this.toastService.show('❌ Selected file is empty. Please choose a valid file.', 'error', 5000);
        return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.toastService.show(`❌ File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB. Please choose a smaller file.`, 'error', 5000);
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          this.toastService.show('❌ Failed to read file. Please try again.', 'error', 5000);
        };
        
        // Use ArrayBuffer for better mobile support
        reader.readAsArrayBuffer(file);
      } catch (error: any) {
        console.error('Error reading file:', error);
        this.toastService.show(`❌ File reading error: ${error?.message || 'Unknown error'}`, 'error', 5000);
      }
    }
  }

  uploadImage(componentId: any, image: File) {
    const formData: FormData = new FormData();
    formData.append('Image', image, image.name);
    formData.append('ComponentId', componentId);
    // return this.http.post('/api/dashboard/UploadImage', formData);
  }



  // keep compatibility helpers for the existing simple template bindings
  // onFileSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input?.files && input.files.length) {
  //     this.adminForm.file = input.files[0];
  //     // also update reactive form control if exists
  //     this.registrationForm.controls['idDocument'].setValue(this.adminForm.file);
  //   } else {
  //     this.adminForm.file = null;
  //     this.registrationForm.controls['idDocument'].setValue(null);
  //   }
  // }

  async onSubmit() {
    // Validate all steps before submission (especially for mobile)
    const step1Result = this.validateStep1WithDetails();
    const step2Result = this.validateStep2WithDetails();
    const step3Result = this.validateStep3WithDetails();
    const step4Result = this.validateStep4WithDetails();

    if (!step1Result.isValid || !step2Result.isValid || !step3Result.isValid || !step4Result.isValid) {
      // Collect all missing fields from all steps
      const allMissingFields: string[] = [];
      const stepNames = ['Personal Information', 'Course & Address', 'Document Upload', 'Payment'];
      const stepResults = [step1Result, step2Result, step3Result, step4Result];
      const missingSteps: string[] = [];

      stepResults.forEach((result, index) => {
        if (!result.isValid && result.missingFields.length > 0) {
          const stepMissingFields = result.missingFields.map(f => this.getFieldName(f)).join(', ');
          missingSteps.push(`${stepNames[index]}: ${stepMissingFields}`);
          allMissingFields.push(...result.missingFields);
        }
      });

      // If on mobile, navigate to the first invalid step
      if (window.innerWidth < 768) {
        if (!step1Result.isValid) {
          this.currentStep = 1;
        } else if (!step2Result.isValid) {
          this.currentStep = 2;
        } else if (!step3Result.isValid) {
          this.currentStep = 3;
        } else if (!step4Result.isValid) {
          this.currentStep = 4;
        }
        
        const errorMessage = missingSteps.length > 0
          ? `❌ Missing required fields:\n${missingSteps.join('\n')}\n\nPlease complete all required fields to submit the registration.`
          : '❌ Please complete all required fields to submit the registration.';
        this.toastService.error(errorMessage, 10000);
        return;
      } else {
        // For desktop, mark all fields as touched to show errors
        this.registrationForm.markAllAsTouched();
        const errorMessage = missingSteps.length > 0
          ? `❌ Missing required fields:\n${missingSteps.join('\n')}\n\nPlease complete all required fields to submit the registration.`
          : '❌ Please complete all required fields to submit the registration.';
        this.toastService.error(errorMessage, 10000);
        return;
      }
    }
    this.syncAdminFormToReactive(true);
    // default submit uses reactive createRegistration if the reactive form is used
    if (this.registrationForm && this.registrationForm.valid) {
      await this.createRegistration();
    } else {
      // fallback: show detailed error for invalid form
      const invalidFields = Object.keys(this.registrationForm.controls).filter(
        (field) => this.registrationForm.controls[field].invalid
      );
      const errorMessage = invalidFields.length > 0
        ? `❌ Missing or invalid fields: ${invalidFields.map(f => this.getFieldName(f)).join(', ')}. Please complete all required information before submitting.`
        : '❌ Please complete all required information before submitting.';
      this.toastService.show(errorMessage, 'error', 10000);
      return;
    }
  }

  async onPayWithYoco() {
    // Validate form before creating checkout
    this.syncAdminFormToReactive(true);
    
    if (!this.registrationForm || !this.registrationForm.valid) {
      const invalidFields = Object.keys(this.registrationForm.controls).filter(
        (field) => this.registrationForm.controls[field].invalid
      );
      const errorMessage = invalidFields.length > 0
        ? `❌ Payment cannot proceed. Missing required fields: ${invalidFields.map(f => this.getFieldName(f)).join(', ')}. Please complete all required information before proceeding to payment.`
        : '❌ Payment cannot proceed. Please complete all required fields before proceeding to payment.';
      this.toastService.show(errorMessage, 'error', 10000);
      return;
    }

    // Get the amount to pay (outstanding amount or total course price)
    const amountPaid = parseFloat(this.adminForm.amountPaid?.toString() || '0');
    const outstandingAmount = parseFloat(this.adminForm.outstandingAmount?.toString() || '0');
    const totalAmount = amountPaid + outstandingAmount;
    
    // If no amount is set, use the course price
    let paymentAmount = outstandingAmount > 0 ? outstandingAmount : totalAmount;
    
    // If still no amount, try to get from course
    if (paymentAmount <= 0 && this.Course && this.Course.length > 0) {
      const selectedCourse = this.Course.find((c: any) => c.name === this.adminForm.course);
      if (selectedCourse) {
        paymentAmount = selectedCourse.price || 0;
      }
    }

    if (paymentAmount <= 0) {
      this.toastService.show('❌ Please select a course with a valid price before proceeding to payment.', 'error', 10000);
      return;
    }

    // Generate reference and metadata
    const studentName = `${this.adminForm.firstName} ${this.adminForm.lastName}`.trim();
    const reference = `REG-${Date.now()}-${studentName.substring(0, 10)}`;
    const baseUrl = window.location.origin;

    // Prepare checkout request according to Yoco API documentation
    const checkoutRequest = {
      amount: paymentAmount, // Will be converted to cents on backend
      currency: 'ZAR',
      cancelUrl: `${baseUrl}/admin-registration`,
      successUrl: `${baseUrl}/payment-success`,
      failureUrl: `${baseUrl}/payment-failed`,
      metadata: {
        registrationReference: reference,
        studentName: studentName,
        course: this.adminForm.course || '',
        email: this.adminForm.email || ''
      },
      clientReferenceId: reference,
      lineItems: [
        {
          displayName: this.adminForm.course || 'Course Registration',
          quantity: 1,
          pricingDetails: {
            price: Math.round(paymentAmount * 100) // Price in cents
          },
          description: `Registration for ${this.adminForm.course || 'course'}`
        }
      ]
    };

    this.showSpinner.next(true);

    try {
      this.bhakiService.createYocoCheckout(checkoutRequest).subscribe({
        next: (response: any) => {
          this.showSpinner.next(false);
          if (response.redirectUrl) {
            // Redirect to Yoco checkout page
            window.location.href = response.redirectUrl;
          } else {
            this.toastService.show('❌ Failed to create checkout. Please check your payment information and try again.', 'error', 10000);
          }
        },
        error: (error: any) => {
          this.showSpinner.next(false);
          const errorMessage = error?.error?.error || error?.error?.message || 'Failed to create checkout. Please try again.';
          this.toastService.show(errorMessage, 'error');
        }
      });
    } catch (error: any) {
      this.showSpinner.next(false);
      this.toastService.show('❌ An error occurred while processing your payment request. Please try again or contact support if the problem persists.', 'error', 10000);
    }
  }

  // Debug helper methods
  getAdminFormForDebug(): any {
    const debugForm: any = { ...this.adminForm };
    // Replace File object with file info for JSON serialization
    if (debugForm.file instanceof File) {
      debugForm.file = {
        name: debugForm.file.name,
        size: debugForm.file.size,
        type: debugForm.file.type,
        lastModified: debugForm.file.lastModified
      };
    }
    return debugForm;
  }

  getAllFormErrors(): any {
    const errors: any = {};
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    // Also include form-level errors
    if (this.registrationForm.errors) {
      errors['_form'] = this.registrationForm.errors;
    }
    return Object.keys(errors).length > 0 ? errors : null;
  }
}