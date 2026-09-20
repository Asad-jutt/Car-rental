import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export interface TestimonialAuthor {
  name: string;
  handle: string;
  avatar: string;
}

export interface TestimonialCardProps {
  author: TestimonialAuthor;
  text: string;
  href?: string;
  className?: string;
}

export function TestimonialCard({ author, text, href, className }: TestimonialCardProps) {
  const Card = href ? "a" : "div";

  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "flex max-w-[300px] shrink-0 flex-col rounded-lg border-t border-border",
        "bg-gradient-to-b from-muted/50 to-muted/10",
        "p-4 text-start sm:max-w-[320px] sm:p-6",
        "hover:from-muted/60 hover:to-muted/20",
        "transition-colors duration-300",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border border-[#2a2a2a]">
          <AvatarImage src={author.avatar} alt={author.name} />
        </Avatar>
        <div className="flex min-w-0 flex-col items-start">
          <h3 className="font-headline text-xs font-bold uppercase tracking-tight text-foreground">
            {author.name}
          </h3>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-primary">
            {author.handle}
          </p>
        </div>
      </div>
      <p className="mt-4 font-editorial text-sm leading-relaxed text-muted-foreground">{text}</p>
    </Card>
  );
}