// Nghe thử một đoạn ngắn bằng nhiều model ElevenLabs trước khi đọc cả phim.
// node --env-file=D:/lamvideo/.env tools/eleven-thu.mjs eleven_v3 eleven_v4
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { createWriteStream, mkdirSync } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const VOICE_ID = 'HXqqNj3PDxRdHVH1pXog'; // Trung Lê Quốc
const TEXT = `Đến ngày thứ bảy, lối xuống bến đã khuất dưới nước. Từ cửa sổ gác nhỏ, Linh nhìn về phía bến.

[curious] “Bố ơi, ở đây mưa nhỏ lại rồi, sao nước vẫn lên? Nó có lên tới chỗ mình ngồi không?”

An ngồi xuống cạnh con, trải tấm bản đồ công việc lên bàn thấp trên gác.

[reassuring] “Tại vì trên núi còn mưa, nước ở đó vẫn chảy xuống đây. Chỗ mình nhẹ mưa rồi, nhưng sông chưa rút ngay được.”

[softly] “Con sợ lúc con ngủ thì bố mẹ đi mất.”`;

const models = process.argv.slice(2);
if (!models.length) throw new Error('Ghi tên model, ví dụ: eleven_v3 eleven_v4');

const outDir = 'what-if-studio/out/thu-giong';
mkdirSync(outDir, { recursive: true });
const client = new ElevenLabsClient();

for (const modelId of models) {
  const out = `${outDir}/${modelId}.mp3`;
  const audio = await client.textToSpeech.convert(VOICE_ID, { text: TEXT, modelId, languageCode: 'vi' });
  await pipeline(Readable.fromWeb(audio), createWriteStream(out));
  console.log(`${modelId}: ${out}`);
}
console.log(`${TEXT.length} ký tự mỗi model`);
