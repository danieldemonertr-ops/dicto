"use client";

import React from "react";

export function TestimonialSection() {
  return (
    <section
      className="py-20 px-4"
      style={{ background: "#ffffff" }}
    >
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
        {/* Stars */}
        <div className="flex items-center gap-1 mb-7">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="#1D9E75"
              aria-hidden
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Quote */}
        <blockquote
          className="text-2xl sm:text-3xl font-medium leading-snug mb-8"
          style={{ color: "#111312" }}
        >
          "Na semana da minha entrevista eu pratiquei todo dia no Dicto.{" "}
          <strong style={{ color: "#1D9E75" }}>
            Quando chegou a hora de verdade, parecia que já tinha feito aquilo antes.
          </strong>{" "}
          Passei para o estágio que eu mais queria."
        </blockquote>

        {/* Avatar + author */}
        <div className="flex flex-col items-center gap-2">
          {/* Avatar placeholder com iniciais */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-semibold"
            style={{ background: "#1D9E75" }}
            aria-label="Foto de Mariana Costa"
          >
            MC
          </div>
          <p className="font-semibold text-sm" style={{ color: "#111312" }}>
            Mariana Costa
          </p>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            Estudante de Administração — USP
          </p>
        </div>
      </div>
    </section>
  );
}
