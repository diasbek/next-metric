export default function AdminDashboardLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      style={{
        display: "grid",
        gap: 16,
        padding: "8px 0 40px",
      }}
    >
      <div
        style={{
          height: 28,
          width: "min(280px, 60%)",
          background: "#1a1a1a",
          borderRadius: 0,
        }}
      />
      <div
        style={{
          height: 14,
          width: "min(420px, 80%)",
          background: "#141414",
        }}
      />
      <div
        style={{
          marginTop: 12,
          minHeight: 240,
          background: "linear-gradient(90deg, #121212 0%, #1a1a1a 50%, #121212 100%)",
          backgroundSize: "200% 100%",
          border: "1px solid #222",
        }}
      />
    </div>
  );
}
