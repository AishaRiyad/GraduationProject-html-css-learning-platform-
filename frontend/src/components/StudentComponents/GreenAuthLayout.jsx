export default function GreenAuthLayout({ children }) {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-green-50 to-white grid place-items-center px-4">
      <div className="bg-bubbles" aria-hidden>
        <span></span><span></span><span></span><span></span>
      </div>
      {children}
    </div>
  );
}
