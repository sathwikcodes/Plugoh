declare global {
  interface RazorpayFailureEvent {
    error?: {
      description?: string;
    };
  }

  interface RazorpayInstance {
    open(): void;
    on(
      event: "payment.failed",
      callback: (event: RazorpayFailureEvent) => void,
    ): void;
  }

  interface Window {
    Razorpay: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

export {};
