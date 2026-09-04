const Logo = ({ size = 22, className = "" }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 22c3.2-4.4 7.4-6.6 12-6.6S24.8 17.6 28 22"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="12.2" cy="10.2" r="3.1" fill="currentColor" />
      <path
        d="M7.4 19.2c.6-3.1 2.4-4.7 4.8-4.7s4.2 1.6 4.8 4.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="20.4" cy="9.4" r="2.6" fill="currentColor" opacity="0.92" />
      <path
        d="M16.6 18.4c.5-2.6 2-4 4-4s3.5 1.4 4 4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        opacity="0.92"
      />
    </svg>
  );
};

export default Logo;
