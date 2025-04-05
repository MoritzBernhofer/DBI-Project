import type { Binary, ObjectId } from "mongodb";

export const BLOG_ENTRIES_COLLECTION = "blogEntries";
export type BlogEntry = {
  title: string;
  authorIds: ObjectId[];
  description: string;
  category:
    | "news"
    | "fashion"
    | "fitness"
    | "diy"
    | "infographics"
    | "listicles"
    | "case studies"
    | "interviews"
    | "business"
    | "romance"
    | "other";
  creationDate: Date;
  editDate: Date;
  impressionCount: number;
  contentElements: ((
    | {
        type: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "text";
        content: string;
      }
    | {
        type: "image";
        content: { image: Binary; alt: string };
      }
    | {
        type: "link";
        content: { displayText: string; href: string };
      }
  ) & { isInline: boolean })[];
  commentsAllowed: boolean;
  comments: Comment[]; // first five only
};

export const BLOG_USERS_COLLECTION = "blogUsers";
export type BlogUser = {
  username: string; // unique
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string | null; // base64,
  passwordHash: string;
};

export const BLOG_COMMENTS_COLLECTION = "blogComments";
export type BlogComment = {
  blogId: ObjectId;
  authorId: ObjectId;
  text: string;
  creationDate: Date;
};
