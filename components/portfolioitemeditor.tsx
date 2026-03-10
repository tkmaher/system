"use client";
import { useState } from "react";
import { PortfolioItem } from "@/components/types/portfolio";

const API_BASE = "https://blue-river-ebb7.tomaszkkmaher.workers.dev";

export default function PortfolioItemEditor({ item }: { item: PortfolioItem }) {
    const isNew = item.id === "";

    const [updating, setUpdating] = useState(false);
    const [body,   setBody]   = useState(item.body);
    const [name,   setName]   = useState(item.name);
    const [date,   setDate]   = useState<Date>(item.date);
    const [client, setClient] = useState(item.client);
    const [tags,   setTags]   = useState<string[]>(item.tags);

    const [orderedList, setOrderedList] = useState(
        item.images.map(url => ({ type: "existing", value: url, file: new Blob(), fname: "" }))
    );
    const [deleted, setDeleted] = useState<string[]>([]);

    // ── Single submit handler ─────────────────────────────────────────────
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        if (name.trim() === "") { alert("Project name cannot be empty."); return; }
        if (updating) return;
        setUpdating(true);

        // Build FormData — used for both create and edit so file uploads are
        // always handled in the same request as the metadata update.
        const formData = new FormData();
        formData.append("name",   name.trim());
        formData.append("body",   body);
        formData.append("client", client);
        formData.append("date",   date instanceof Date ? date.toISOString().slice(0, 10) : String(date));
        formData.append("tags",   tags.join(","));
        formData.append("delete", JSON.stringify(deleted));

        // Attach file blobs for new images and mark their fname keys
        const annotatedOrder = orderedList.map((entry, i) => {
            if (entry.type === "new") {
                const fname = `file_${i}`;
                formData.append(fname, entry.file, (entry.file as File).name ?? fname);
                return { ...entry, fname };
            }
            return entry;
        });
        formData.append("order", JSON.stringify(annotatedOrder));

        // Route: no ID → POST /api/portfolio (PortfolioAdd)
        //        has ID → POST /api/portfolio/:id (PortfolioEdit)
        const url = isNew
            ? `${API_BASE}/api/portfolio`
            : `${API_BASE}/api/portfolio/${item.id}`;

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
                // NOTE: do NOT set Content-Type manually — the browser must set the
                // multipart boundary automatically when sending FormData.
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error((err as any).error ?? `HTTP ${response.status}`);
            }

            alert(`${name} ${isNew ? "created" : "updated"} successfully!`);
            window.location.reload();
        } catch (err: any) {
            console.error(err);
            alert(`Error: ${err.message}`);
            setUpdating(false);
        }
    };

    // ── File picker ───────────────────────────────────────────────────────
    const handleFileChange = (event: any) => {
        const newItems: { type: string; value: string; file: Blob; fname: string }[] = [];
        for (let i = 0; i < event.target.files.length; i++) {
            const file = event.target.files[i];
            if (file) {
                newItems.push({ type: "new", value: URL.createObjectURL(file), file, fname: "" });
            }
        }
        setOrderedList(old => [...old, ...newItems]);
    };

    // ── Image row ─────────────────────────────────────────────────────────
    function ImageRow({ url, index }: { url: string; index: number }) {
        function swapElts(i: number, j: number) {
            const updated = [...orderedList];
            [updated[i], updated[j]] = [updated[j], updated[i]];
            setOrderedList(updated);
        }

        function removeImage(idx: number) {
            const entry = orderedList[idx];
            if (entry.type === "existing") setDeleted(d => [...d, entry.value]);
            setOrderedList(list => list.filter((_, i) => i !== idx));
        }

        return (
            <>
                <img style={{ height: "50px", padding: "2px", margin: "5px" }} src={url} alt="" />
                {index > 0 && (
                    <button type="button" onClick={() => swapElts(index, index - 1)}>Move Up</button>
                )}
                {index < orderedList.length - 1 && (
                    <button type="button" onClick={() => swapElts(index, index + 1)}>Move Down</button>
                )}
                <button type="button" onClick={() => removeImage(index)}>Remove</button>
            </>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <span style={{ margin: "2px" }}>{name}</span>
            <div className="project-editor">
                <input
                    type="text"
                    placeholder="Name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    className="last-input"
                    type="date"
                    value={date instanceof Date ? date.toISOString().slice(0, 10) : String(date)}
                    onChange={(e) => setDate(new Date(e.target.value))}
                />
                <p>
                    {tags.map((tag, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setTags(tags.filter(t => t !== tag))}
                        >
                            {tag}
                        </button>
                    ))}
                    <input
                        type="text"
                        placeholder="Add tag"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
                                setTags([...tags, e.currentTarget.value.trim()]);
                                e.currentTarget.value = "";
                                e.preventDefault();
                            }
                        }}
                    />
                </p>
                <textarea
                    placeholder="Description (Supports Markdown)"
                    name="description"
                    style={{ width: "100%", height: "100px" }}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Client"
                    name="client"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                />
                <br /><br />

                {orderedList.length === 0 && <div>No images uploaded yet.</div>}
                {orderedList.map((entry, index) => (
                    <ImageRow key={index} url={entry.value} index={index} />
                ))}

                <input type="file" accept="image/*" onChange={handleFileChange} multiple />
                <br />
                <button type="submit">{updating ? "Saving..." : "Save changes"}</button>
            </div>
        </form>
    );
}
