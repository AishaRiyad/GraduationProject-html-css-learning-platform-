import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCertificate } from "../../quizApi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function CertificatePage() {
  const { topic } = useParams(); // "html" or "css"
  const normalizedTopic = (topic || "html").toLowerCase();

  const [state, setState] = useState({
    loading: true,
    finished: false,
    cert: null,
    error: null,
  });

  const certRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCertificate(normalizedTopic);

        if (!data.ok) {
          setState({
            loading: false,
            finished: false,
            cert: null,
            error: data.message || "Error loading certificate",
          });
        } else {
          setState({
            loading: false,
            finished: data.finished,
            cert: data.certificate || null,
            error: null,
          });
        }
      } catch (err) {
        setState({
          loading: false,
          finished: false,
          cert: null,
          error: err.message,
        });
      }
    })();
  }, [normalizedTopic]);

  async function handleDownloadPdf() {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${normalizedTopic}-certificate.pdf`);
  }

  if (state.loading) {
    return (
      <div className="quiz-theme min-h-screen flex items-center justify-center">
        Loading certificate...
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="quiz-theme min-h-screen flex items-center justify-center text-red-600">
        {state.error}
      </div>
    );
  }

  if (!state.finished || !state.cert) {
    return (
      <div className="quiz-theme min-h-screen flex items-center justify-center">
        <div className="bg-white/90 rounded-2xl shadow-xl px-10 py-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Quiz Not Completed Yet</h2>
          <p className="text-gray-700">
            Please complete all {normalizedTopic.toUpperCase()} levels to unlock your official certificate.
          </p>
        </div>
      </div>
    );
  }

  const { name, completedAt } = state.cert;
  const title =
    normalizedTopic === "css"
      ? "CSS Mastery Certificate"
      : "HTML Mastery Certificate";

  return (
    <div className="quiz-theme min-h-screen flex flex-col items-center justify-center gap-6 py-8 px-4">
      {/* Certificate Card */}
      <div
        ref={certRef}
        className="relative bg-[#faf5e6] max-w-4xl w-full aspect-[1.41/1]  // A4 ratio تقريبًا
                   border-[10px] border-yellow-500 rounded-[32px] shadow-2xl 
                   flex items-center justify-center overflow-hidden"
      >
        {/* Inner border */}
        <div className="absolute inset-4 border-[3px] border-yellow-300 rounded-[24px]" />

        {/* Decorative circles */}
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-yellow-200/40 rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-yellow-100/70 rounded-full" />

        {/* Content */}
        <div className="relative z-10 text-center px-10">
          <h1 className="text-[26px] tracking-[0.25em] uppercase text-yellow-800 font-extrabold mb-4">
            Certificate of Completion
          </h1>

          <p className="text-sm text-gray-700 mb-2">
            This certificate is proudly presented to
          </p>

          <div className="text-3xl font-extrabold text-yellow-900 mb-3">
            {name}
          </div>

          <p className="text-sm text-gray-700 mb-6">
            for successfully completing all required levels of the
            <span className="font-semibold">
              {" "}
              {normalizedTopic.toUpperCase()} Quiz Journey
            </span>
            . Your effort, consistency, and curiosity in learning web
            development are truly appreciated.
          </p>

          <div className="mt-4 mb-6">
            <span className="inline-block px-6 py-2 rounded-full border border-yellow-500 text-xs tracking-[0.25em] uppercase text-yellow-800 font-semibold bg-yellow-50">
              {title}
            </span>
          </div>

          <div className="flex justify-between items-end mt-8 text-xs text-gray-700">
            <div className="text-left">
              <div className="font-semibold text-gray-800 mb-1">Completion Date</div>
              <div>{new Date(completedAt).toLocaleDateString()}</div>
            </div>
            <div className="text-center">
              <div className="w-32 border-t border-gray-500 mx-auto mb-1" />
              <div className="font-semibold text-gray-800">Instructor</div>
              <div className="text-[11px]">HTML & CSS Learning Platform</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-800 mb-1">Certificate ID</div>
              <div>#{state.cert.userId}-{normalizedTopic.toUpperCase()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownloadPdf}
        className="px-6 py-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-md"
      >
        Download as PDF
      </button>
    </div>
  );
}
