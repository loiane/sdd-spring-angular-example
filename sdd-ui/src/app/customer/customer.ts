export interface CustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
}

export interface CustomerResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiProblem {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  errors?: ApiFieldError[];
}

export interface CustomerApiError {
  status: number;
  errors: ApiFieldError[];
  isServerError: boolean;
}
