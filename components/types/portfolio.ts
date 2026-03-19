export interface PortfolioItem {
    id: string;
    name: string;
    body: string;
    client: string;
    date: Date;
    video_url?: string;
    tags: string[];
    images: string[];
    index?: number;
    link: string;
}