"use client";

import * as React from "react";

type WorkerMessage<TResult> =
  | { type: "progress"; fraction: number }
  | { type: "done"; result: TResult }
  | { type: "error"; message: string };

/**
 * Generic bridge to a dedicated Web Worker so heavy parsing/rendering never
 * blocks the UI thread. Each tool passes its own `createWorker` factory
 * (`() => new Worker(new URL("../../lib/workers/x.worker.ts", import.meta.url))`)
 * so its libraries only load into that worker's own chunk — never the main bundle.
 */
export function useToolWorker<TRequest, TResult>(createWorker: () => Worker) {
  const workerRef = React.useRef<Worker | null>(null);

  React.useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  function run(
    request: TRequest,
    onProgress?: (fraction: number) => void,
    transfer?: Transferable[]
  ): Promise<TResult> {
    workerRef.current?.terminate();
    const worker = createWorker();
    workerRef.current = worker;

    return new Promise<TResult>((resolve, reject) => {
      worker.onmessage = (event: MessageEvent<WorkerMessage<TResult>>) => {
        const data = event.data;
        if (data.type === "progress") {
          onProgress?.(data.fraction);
        } else if (data.type === "done") {
          resolve(data.result);
          worker.terminate();
        } else if (data.type === "error") {
          reject(new Error(data.message));
          worker.terminate();
        }
      };
      worker.onerror = (event) => {
        reject(new Error(event.message || "Background processing failed unexpectedly."));
        worker.terminate();
      };
      worker.postMessage(request, transfer ?? []);
    });
  }

  return { run };
}
