import { useQuery } from "@tanstack/react-query";
import { fetchPublicBoard, type TrelloBoard } from "@/lib/trello";
import { TRELLO_CONFIG } from "@/config/trello";

export function useTrelloBoard(boardId: string) {
  return useQuery<TrelloBoard, Error>({
    queryKey: ["trello-board", boardId],
    queryFn: () => fetchPublicBoard(boardId),
    refetchInterval: TRELLO_CONFIG.refreshIntervalMs,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 30_000,
    enabled: !!boardId && !boardId.startsWith("REPLACE_"),
  });
}
