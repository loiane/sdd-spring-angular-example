import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { CustomerService } from './customer-service';
import {
  CustomerRequest,
  CustomerResponse,
  CustomerApiError,
  ApiFieldError,
} from './customer';

const CUSTOMERS_URL = '/api/customers';

const VALID_REQUEST: CustomerRequest = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  phone: '+1-555-0100',
  company: 'Acme Corp',
};

const VALID_RESPONSE: CustomerResponse = {
  id: 42,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  phone: '+1-555-0100',
  company: 'Acme Corp',
};

const FIELD_ERRORS_400: ApiFieldError[] = [
  { field: 'firstName', message: 'First name is required' },
  { field: 'email', message: 'Email must be a valid address' },
];

const EMAIL_CONFLICT_ERROR: ApiFieldError = {
  field: 'email',
  message: 'This email address is already in use',
};

describe('CustomerService', () => {
  let service: CustomerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CustomerService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('create()', () => {
    it('[AC-008] should POST to /api/customers and return CustomerResponse on 201', async () => {
      const resultPromise = firstValueFrom(service.create(VALID_REQUEST));

      const req = httpMock.expectOne(CUSTOMERS_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(VALID_REQUEST);
      req.flush(VALID_RESPONSE, { status: 201, statusText: 'Created' });

      const result = await resultPromise;
      expect(result).toEqual(VALID_RESPONSE);
    });

    it('[AC-010, AC-012] should emit CustomerApiError with status 400 and field errors on 400 response', async () => {
      const resultPromise = firstValueFrom(service.create(VALID_REQUEST));

      const req = httpMock.expectOne(CUSTOMERS_URL);
      req.flush(
        { errors: FIELD_ERRORS_400 },
        { status: 400, statusText: 'Bad Request' },
      );

      let thrownError: CustomerApiError | undefined;
      try {
        await resultPromise;
        throw new Error('Expected an error, not a value');
      } catch (err) {
        thrownError = err as CustomerApiError;
      }

      expect(thrownError!.status).toBe(400);
      expect(thrownError!.isServerError).toBe(false);
      expect(thrownError!.errors).toEqual(FIELD_ERRORS_400);
    });

    it('[AC-011] should emit CustomerApiError with status 409 and email field error on 409 response', async () => {
      const resultPromise = firstValueFrom(service.create(VALID_REQUEST));

      const req = httpMock.expectOne(CUSTOMERS_URL);
      req.flush(
        { errors: [EMAIL_CONFLICT_ERROR] },
        { status: 409, statusText: 'Conflict' },
      );

      let thrownError: CustomerApiError | undefined;
      try {
        await resultPromise;
        throw new Error('Expected an error, not a value');
      } catch (err) {
        thrownError = err as CustomerApiError;
      }

      expect(thrownError!.status).toBe(409);
      expect(thrownError!.isServerError).toBe(false);
      expect(thrownError!.errors).toEqual([EMAIL_CONFLICT_ERROR]);
    });

    it('[AC-013] should emit CustomerApiError with status 500 and isServerError true on 500 response', async () => {
      const resultPromise = firstValueFrom(service.create(VALID_REQUEST));

      const req = httpMock.expectOne(CUSTOMERS_URL);
      req.flush(
        { detail: 'An unexpected error occurred. Please try again later.' },
        { status: 500, statusText: 'Internal Server Error' },
      );

      let thrownError: CustomerApiError | undefined;
      try {
        await resultPromise;
        throw new Error('Expected an error, not a value');
      } catch (err) {
        thrownError = err as CustomerApiError;
      }

      expect(thrownError!.status).toBe(500);
      expect(thrownError!.isServerError).toBe(true);
      expect(thrownError!.errors).toEqual([]);
    });
  });
});
