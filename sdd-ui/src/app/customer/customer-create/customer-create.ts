import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CustomerService } from '../customer-service';
import { CustomerApiError, CustomerRequest } from '../customer';

const NAME_PATTERN = /^[\p{L}\-']+$/u;
const PHONE_PATTERN = /^[0-9 +()\-]*$/;

@Component({
  selector: 'app-customer-create',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './customer-create.html',
  styleUrl: './customer-create.scss',
})
export class CustomerCreate {
  private readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly form = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.maxLength(100),
      Validators.pattern(NAME_PATTERN),
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.maxLength(100),
      Validators.pattern(NAME_PATTERN),
    ]),
    email: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.email]),
    phone: new FormControl('', [Validators.maxLength(20), Validators.pattern(PHONE_PATTERN)]),
    company: new FormControl('', [Validators.maxLength(150)]),
  });

  get firstName() {
    return this.form.controls.firstName;
  }
  get lastName() {
    return this.form.controls.lastName;
  }
  get email() {
    return this.form.controls.email;
  }
  get phone() {
    return this.form.controls.phone;
  }

  onSubmit(): void {
    this.customerService.create(this.form.value as CustomerRequest).subscribe({
      next: () => this.onSuccess(),
      error: (err: CustomerApiError) => this.onError(err),
    });
  }

  private onSuccess(): void {
    this.snackBar.open('Customer created successfully', 'Close', { duration: 3000 });
    this.router.navigate(['/customers']);
  }

  private onError(err: CustomerApiError): void {
    if (err.isServerError) {
      this.snackBar.open('An unexpected error occurred. Please try again later.', 'Close');
      return;
    }
    for (const { field, message } of err.errors) {
      this.form.get(field)?.setErrors({ serverError: message });
    }
  }
}
