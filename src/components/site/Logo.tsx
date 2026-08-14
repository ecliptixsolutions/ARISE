export function Logo({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/Arise-logo.jpeg"
      alt="Arise Healthcare Solutions"
      height={size}
      className={`block shrink-0 object-contain ${className}`}
      style={{ height: size, width: "auto" }}
    />
  );
}
