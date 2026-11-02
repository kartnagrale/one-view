import { HttpInterceptorFn } from '@angular/common/http';
export const authInterceptor: HttpInterceptorFn = (req,next) => {
  const token=sessionStorage.getItem('agri-basic-token');
  return next(token ? req.clone({setHeaders:{Authorization:`Basic ${token}`}}) : req);
};
