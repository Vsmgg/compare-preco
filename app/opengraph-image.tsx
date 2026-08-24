import { ImageResponse } from "next/og";

export const alt = "Compare Preço — Encontre o melhor preço na internet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0a",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            left: 260,
            width: 820,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(229,9,20,0.35) 0%, rgba(229,9,20,0) 70%)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              background: "#e50914",
              display: "flex",
            }}
          />
          <span style={{ fontSize: 34, fontWeight: 700, color: "#a1a1aa", letterSpacing: -0.5 }}>
            Compare Preço
          </span>
        </div>

        <div style={{ display: "flex", marginTop: 36 }}>
          <span
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: -2,
            }}
          >
            Compare antes
          </span>
        </div>
        <div style={{ display: "flex" }}>
          <span
            style={{
              fontSize: 76,
              fontWeight: 700,
              background: "linear-gradient(135deg, #ff2d38, #e50914)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.1,
              letterSpacing: -2,
            }}
          >
            de comprar.
          </span>
        </div>

        <div style={{ display: "flex", marginTop: 28 }}>
          <span style={{ fontSize: 30, color: "#a1a1aa", maxWidth: 820 }}>
            A IA pesquisa a internet e compara preço, avaliação, entrega e confiabilidade para você.
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
