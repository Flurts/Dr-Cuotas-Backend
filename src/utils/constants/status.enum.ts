import { registerEnumType } from "type-graphql";

export enum Status {
  Active = "Active",
  Inactive = "Inactive",
  Blocked = "Blocked",
  Deleted = "Deleted"
}

// Register user status enum with TypeGraphQL
registerEnumType(Status, {
  name: "Status",
  description: "List of available status"
});

export enum Adjudicated_Status {
  Active = "Active",
  Verified = "Verified",
  Validating = "Validating",
  Rejected = "Rejected",
  Blocked = "Blocked"
}

// Register adjudicated status enum with TypeGraphQL
registerEnumType(Adjudicated_Status, {
  name: "Adjudicated_Status",
  description: "List of available adjudicated status"
});

export enum Payment_Status {
  Pending = "Pending",
  Paid = "Paid",
  Proximity = "Proximity",
  Rejected = "Rejected",
  Canceled = "Canceled"
}

// Register payment status enum with TypeGraphQL
registerEnumType(Payment_Status, {
  name: "Payment_Status",
  description: "List of available payment status"
});

export enum SocialMedia {
  Facebook = "Facebook",
  Twitter = "Twitter",
  Instagram = "Instagram",
  LinkedIn = "LinkedIn",
  YouTube = "YouTube",
  WhatsApp = "WhatsApp",
  Telegram = "Telegram",
  Pinterest = "Pinterest",
  Snapchat = "Snapchat",
  TikTok = "TikTok"
}

// Register social media enum with TypeGraphQL
registerEnumType(SocialMedia, {
  name: "SocialMedia",
  description: "List of available social media"
});
