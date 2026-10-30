/** Transforme un flux SSE (Server-Sent Events) en flux de charges utiles `data:`. */
export function sseData(body: ReadableStream<Uint8Array>): ReadableStream<string> {
  const decoder = new TextDecoder();
  let buffer = '';
  return body.pipeThrough(
    new TransformStream<Uint8Array, string>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() ?? '';
        for (const ev of events) emit(ev, controller);
      },
      flush(controller) {
        buffer += decoder.decode();
        if (buffer.trim()) emit(buffer, controller);
      },
    }),
  );
}

function emit(event: string, controller: TransformStreamDefaultController<string>) {
  const data = event
    .split(/\r?\n/)
    .filter((l) => l.startsWith('data:'))
    .map((l) => l.slice(5).replace(/^ /, ''))
    .join('\n');
  if (data) controller.enqueue(data);
}

/** Applique `pick` à chaque événement JSON et ne garde que les morceaux de texte non vides. */
export function mapJsonEvents(stream: ReadableStream<string>, pick: (json: any) => string | undefined): ReadableStream<string> {
  return stream.pipeThrough(
    new TransformStream<string, string>({
      transform(data, controller) {
        if (data === '[DONE]') return;
        try {
          const text = pick(JSON.parse(data));
          if (text) controller.enqueue(text);
        } catch {
          // événement non JSON (commentaire, keep-alive) : ignoré
        }
      },
    }),
  );
}
