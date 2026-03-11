export interface PortfolioItem {
    id: string;
    name: string;
    body: string;
    client: string;
    date: Date;
    video?: string;
    tags: string[];
    images: string[];
    index?: number;
}