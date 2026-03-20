interface GoldButtonProps {
  title: string;
  onClick: () => void;
  loading?: boolean;
  outline?: boolean;
  type?: "button" | "submit";
}

export default function GoldButton({
  title,
  onClick,
  loading = false,
  outline = false,
  type = "button",
}: GoldButtonProps) {
  return (
    <button
      type={type}
      className={`gold-btn ${outline ? "outline" : "primary"}`}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? "PROCESSING..." : title}
    </button>
  );
}
