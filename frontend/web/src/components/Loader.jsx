export default function Loader({ fullScreen = true }) {
  return (
    <div
      className={`
        flex items-center justify-center
        ${fullScreen ? "fixed inset-0 z-50 bg-desert-sand" : "relative"}
      `}
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        
        {/* Outer rotating ring */}
        <div
          className="
            absolute inset-0
            rounded-full
            border-2
            border-sage/30
            border-t-rust
            animate-spin
          "
          style={{ animationDuration: "1.4s" }}
        />

        {/* Inner ring */}
        <div
          className="
            absolute inset-3
            rounded-full
            border
            border-saddle-brown/20
            border-b-saddle-brown
            animate-spin
          "
          style={{
            animationDuration: "2s",
            animationDirection: "reverse",
          }}
        />

        {/* Center mark */}
        <div className="relative flex items-center justify-center">
          <span
            className="
              font-serif
              text-2xl
              font-semibold
              tracking-wide
              text-saddle-brown
            "
          >
            DD
          </span>
        </div>
      </div>
    </div>
  );
}