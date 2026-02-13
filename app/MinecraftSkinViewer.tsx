"use client";
import { useEffect, useRef } from "react";
import * as skinview3d from "skinview3d";

type Props = {
  ign: string;
};

export default function MinecraftSkinViewer({ ign }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";

    const viewer = new skinview3d.SkinViewer({
      canvas,
      width: container.clientWidth,
      height: container.clientHeight,
    });

    viewer.renderer.setClearColor(0x000000, 0);

    viewer.loadSkin(`https://minotar.net/skin/${ign}`).then(() => {
      const player = (viewer as any).player;
      if (!player) return;

      // 🔥 FORCE PERFECT FULL BODY VIEW
      viewer.camera.position.set(0, 18, 75); // ← zoomed OUT more
      viewer.camera.lookAt(0, 18, 0);
      viewer.camera.fov = 25; // smaller = more zoomed out
      viewer.camera.updateProjectionMatrix();

      const animate = () => {
        player.rotation.y += 0.01;
        viewer.render();
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    });

    container.appendChild(canvas);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      viewer.dispose();
    };
  }, [ign]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ minWidth: "220px", minHeight: "320px" }}
    />
  );
}
