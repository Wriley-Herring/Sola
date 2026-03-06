const protectedRoutes = ["/today", "/plans", "/progress", "/profile"];

export function isProtectedPath(pathname: string) {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function shouldRedirectToLogin(pathname: string, isAuthenticated: boolean) {
  return isProtectedPath(pathname) && !isAuthenticated;
}

export function shouldRedirectToToday(pathname: string, isAuthenticated: boolean) {
  return pathname === "/login" && isAuthenticated;
}
