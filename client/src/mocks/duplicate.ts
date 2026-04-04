import type { Duplicate } from "@/types/upload";

export const duplicate: Duplicate = {
  total: 3,
  newCount: 2,
  duplicateCount: 1,
  sample: [
    {
      id: 0,
      old: {
        postId: 5,
        id: 0,
        name: "User Name 1000",
        email: "user100@example.com",
        body: "This is a sample comment body for record 100.",
      },
      new: {
        postId: 5,
        id: 0,
        name: "User Name 100",
        email: "user100@example.com",
        body: "This is a sample comment body for record 100.",
      },
    },
  ],
};
