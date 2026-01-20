import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import { RegistrationDetailsCardComponent } from './registration-details-card.component';
import { AppStore } from '../../../state/app.store';
import { BhakiService } from '../../../services/bhaki-service';
import { TokenStorageService } from '../../../services/token-storage.service';

describe('RegistrationDetailsCardComponent', () => {
  let component: RegistrationDetailsCardComponent;
  let fixture: ComponentFixture<RegistrationDetailsCardComponent>;
  let mockAppStore: jasmine.SpyObj<AppStore>;
  let mockBhakiService: jasmine.SpyObj<BhakiService>;
  let mockTokenStorage: jasmine.SpyObj<TokenStorageService>;
  let mockCdr: jasmine.SpyObj<ChangeDetectorRef>;

  const mockRegistrationDetails = {
    registration: {
      registrationNumber: 'REG001',
      registrationDate: '2024-01-15',
      paidAmount: 5000,
      outstandingAmount: 2000,
      recieptReference: 'REC001'
    },
    branch: {
      id: 'branch1',
      name: 'Main Branch'
    },
    course: {
      id: 'course1',
      name: 'Web Development'
    },
    createBy: {
      name: 'John Doe'
    }
  };

  const mockBranches = [
    { id: 'branch1', name: 'Main Branch' },
    { id: 'branch2', name: 'Secondary Branch' }
  ];

  const mockCourses = [
    { id: 'course1', name: 'Web Development' },
    { id: 'course2', name: 'Mobile Development' }
  ];

  beforeEach(async () => {
    mockAppStore = jasmine.createSpyObj('AppStore', ['setRegistrationDetails'], {
      $registrationDetails: of(mockRegistrationDetails)
    });

    mockBhakiService = jasmine.createSpyObj('BhakiService', ['getBranches', 'getCourses']);
    mockBhakiService.getBranches.and.returnValue(of(mockBranches));
    mockBhakiService.getCourses.and.returnValue(of(mockCourses));

    mockTokenStorage = jasmine.createSpyObj('TokenStorageService', ['getUser']);
    mockTokenStorage.getUser.and.returnValue({ user: { id: 'user1', name: 'Test User' } } as any);

    mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [RegistrationDetailsCardComponent],
      providers: [
        { provide: AppStore, useValue: mockAppStore },
        { provide: BhakiService, useValue: mockBhakiService },
        { provide: TokenStorageService, useValue: mockTokenStorage },
        { provide: ChangeDetectorRef, useValue: mockCdr }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationDetailsCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.registrationDetails).toBeNull();
      expect(component.isEditModalOpen).toBeFalse();
      expect(component.isSaving).toBeFalse();
      expect(component.editForm.registrationNumber).toBe('');
      expect(component.branchOptions).toEqual([]);
      expect(component.courseOptions).toEqual([]);
    });

    it('should subscribe to registration details on init', () => {
      fixture.detectChanges();
      expect(component.registrationDetails).toEqual(mockRegistrationDetails);
      expect(mockCdr.markForCheck).toHaveBeenCalled();
    });

    it('should load branches on init', () => {
      fixture.detectChanges();
      expect(mockBhakiService.getBranches).toHaveBeenCalled();
      expect(component.branchOptions.length).toBe(2);
      expect(component.branchOptions[0]).toEqual({ label: 'Main Branch', value: 'branch1' });
    });

    it('should handle branch loading error', () => {
      mockBhakiService.getBranches.and.returnValue(throwError(() => new Error('Failed to load')));
      spyOn(console, 'error');
      fixture.detectChanges();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loadBranches', () => {
    it('should load and map branches correctly', () => {
      component.loadBranches();
      expect(mockBhakiService.getBranches).toHaveBeenCalled();
      expect(component.branchOptions).toEqual([
        { label: 'Main Branch', value: 'branch1' },
        { label: 'Secondary Branch', value: 'branch2' }
      ]);
    });

    it('should handle error when loading branches', () => {
      mockBhakiService.getBranches.and.returnValue(throwError(() => new Error('Network error')));
      spyOn(console, 'error');
      component.loadBranches();
      expect(console.error).toHaveBeenCalledWith('Error loading branches:', jasmine.any(Error));
    });
  });

  describe('loadCourses', () => {
    it('should load courses for a given branch', () => {
      component.loadCourses('branch1');
      expect(mockBhakiService.getCourses).toHaveBeenCalledWith('branch1');
      expect(component.courseOptions).toEqual([
        { label: 'Web Development', value: 'course1' },
        { label: 'Mobile Development', value: 'course2' }
      ]);
    });

    it('should clear courses when branchId is empty', () => {
      component.loadCourses('');
      expect(component.courseOptions).toEqual([]);
      expect(mockBhakiService.getCourses).not.toHaveBeenCalled();
    });

    it('should handle error when loading courses', () => {
      mockBhakiService.getCourses.and.returnValue(throwError(() => new Error('Network error')));
      spyOn(console, 'error');
      component.loadCourses('branch1');
      expect(console.error).toHaveBeenCalledWith('Error loading courses:', jasmine.any(Error));
    });
  });

  describe('openEditModal', () => {
    it('should open modal and populate form with registration details', () => {
      component.registrationDetails = mockRegistrationDetails;
      component.openEditModal();
      
      expect(component.isEditModalOpen).toBeTrue();
      expect(component.editForm.registrationNumber).toBe('REG001');
      expect(component.editForm.paidAmount).toBe(5000);
      expect(component.editForm.outstandingAmount).toBe(2000);
      expect(component.editForm.branchId).toBe('branch1');
      expect(component.editForm.courseId).toBe('course1');
      expect(component.editForm.receiptReference).toBe('REC001');
    });

    it('should format registration date correctly', () => {
      component.registrationDetails = mockRegistrationDetails;
      component.openEditModal();
      
      const expectedDate = new Date('2024-01-15').toISOString().split('T')[0];
      expect(component.editForm.registrationDate).toBe(expectedDate);
    });

    it('should handle missing registration date', () => {
      const detailsWithoutDate = {
        ...mockRegistrationDetails,
        registration: { ...mockRegistrationDetails.registration, registrationDate: null }
      };
      component.registrationDetails = detailsWithoutDate;
      component.openEditModal();
      
      expect(component.editForm.registrationDate).toBe('');
    });

    it('should load courses when branchId exists', () => {
      component.registrationDetails = mockRegistrationDetails;
      spyOn(component, 'loadCourses');
      component.openEditModal();
      
      expect(component.loadCourses).toHaveBeenCalledWith('branch1');
    });

    it('should not open modal if registration details are null', () => {
      component.registrationDetails = null;
      component.openEditModal();
      
      expect(component.isEditModalOpen).toBeFalse();
    });

    it('should handle invalid date format', () => {
      const detailsWithInvalidDate = {
        ...mockRegistrationDetails,
        registration: { ...mockRegistrationDetails.registration, registrationDate: 'invalid-date' }
      };
      component.registrationDetails = detailsWithInvalidDate;
      component.openEditModal();
      
      expect(component.editForm.registrationDate).toBe('');
    });
  });

  describe('closeEditModal', () => {
    it('should close modal and reset form', () => {
      component.isEditModalOpen = true;
      component.editForm = {
        registrationNumber: 'REG001',
        registrationDate: '2024-01-15',
        paidAmount: 5000,
        outstandingAmount: 2000,
        branchId: 'branch1',
        courseId: 'course1',
        receiptReference: 'REC001'
      };
      
      component.closeEditModal();
      
      expect(component.isEditModalOpen).toBeFalse();
      expect(component.editForm.registrationNumber).toBe('');
      expect(component.editForm.registrationDate).toBe('');
      expect(component.editForm.paidAmount).toBe('');
      expect(component.editForm.outstandingAmount).toBe('');
      expect(component.editForm.branchId).toBe('');
      expect(component.editForm.courseId).toBe('');
      expect(component.editForm.receiptReference).toBe('');
    });
  });

  describe('onBranchChange', () => {
    it('should update branchId and reset courseId', () => {
      component.editForm.branchId = 'branch1';
      component.editForm.courseId = 'course1';
      spyOn(component, 'loadCourses');
      
      component.onBranchChange('branch2');
      
      expect(component.editForm.branchId).toBe('branch2');
      expect(component.editForm.courseId).toBe('');
      expect(component.loadCourses).toHaveBeenCalledWith('branch2');
    });
  });

  describe('onDateChange', () => {
    it('should update date from event object with dateStr', () => {
      const event = { dateStr: '2024-01-20', selectedDates: [] };
      component.onDateChange(event);
      
      expect(component.editForm.registrationDate).toBe('2024-01-20');
    });

    it('should update date from string', () => {
      component.onDateChange('2024-01-20');
      
      expect(component.editForm.registrationDate).toBe('2024-01-20');
    });

    it('should handle null or undefined event', () => {
      const initialDate = component.editForm.registrationDate;
      component.onDateChange(null);
      
      expect(component.editForm.registrationDate).toBe(initialDate);
    });
  });

  describe('saveChanges', () => {
    beforeEach(() => {
      component.registrationDetails = mockRegistrationDetails;
      component.branchOptions = [
        { label: 'Main Branch', value: 'branch1' },
        { label: 'Secondary Branch', value: 'branch2' }
      ];
      component.courseOptions = [
        { label: 'Web Development', value: 'course1' },
        { label: 'Mobile Development', value: 'course2' }
      ];
      component.editForm = {
        registrationNumber: 'REG002',
        registrationDate: '2024-02-01',
        paidAmount: 6000,
        outstandingAmount: 1500,
        branchId: 'branch2',
        courseId: 'course2',
        receiptReference: 'REC002'
      };
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should update registration details in store', () => {
      component.saveChanges();
      
      expect(component.isSaving).toBeTrue();
      expect(mockAppStore.setRegistrationDetails).toHaveBeenCalled();
      
      const callArgs: any = mockAppStore.setRegistrationDetails.calls.mostRecent().args[0];
      expect(callArgs.registration.registrationNumber).toBe('REG002');
      expect(callArgs.registration.paidAmount).toBe(6000);
      expect(callArgs.branch.id).toBe('branch2');
      expect(callArgs.branch.name).toBe('Secondary Branch');
      expect(callArgs.course.id).toBe('course2');
      expect(callArgs.course.name).toBe('Mobile Development');
    });

    it('should close modal after saving', (done) => {
      component.saveChanges();
      
      jasmine.clock().tick(500);
      
      setTimeout(() => {
        expect(component.isSaving).toBeFalse();
        expect(component.isEditModalOpen).toBeFalse();
        done();
      }, 500);
    });

    it('should not save if registration details are null', () => {
      component.registrationDetails = null;
      component.saveChanges();
      
      expect(mockAppStore.setRegistrationDetails).not.toHaveBeenCalled();
      expect(component.isSaving).toBeFalse();
    });

    it('should preserve existing branch if not found in options', () => {
      component.editForm.branchId = 'nonexistent';
      const originalBranch = mockRegistrationDetails.branch;
      
      component.saveChanges();
      
      const callArgs: any = mockAppStore.setRegistrationDetails.calls.mostRecent().args[0];
      expect(callArgs.branch).toEqual(originalBranch);
    });

    it('should preserve existing course if not found in options', () => {
      component.editForm.courseId = 'nonexistent';
      const originalCourse = mockRegistrationDetails.course;
      
      component.saveChanges();
      
      const callArgs: any = mockAppStore.setRegistrationDetails.calls.mostRecent().args[0];
      expect(callArgs.course).toEqual(originalCourse);
    });
  });

  describe('Component Lifecycle', () => {
    it('should unsubscribe on destroy', () => {
      fixture.detectChanges();
      const subscription = component['subscription'];
      spyOn(subscription!, 'unsubscribe');
      
      component.ngOnDestroy();
      
      expect(subscription?.unsubscribe).toHaveBeenCalled();
    });

    it('should handle destroy when subscription is undefined', () => {
      component['subscription'] = undefined;
      
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty registration details', () => {
      const mockStoreWithNull = jasmine.createSpyObj('AppStore', ['setRegistrationDetails'], {
        $registrationDetails: of(null)
      });
      TestBed.overrideProvider(AppStore, { useValue: mockStoreWithNull });
      fixture = TestBed.createComponent(RegistrationDetailsCardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(component.registrationDetails).toBeNull();
    });

    it('should handle missing optional fields', () => {
      const minimalDetails = {
        registration: {
          registrationNumber: 'REG001'
        }
      };
      component.registrationDetails = minimalDetails;
      component.openEditModal();
      
      expect(component.editForm.registrationNumber).toBe('REG001');
      expect(component.editForm.registrationDate).toBe('');
      expect(component.editForm.paidAmount).toBe('');
    });

    it('should handle branch options with empty array', () => {
      mockBhakiService.getBranches.and.returnValue(of([]));
      component.loadBranches();
      
      expect(component.branchOptions).toEqual([]);
    });
  });
});

