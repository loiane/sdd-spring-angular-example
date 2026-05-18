import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CustomerCreate } from './customer-create';

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
