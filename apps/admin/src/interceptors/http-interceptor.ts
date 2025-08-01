import { HttpInterceptorFn } from '@angular/common/http';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const clone = req.clone({
    url: req.url.replace("api/","http://localhost:3000/")
  })
  return next(clone);
};
