// src/components/WideAuthCard.jsx
export default function WideAuthCard({ title, subtitle, children, imageSrc="/img/flowers.png" }) {
  return (
    <div className="min-h-screen grid place-items-center bg-[#0b0b0c] px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,.25)] overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left image pane */}
          <div className="hidden md:block bg-[#f6f6f6]">
            <img src={imageSrc} alt="" className="h-full w-full object-cover object-center" />
          </div>

          {/* Right form pane */}
          <div className="p-8 md:p-12">
            <h1 className="text-2xl font-extrabold tracking-wide text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

