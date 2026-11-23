import logo from "@/assets/white.png";

/**
 * The isometric "bp" mark. The artwork is a white block with a black
 * outline, so it reads on light and dark grounds alike.
 */
export default function BrandMark({
  size = 28,
  label = "Boilerplate",
}: {
  size?: number;
  label?: string;
}) {
  return (
    <img
      src={logo}
      width={size}
      height={size}
      alt={label}
      className="block shrink-0 object-contain"
    />
  );
}
