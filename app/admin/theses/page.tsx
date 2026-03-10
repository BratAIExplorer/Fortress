
import { getTheses } from "@/app/actions";
import ThesisEditor from "@/components/admin/ThesisEditor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminThesesPage() {
    const theses = await getTheses();

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-serif tracking-tight">Theses Management</h1>
                    <CardDescription>Review and refine investment arguments for your conviction list.</CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {theses.length} Active Theses
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {theses.map((thesis: any) => (
                    <Card key={thesis.id} className="border-border/50 hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-3 text-left">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="font-mono">{thesis.stockSymbol}</Badge>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">v5 Qualified</span>
                            </div>
                            <CardTitle className="text-base line-clamp-1">{thesis.stockName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ThesisEditor thesis={thesis} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
