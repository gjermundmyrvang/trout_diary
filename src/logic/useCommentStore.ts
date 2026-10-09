import { create } from "zustand";

type Comment = {
  comment: string;
  setCommentText: (c: string) => void;
};

export const useCommentStore = create<Comment>((set) => ({
  comment: "",
  setCommentText(comment) {
    set({ comment });
  },
}));
