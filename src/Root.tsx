import React from "react";
import { Composition } from "remotion";
import { FPS, HEIGHT, WIDTH } from "./brand";
import { loadFonts } from "./fonts";
import { Short, type ShortProps } from "./Short";
import { ExplainShort, EXPLAIN_H, EXPLAIN_W } from "./ExplainShort";
import { buildTimings, loadCredits, loadManifest, totalFrames } from "./timing";
import { videos } from "./videos";

loadFonts();

export const RemotionRoot: React.FC = () => (
  <>
    {videos.map((script) => {
      const fallback = buildTimings(script, null);
      const explain = script.format === "explain";
      return (
        <Composition
          key={script.id}
          id={script.id}
          component={(explain ? ExplainShort : Short) as React.FC<ShortProps>}
          fps={FPS}
          width={explain ? EXPLAIN_W : WIDTH}
          height={explain ? EXPLAIN_H : HEIGHT}
          durationInFrames={totalFrames(fallback)}
          defaultProps={{ script, timings: fallback } satisfies ShortProps}
          calculateMetadata={async ({ props }) => {
            // Có giọng đọc thật thì lấy đúng độ dài từng câu, chưa có thì ước tính.
            const manifest = await loadManifest(props.script);
            const timings = buildTimings(props.script, manifest);
            const credits = await loadCredits(props.script);
            return { durationInFrames: totalFrames(timings), props: { ...props, timings, credits } };
          }}
        />
      );
    })}
  </>
);
