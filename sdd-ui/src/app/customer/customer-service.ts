import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  CustomerRequest,
  CustomerResponse,
  CustomerApiError,
  ApiProblem,
} from './customer';

const CUSTOMERS_URL = '/api/customers';

const SERVER_ERROR_THRESHOLD = 500;

function toApiError(error: HttpErrorResponse): CustomerApiError {
  const isServerError = error.status >= SERVER_ERROR_THRESHOLD;
  if (isServerError) {
    return { status: error.status, errors: [], isServerError: true };
  }
  const problem = error.error as ApiProblem | null;
  return {
    status: error.status,
    errors: problem?.errors ?? [],
    isServerError: false,
  };
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);

  create(request: CustomerRequest): Observable<CustomerResponse> {
    return this.http
      .post<CustomerResponse>(CUSTOMERS_URL, request, { observe: 'response' })
      .pipe(
        map((response) => response.body as CustomerResponse),
        catchError((error: HttpErrorResponse) =>
          throwError(() => toApiError(error)),
        ),
      );
  }
}
