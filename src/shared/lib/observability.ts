type ErrorPayload = {
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
};

const monitoringEndpoint = import.meta.env.VITE_MONITORING_ENDPOINT as
  | string
  | undefined;
const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as
  | string
  | undefined;

export function initializeObservability() {
  window.addEventListener('error', (event) => {
    captureException(event.error ?? new Error(event.message), {
      source: 'window.error',
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    captureException(toError(event.reason), {
      source: 'window.unhandledrejection',
    });
  });
}

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
) {
  const normalized = toError(error);

  console.error('Application error', normalized, context);

  if (!monitoringEndpoint) {
    return;
  }

  sendJson(monitoringEndpoint, {
    context,
    message: normalized.message,
    stack: normalized.stack,
  } satisfies ErrorPayload);
}

export function trackPageView(path: string) {
  if (!analyticsEndpoint) {
    return;
  }

  sendJson(analyticsEndpoint, {
    event: 'page_view',
    path,
    title: document.title,
    timestamp: new Date().toISOString(),
  });
}

function sendJson(endpoint: string, payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      endpoint,
      new Blob([body], { type: 'application/json' }),
    );
    return;
  }

  void fetch(endpoint, {
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    keepalive: true,
    method: 'POST',
  });
}

function toError(value: unknown) {
  if (value instanceof Error) {
    return value;
  }

  return new Error(typeof value === 'string' ? value : 'Unknown error');
}
