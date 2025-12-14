import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 3v10c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V3" />
      <path d="M6 3h12" />
      <path d="M7 19h10" />
      <path d="M12 15v4" />
      <path d="m10 9 4 4" />
      <path d="m14 9-4 4" />
    </svg>
  );
}
