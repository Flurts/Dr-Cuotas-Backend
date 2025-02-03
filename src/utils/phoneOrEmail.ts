export default function phoneOrEmail(phoneEmail: string): {
  isPhoneNumber: boolean;
  isEmailAddress: boolean;
} {
  const isPhoneNumber = /^\d{10}$/.test(phoneEmail.replace(/[-()\s]/g, ""));
  const isEmailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phoneEmail);
  return { isPhoneNumber, isEmailAddress };
}
