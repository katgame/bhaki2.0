import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { StudentInfoCardComponent } from './student-info-card.component';
import { AppStore } from '../../../state/app.store';

describe('StudentInfoCardComponent', () => {
  let component: StudentInfoCardComponent;
  let fixture: ComponentFixture<StudentInfoCardComponent>;
  let mockAppStore: jasmine.SpyObj<AppStore>;
  let mockCdr: jasmine.SpyObj<ChangeDetectorRef>;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;

  const mockRegistrationDetails = {
    registration: {
      student: {
        name: 'John',
        surname: 'Doe',
        idNumber: '1234567890123',
        passport: '',
        emailAddress: 'john.doe@example.com',
        cellPhone: '+1234567890',
        address: {
          streetName: '123 Main St',
          line1: 'Apt 4B',
          line2: '',
          city: 'New York',
          postalCode: '10001'
        },
        idDocument: 'base64encodedstring'
      }
    }
  };

  const mockRegistrationDetailsWithPassport = {
    registration: {
      student: {
        name: 'Jane',
        surname: 'Smith',
        idNumber: '',
        passport: 'AB123456',
        emailAddress: 'jane.smith@example.com',
        cellPhone: '+9876543210',
        address: {
          streetName: '456 Oak Ave',
          line1: 'Suite 100',
          line2: 'Building B',
          city: 'Los Angeles',
          postalCode: '90001'
        },
        idDocument: null
      }
    }
  };

  const mockRegistrationDetailsWithByteArray = {
    registration: {
      student: {
        name: 'Test',
        surname: 'User',
        idNumber: '9876543210987',
        emailAddress: 'test@example.com',
        cellPhone: '+1111111111',
        address: {
          streetName: '789 Test St',
          city: 'Test City',
          postalCode: '12345'
        },
        idDocument: [255, 216, 255, 224, 0, 16, 74, 70, 73, 70] // JPEG header bytes
      }
    }
  };

  beforeEach(async () => {
    mockAppStore = jasmine.createSpyObj('AppStore', ['setRegistrationDetails'], {
      $registrationDetails: of(mockRegistrationDetails)
    });

    mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    mockSanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
    mockSanitizer.bypassSecurityTrustResourceUrl.and.returnValue('data:image/jpeg;base64,base64encodedstring' as any);

    await TestBed.configureTestingModule({
      imports: [StudentInfoCardComponent],
      providers: [
        { provide: AppStore, useValue: mockAppStore },
        { provide: ChangeDetectorRef, useValue: mockCdr },
        { provide: DomSanitizer, useValue: mockSanitizer }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentInfoCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.registrationDetails).toBeNull();
      expect(component.isStudentEditModalOpen).toBeFalse();
      expect(component.isSavingStudent).toBeFalse();
      expect(component.idDocument).toBeUndefined();
      expect(component.studentEditForm.name).toBe('');
      expect(component.idTypeOptions.length).toBe(2);
    });

    it('should subscribe to registration details on init', () => {
      fixture.detectChanges();
      expect(component.registrationDetails).toEqual(mockRegistrationDetails);
      expect(mockCdr.markForCheck).toHaveBeenCalled();
    });

    it('should process idDocument as base64 string', () => {
      fixture.detectChanges();
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(
        'data:image/jpeg;base64,base64encodedstring'
      );
    });

    it('should process idDocument as byte array', () => {
      const mockStoreWithByteArray = jasmine.createSpyObj('AppStore', ['setRegistrationDetails'], {
        $registrationDetails: of(mockRegistrationDetailsWithByteArray)
      });
      TestBed.overrideProvider(AppStore, { useValue: mockStoreWithByteArray });
      fixture = TestBed.createComponent(StudentInfoCardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled();
    });

    it('should handle null idDocument', () => {
      const detailsWithoutDoc = {
        registration: {
          student: {
            ...mockRegistrationDetails.registration.student,
            idDocument: null
          }
        }
      };
      const mockStoreWithNullDoc = jasmine.createSpyObj('AppStore', ['setRegistrationDetails'], {
        $registrationDetails: of(detailsWithoutDoc)
      });
      TestBed.overrideProvider(AppStore, { useValue: mockStoreWithNullDoc });
      fixture = TestBed.createComponent(StudentInfoCardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(component.idDocument).toBeNull();
    });

    it('should handle missing idDocument', () => {
      const detailsWithoutDoc = {
        registration: {
          student: {
            name: 'Test',
            surname: 'User'
          }
        }
      };
      const mockStoreWithoutDoc = jasmine.createSpyObj('AppStore', ['setRegistrationDetails'], {
        $registrationDetails: of(detailsWithoutDoc)
      });
      TestBed.overrideProvider(AppStore, { useValue: mockStoreWithoutDoc });
      fixture = TestBed.createComponent(StudentInfoCardComponent);
      component = fixture.componentInstance;
      spyOn(console, 'log');
      fixture.detectChanges();
      
      expect(component.idDocument).toBeNull();
      expect(console.log).toHaveBeenCalledWith('No idDocument found in registration data');
    });

    it('should handle invalid idDocument (too short)', () => {
      const detailsWithShortDoc = {
        registration: {
          student: {
            ...mockRegistrationDetails.registration.student,
            idDocument: 'short'
          }
        }
      };
      const mockStoreWithShortDoc = jasmine.createSpyObj('AppStore', ['setRegistrationDetails'], {
        $registrationDetails: of(detailsWithShortDoc)
      });
      TestBed.overrideProvider(AppStore, { useValue: mockStoreWithShortDoc });
      fixture = TestBed.createComponent(StudentInfoCardComponent);
      component = fixture.componentInstance;
      spyOn(console, 'warn');
      fixture.detectChanges();
      
      expect(component.idDocument).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('openStudentEditModal', () => {
    it('should open modal and populate form with student details', () => {
      component.registrationDetails = mockRegistrationDetails;
      component.openStudentEditModal();
      
      expect(component.isStudentEditModalOpen).toBeTrue();
      expect(component.studentEditForm.name).toBe('John');
      expect(component.studentEditForm.surname).toBe('Doe');
      expect(component.studentEditForm.idType).toBe('idNumber');
      expect(component.studentEditForm.idNumber).toBe('1234567890123');
      expect(component.studentEditForm.emailAddress).toBe('john.doe@example.com');
      expect(component.studentEditForm.cellPhone).toBe('+1234567890');
      expect(component.studentEditForm.streetAddress).toBe('123 Main St');
      expect(component.studentEditForm.line1).toBe('Apt 4B');
      expect(component.studentEditForm.city).toBe('New York');
      expect(component.studentEditForm.postalCode).toBe('10001');
    });

    it('should detect passport type when passport exists and idNumber does not', () => {
      component.registrationDetails = mockRegistrationDetailsWithPassport;
      component.openStudentEditModal();
      
      expect(component.studentEditForm.idType).toBe('passport');
      expect(component.studentEditForm.passport).toBe('AB123456');
      expect(component.studentEditForm.idNumber).toBe('');
    });

    it('should default to idNumber when both exist', () => {
      const detailsWithBoth = {
        registration: {
          student: {
            ...mockRegistrationDetails.registration.student,
            passport: 'AB123456'
          }
        }
      };
      component.registrationDetails = detailsWithBoth;
      component.openStudentEditModal();
      
      expect(component.studentEditForm.idType).toBe('idNumber');
    });

    it('should handle missing student data', () => {
      const detailsWithoutStudent = {
        registration: {}
      };
      component.registrationDetails = detailsWithoutStudent;
      component.openStudentEditModal();
      
      expect(component.studentEditForm.name).toBe('');
      expect(component.studentEditForm.surname).toBe('');
    });

    it('should handle missing address data', () => {
      const detailsWithoutAddress = {
        registration: {
          student: {
            name: 'Test',
            surname: 'User'
          }
        }
      };
      component.registrationDetails = detailsWithoutAddress;
      component.openStudentEditModal();
      
      expect(component.studentEditForm.streetAddress).toBe('');
      expect(component.studentEditForm.city).toBe('');
    });

    it('should not open modal if registration details are null', () => {
      component.registrationDetails = null;
      component.openStudentEditModal();
      
      expect(component.isStudentEditModalOpen).toBeFalse();
    });
  });

  describe('closeStudentEditModal', () => {
    it('should close modal and reset form', () => {
      component.isStudentEditModalOpen = true;
      component.studentEditForm = {
        name: 'John',
        surname: 'Doe',
        idType: 'idNumber',
        idNumber: '1234567890123',
        passport: '',
        emailAddress: 'john.doe@example.com',
        cellPhone: '+1234567890',
        streetAddress: '123 Main St',
        line1: 'Apt 4B',
        line2: '',
        city: 'New York',
        postalCode: '10001'
      };
      
      component.closeStudentEditModal();
      
      expect(component.isStudentEditModalOpen).toBeFalse();
      expect(component.studentEditForm.name).toBe('');
      expect(component.studentEditForm.surname).toBe('');
      expect(component.studentEditForm.idType).toBe('idNumber');
      expect(component.studentEditForm.idNumber).toBe('');
      expect(component.studentEditForm.emailAddress).toBe('');
      expect(component.studentEditForm.cellPhone).toBe('');
      expect(component.studentEditForm.streetAddress).toBe('');
      expect(component.studentEditForm.city).toBe('');
      expect(component.studentEditForm.postalCode).toBe('');
    });
  });

  describe('saveStudentChanges', () => {
    beforeEach(() => {
      component.registrationDetails = mockRegistrationDetails;
      component.studentEditForm = {
        name: 'Jane',
        surname: 'Smith',
        idType: 'passport',
        idNumber: '',
        passport: 'CD789012',
        emailAddress: 'jane.smith@example.com',
        cellPhone: '+9876543210',
        streetAddress: '456 Oak Ave',
        line1: 'Suite 100',
        line2: 'Building B',
        city: 'Los Angeles',
        postalCode: '90001'
      };
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should update student details in store', () => {
      component.saveStudentChanges();
      
      expect(component.isSavingStudent).toBeTrue();
      expect(mockAppStore.setRegistrationDetails).toHaveBeenCalled();
      
      const callArgs: any = mockAppStore.setRegistrationDetails.calls.mostRecent().args[0];
      expect(callArgs.registration.student.name).toBe('Jane');
      expect(callArgs.registration.student.surname).toBe('Smith');
      expect(callArgs.registration.student.passport).toBe('CD789012');
      expect(callArgs.registration.student.idNumber).toBe('');
      expect(callArgs.registration.student.emailAddress).toBe('jane.smith@example.com');
      expect(callArgs.registration.student.cellPhone).toBe('+9876543210');
      expect(callArgs.registration.student.address.streetName).toBe('456 Oak Ave');
      expect(callArgs.registration.student.address.city).toBe('Los Angeles');
    });

    it('should set idNumber when idType is idNumber', () => {
      component.studentEditForm.idType = 'idNumber';
      component.studentEditForm.idNumber = '9876543210987';
      component.studentEditForm.passport = '';
      
      component.saveStudentChanges();
      
      const callArgs: any = mockAppStore.setRegistrationDetails.calls.mostRecent().args[0];
      expect(callArgs.registration.student.idNumber).toBe('9876543210987');
      expect(callArgs.registration.student.passport).toBe('');
    });

    it('should set passport when idType is passport', () => {
      component.saveStudentChanges();
      
      const callArgs: any = mockAppStore.setRegistrationDetails.calls.mostRecent().args[0];
      expect(callArgs.registration.student.passport).toBe('CD789012');
      expect(callArgs.registration.student.idNumber).toBe('');
    });

    it('should preserve existing address properties', () => {
      const originalAddress = {
        ...mockRegistrationDetails.registration.student.address,
        someOtherProperty: 'value'
      };
      component.registrationDetails = {
        registration: {
          student: {
            ...mockRegistrationDetails.registration.student,
            address: originalAddress
          }
        }
      };
      
      component.saveStudentChanges();
      
      const callArgs: any = mockAppStore.setRegistrationDetails.calls.mostRecent().args[0];
      expect(callArgs.registration.student.address.someOtherProperty).toBe('value');
    });

    it('should handle missing address', () => {
      component.registrationDetails = {
        registration: {
          student: {
            name: 'Test',
            surname: 'User'
          }
        }
      };
      
      component.saveStudentChanges();
      
      const callArgs: any = mockAppStore.setRegistrationDetails.calls.mostRecent().args[0];
      expect(callArgs.registration.student.address).toBeDefined();
      expect(callArgs.registration.student.address.streetName).toBe('456 Oak Ave');
    });

    it('should close modal after saving', (done) => {
      component.saveStudentChanges();
      
      jasmine.clock().tick(500);
      
      setTimeout(() => {
        expect(component.isSavingStudent).toBeFalse();
        expect(component.isStudentEditModalOpen).toBeFalse();
        done();
      }, 500);
    });

    it('should not save if registration details are null', () => {
      component.registrationDetails = null;
      component.saveStudentChanges();
      
      expect(mockAppStore.setRegistrationDetails).not.toHaveBeenCalled();
      expect(component.isSavingStudent).toBeFalse();
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

  describe('ID Document Processing', () => {
    it('should handle large byte arrays in chunks', () => {
      const largeByteArray = new Array(20000).fill(65); // 20000 'A' bytes
      const detailsWithLargeArray = {
        registration: {
          student: {
            ...mockRegistrationDetails.registration.student,
            idDocument: largeByteArray
          }
        }
      };
      const mockStoreWithLargeArray = jasmine.createSpyObj('AppStore', ['setRegistrationDetails'], {
        $registrationDetails: of(detailsWithLargeArray)
      });
      TestBed.overrideProvider(AppStore, { useValue: mockStoreWithLargeArray });
      fixture = TestBed.createComponent(StudentInfoCardComponent);
      component = fixture.componentInstance;
      spyOn(console, 'log');
      fixture.detectChanges();
      
      expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled();
    });

    it('should log warnings for invalid document data', () => {
      const detailsWithInvalidDoc = {
        registration: {
          student: {
            ...mockRegistrationDetails.registration.student,
            idDocument: 'too-short'
          }
        }
      };
      const mockStoreWithInvalidDoc = jasmine.createSpyObj('AppStore', ['setRegistrationDetails'], {
        $registrationDetails: of(detailsWithInvalidDoc)
      });
      TestBed.overrideProvider(AppStore, { useValue: mockStoreWithInvalidDoc });
      fixture = TestBed.createComponent(StudentInfoCardComponent);
      component = fixture.componentInstance;
      spyOn(console, 'warn');
      fixture.detectChanges();
      
      expect(console.warn).toHaveBeenCalled();
      expect(component.idDocument).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty registration details', () => {
      const mockStoreWithNull = jasmine.createSpyObj('AppStore', ['setRegistrationDetails'], {
        $registrationDetails: of(null)
      });
      TestBed.overrideProvider(AppStore, { useValue: mockStoreWithNull });
      fixture = TestBed.createComponent(StudentInfoCardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(component.registrationDetails).toBeNull();
    });

    it('should handle missing optional student fields', () => {
      const minimalDetails = {
        registration: {
          student: {
            name: 'Test'
          }
        }
      };
      component.registrationDetails = minimalDetails;
      component.openStudentEditModal();
      
      expect(component.studentEditForm.name).toBe('Test');
      expect(component.studentEditForm.surname).toBe('');
      expect(component.studentEditForm.emailAddress).toBe('');
    });

    it('should handle empty address fields', () => {
      const detailsWithEmptyAddress = {
        registration: {
          student: {
            name: 'Test',
            surname: 'User',
            address: {
              streetName: '',
              line1: '',
              line2: '',
              city: '',
              postalCode: ''
            }
          }
        }
      };
      component.registrationDetails = detailsWithEmptyAddress;
      component.openStudentEditModal();
      
      expect(component.studentEditForm.streetAddress).toBe('');
      expect(component.studentEditForm.city).toBe('');
    });
  });
});

