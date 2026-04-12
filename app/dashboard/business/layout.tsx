import { RazorpayScript } from "@/components/shared/razorpay-script";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <RazorpayScript />
    </>
  );
}
