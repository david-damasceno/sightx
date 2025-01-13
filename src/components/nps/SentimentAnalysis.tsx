import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

const mockFeedback = [
  {
    id: 1,
    comment: "Excelente atendimento, muito satisfeito com o serviço!",
    sentiment: "positive",
    score: 9,
    date: "2024-03-10"
  },
  {
    id: 2,
    comment: "Produto de qualidade, mas o prazo de entrega poderia melhorar.",
    sentiment: "neutral",
    score: 7,
    date: "2024-03-09"
  },
  {
    id: 3,
    comment: "Tive problemas com o suporte técnico.",
    sentiment: "negative",
    score: 4,
    date: "2024-03-08"
  }
];

export function SentimentAnalysis() {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "neutral":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "negative":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
    }
  };

  return (
    <Card className="p-6 glass-card">
      <div className="mb-4">
        <h3 className="font-semibold">Análise de Sentimento</h3>
        <p className="text-sm text-muted-foreground">Feedback qualitativo dos clientes</p>
      </div>
      <div className="space-y-4">
        {mockFeedback.map((item) => (
          <Card key={item.id} className="p-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {item.sentiment === "positive" ? (
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                  ) : item.sentiment === "negative" ? (
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-yellow-500" />
                  )}
                  <Badge variant="secondary" className={getSentimentColor(item.sentiment)}>
                    Score: {item.score}
                  </Badge>
                </div>
                <p className="text-sm">{item.comment}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}