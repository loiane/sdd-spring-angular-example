import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { CustomerCreate } from './customer-create';
import { CustomerService } from '../customer-service';
import { CustomerResponse, CustomerApiError } from '../customer';

describe('CustomerCreate', () => {
  let fixture: ComponentFixture<CustomerCreate>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerCreate, ReactiveFormsModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerCreate);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  describe('[AC-001] form fields', () => {
    it('Given the create-customer form, when rendered, then all five fields are present', () => {
      expect(element.querySelector('[data-testid="firstName"]')).toBeTruthy();
      expect(element.querySelector('[data-testid="lastName"]')).toBeTruthy();
      expect(element.querySelector('[data-testid="email"]')).toBeTruthy();
      expect(element.querySelector('[data-testid="phone"]')).toBeTruthy();
      expect(element.querySelector('[data-testid="company"]')).toBeTruthy();
    });
  });

  describe('[AC-002] submit button disabled', () => {
    it('Given an empty form, when the form is invalid, then the submit button is disabled', () => {
      const btn = element.querySelector<HTMLButtonElement>('[data-testid="submitBtn"]');
      expect(btn).toBeTruthy();
      expect(btn!.disabled).toBe(true);
    });
  });

  describe('[AC-003] required field inline error', () => {
    it('Given a blank First Name field, when the field is touched, then a required error appears', async () => {
      const comp = fixture.componentInstance;
      comp.form.get('firstName')!.markAsTouched();
      fixture.detectChanges();
      const error = element.querySelector('[data-testid="firstNameRequired"]');
      expect(error).toBeTruthy();
    });

    it('Given a blank Last Name field, when the field is touched, then a required error appears', async () => {
      const comp = fixture.componentInstance;
      comp.form.get('lastName')!.markAsTouched();
      fixture.detectChanges();
      const error = element.querySelector('[data-testid="lastNameRequired"]');
      expect(error).toBeTruthy();
    });

    it('Given a blank Email field, when the field is touched, then a required error appears', async () => {
      const comp = fixture.componentInstance;
      comp.form.get('email')!.markAsTouched();
      fixture.detectChanges();
      const error = element.querySelector('[data-testid="emailRequired"]');
      expect(error).toBeTruthy();
    });
  });

  describe('[AC-004] name format inline error', () => {
    it('Given a First Name with a digit, when the field is touched, then a pattern error appears', () => {
      const comp = fixture.componentInstance;
      comp.form.get('firstName')!.setValue('Jane1');
      comp.form.get('firstName')!.markAsTouched();
      fixture.detectChanges();
      const error = element.querySelector('[data-testid="firstNamePattern"]');
      expect(error).toBeTruthy();
    });
  });

  describe('[AC-005] email format inline error', () => {
    it('Given an invalid email string, when the field is touched, then an email format error appears', () => {
      const comp = fixture.componentInstance;
      comp.form.get('email')!.setValue('not-an-email');
      comp.form.get('email')!.markAsTouched();
      fixture.detectChanges();
      const error = element.querySelector('[data-testid="emailFormat"]');
      expect(error).toBeTruthy();
    });
  });

  describe('[AC-006] phone format inline error', () => {
    it('Given a phone value with #, when the field is touched, then a pattern error appears', () => {
      const comp = fixture.componentInstance;
      comp.form.get('phone')!.setValue('#bad');
      comp.form.get('phone')!.markAsTouched();
      fixture.detectChanges();
      const error = element.querySelector('[data-testid="phonePattern"]');
      expect(error).toBeTruthy();
    });
  });

  describe('[AC-007] error clears on correction', () => {
    it('Given a firstName pattern error, when a valid value is entered, then the pattern error disappears', () => {
      const comp = fixture.componentInstance;
      comp.form.get('firstName')!.setValue('Jane1');
      comp.form.get('firstName')!.markAsTouched();
      fixture.detectChanges();
      expect(element.querySelector('[data-testid="firstNamePattern"]')).toBeTruthy();

      comp.form.get('firstName')!.setValue('Jane');
      fixture.detectChanges();
      expect(element.querySelector('[data-testid="firstNamePattern"]')).toBeNull();
    });
  });
});

const VALID_RESPONSE: CustomerResponse = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
};

describe('CustomerCreate — HTTP integration', () => {
  let fixture: ComponentFixture<CustomerCreate>;
  let comp: CustomerCreate;
  let mockService: { create: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockSnackBar: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockService = { create: vi.fn() };
    mockRouter = { navigate: vi.fn() };
    mockSnackBar = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CustomerCreate, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: CustomerService, useValue: mockService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerCreate);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillValidForm(): void {
    comp.form.setValue({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '',
      company: '',
    });
  }

  describe('[AC-008, AC-009] happy path', () => {
    it('Given a valid form, when submitted, then CustomerService.create is called once', () => {
      mockService.create.mockReturnValue(of(VALID_RESPONSE));
      fillValidForm();

      comp.onSubmit();

      expect(mockService.create).toHaveBeenCalledTimes(1);
      expect(mockService.create).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '',
        company: '',
      });
    });

    it('Given a valid form, when submitted successfully, then a success snackbar opens and router navigates to /customers', () => {
      mockService.create.mockReturnValue(of(VALID_RESPONSE));
      fillValidForm();

      comp.onSubmit();

      expect(mockSnackBar.open).toHaveBeenCalledWith('Customer created successfully', 'Close', {
        duration: 3000,
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/customers']);
    });
  });

  describe('[AC-010, AC-012] 400 field error mapping', () => {
    it('Given a 400 response with field errors, when submitted, then errors appear on the corresponding form controls', () => {
      const apiError: CustomerApiError = {
        status: 400,
        isServerError: false,
        errors: [
          { field: 'firstName', message: 'First name is required' },
          { field: 'email', message: 'Must be a valid email address' },
        ],
      };
      mockService.create.mockReturnValue(throwError(() => apiError));
      fillValidForm();

      comp.onSubmit();

      expect(comp.form.get('firstName')!.errors).toEqual({
        serverError: 'First name is required',
      });
      expect(comp.form.get('email')!.errors).toEqual({
        serverError: 'Must be a valid email address',
      });
    });
  });

  describe('[AC-011] 409 email conflict mapping', () => {
    it('Given a 409 response, when submitted, then the email field shows "already in use" error', () => {
      const apiError: CustomerApiError = {
        status: 409,
        isServerError: false,
        errors: [{ field: 'email', message: 'This email address is already in use' }],
      };
      mockService.create.mockReturnValue(throwError(() => apiError));
      fillValidForm();

      comp.onSubmit();

      expect(comp.form.get('email')!.errors).toEqual({
        serverError: 'This email address is already in use',
      });
    });
  });

  describe('[AC-013] 500 generic snackbar', () => {
    it('Given a 500 response, when submitted, then a generic snackbar appears and the form values are preserved', () => {
      const apiError: CustomerApiError = {
        status: 500,
        isServerError: true,
        errors: [],
      };
      mockService.create.mockReturnValue(throwError(() => apiError));
      fillValidForm();

      comp.onSubmit();

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again later.',
        'Close',
      );
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(comp.form.get('firstName')!.value).toBe('Jane');
    });
  });
});
