export function Logo({ size = 56, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/arise-logo.png"
      alt="Arise Healthcare Solutions"
      height={size}
      className={`block shrink-0 object-contain ${className}`}
      style={{ height: size, width: "auto" }}
    />
  );
}
