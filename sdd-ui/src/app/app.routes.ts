import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'customers',
    loadChildren: () => import('./customer/customer.routes').then((m) => m.customerRoutes),
  },
];
