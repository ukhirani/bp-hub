import { forwardRef, type AnchorHTMLAttributes } from "react";
import { Link as RouterLink } from "react-router-dom";

const EXTERNAL = /^(?:[a-z][a-z\d+\-.]*:|\/\/|#)/i;

/**
 * Astryx renders every link through this component (see LinkProvider in
 * main.tsx): in-app paths go through the router, everything else stays a
 * plain anchor.
 */
const AppLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement>
>(function AppLink({ href = "", ...rest }, ref) {
  if (EXTERNAL.test(href) || rest.target === "_blank" || rest.download) {
    return <a ref={ref} href={href} {...rest} />;
  }
  return <RouterLink ref={ref} to={href} {...rest} />;
});

export default AppLink;
