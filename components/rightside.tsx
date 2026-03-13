"use client";

import { PortfolioItem } from "./types/portfolio";

export default function Rightside({ id, item }: { id: number, item: PortfolioItem }) {

    function Tag({ name }: { name: string }) {
        return (
            <div className="tag pointer-events-none" onClick={()=> {
              
            }}>
                <div className="float-left">
                    ×
                </div>
                <div className="float-right">
                    {name}
                </div>
                
            </div>
        )
    }

    return (
        <div className="rightside">
            <img src={item.images[0]}/>
            <div>title: {item.name}</div>
            <div>client: {item.client}</div>
            <br/>
            <div>{item.body}</div>
            <div className="flex flex-row smaller mt-1.5">
                {item.tags.map((tag, i) => (
                    <Tag name={tag} key={i}/>
                ))}
            </div>
        </div>
    )
}