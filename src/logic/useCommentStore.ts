import { create } from "zustand";

type DraftsByCatchId = Record<string, string>;

type CommentStore = {
  commentsByCatchId: DraftsByCatchId;
  setCommentText: (catchId: string, comment: string) => void;
  clearCommentText: (catchId: string) => void;
};

export const useCommentStore = create<CommentStore>((set) => ({
  commentsByCatchId: {},
  setCommentText(catchId, comment) {
    set((state) => ({
      commentsByCatchId: {
        ...state.commentsByCatchId,
        [catchId]: comment,
      },
    }));
  },
  clearCommentText(catchId) {
    set((state) => {
      const nextComments = { ...state.commentsByCatchId };
      delete nextComments[catchId];

      return { commentsByCatchId: nextComments };
    });
  },
}));
